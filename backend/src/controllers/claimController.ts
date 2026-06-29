import { Request, Response } from 'express';
import db from '../config/database';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export const createClaim = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { itemId } = req.params;
    const { claimMessage } = req.body;

    if (!userId) {
      return errorResponse(res, '未授权', 401);
    }

    const item = db.prepare('SELECT * FROM items WHERE id = ? AND status = \'pending\'').get(itemId) as any;

    if (!item) {
      return errorResponse(res, '物品不存在或已被招领', 404);
    }

    if (item.user_id === userId) {
      return errorResponse(res, '不能招领自己发布的物品', 400);
    }

    const existingClaim = db.prepare('SELECT * FROM claims WHERE item_id = ? AND claimer_id = ?').get(itemId, userId);

    if (existingClaim) {
      return errorResponse(res, '您已经申请招领该物品', 400);
    }

    const result = db.prepare('INSERT INTO claims (item_id, claimer_id, claim_message) VALUES (?, ?, ?)').run(itemId, userId, claimMessage || null);

    db.prepare(`INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'claim')`).run(item.user_id, '有人申请招领您的物品', `有用户申请招领您发布的物品：${item.title}`);

    return successResponse(res, {
      claimId: result.lastInsertRowid,
      itemId
    }, '申请招领成功');
  } catch (error) {
    console.error('申请招领错误:', error);
    return errorResponse(res, '申请招领失败', 500);
  }
};

export const getClaims = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { status } = req.query;

    if (!userId) {
      return errorResponse(res, '未授权', 401);
    }

    let sql = `
      SELECT c.*, i.title, i.description, i.category, i.location, i.image_url,
             u.username as claimer_name, u.email as claimer_email
      FROM claims c
      JOIN items i ON c.item_id = i.id
      JOIN users u ON c.claimer_id = u.id
      WHERE i.user_id = ?
    `;
    const params: any[] = [userId];

    if (status) {
      sql += ' AND c.status = ?';
      params.push(String(status));
    }

    sql += ' ORDER BY c.created_at DESC';

    const claims = db.prepare(sql).all(...params);

    return successResponse(res, claims);
  } catch (error) {
    console.error('获取招领申请错误:', error);
    return errorResponse(res, '获取招领申请失败', 500);
  }
};

export const getMyClaims = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { status } = req.query;

    if (!userId) {
      return errorResponse(res, '未授权', 401);
    }

    let sql = `
      SELECT c.*, i.title, i.description, i.category, i.location, i.image_url,
             u.username as owner_name, u.email as owner_email
      FROM claims c
      JOIN items i ON c.item_id = i.id
      JOIN users u ON i.user_id = u.id
      WHERE c.claimer_id = ?
    `;
    const params: any[] = [userId];

    if (status) {
      sql += ' AND c.status = ?';
      params.push(String(status));
    }

    sql += ' ORDER BY c.created_at DESC';

    const claims = db.prepare(sql).all(...params);

    return successResponse(res, claims);
  } catch (error) {
    console.error('获取我的招领申请错误:', error);
    return errorResponse(res, '获取我的招领申请失败', 500);
  }
};

export const approveClaim = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { claimId } = req.params;

    if (!userId) {
      return errorResponse(res, '未授权', 401);
    }

    const claim = db.prepare(`
      SELECT c.*, i.user_id as owner_id, i.title, i.id as item_id
      FROM claims c
      JOIN items i ON c.item_id = i.id
      WHERE c.id = ?
    `).get(claimId) as any;

    if (!claim) {
      return errorResponse(res, '招领申请不存在', 404);
    }

    if (claim.owner_id !== userId) {
      return errorResponse(res, '无权限操作', 403);
    }

    if (claim.status !== 'pending') {
      return errorResponse(res, '该申请已处理', 400);
    }

    db.prepare('BEGIN TRANSACTION').run();

    try {
      db.prepare('UPDATE claims SET status = \'approved\' WHERE id = ?').run(claimId);
      db.prepare('UPDATE items SET status = \'claimed\' WHERE id = ?').run(claim.item_id);
      db.prepare('UPDATE claims SET status = \'rejected\' WHERE item_id = ? AND id != ?').run(claim.item_id, claimId);

      db.prepare(`INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'approve')`).run(claim.claimer_id, '您的招领申请已通过', `您申请招领的物品：${claim.title} 已通过审核`);

      db.prepare('COMMIT').run();

      return successResponse(res, null, '招领申请已通过');
    } catch (error) {
      db.prepare('ROLLBACK').run();
      throw error;
    }
  } catch (error) {
    console.error('通过招领申请错误:', error);
    return errorResponse(res, '操作失败', 500);
  }
};

export const rejectClaim = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { claimId } = req.params;

    if (!userId) {
      return errorResponse(res, '未授权', 401);
    }

    const claim = db.prepare(`
      SELECT c.*, i.user_id as owner_id, i.title
      FROM claims c
      JOIN items i ON c.item_id = i.id
      WHERE c.id = ?
    `).get(claimId) as any;

    if (!claim) {
      return errorResponse(res, '招领申请不存在', 404);
    }

    if (claim.owner_id !== userId) {
      return errorResponse(res, '无权限操作', 403);
    }

    if (claim.status !== 'pending') {
      return errorResponse(res, '该申请已处理', 400);
    }

    db.prepare('UPDATE claims SET status = \'rejected\' WHERE id = ?').run(claimId);

    db.prepare(`INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'reject')`).run(claim.claimer_id, '您的招领申请已被拒绝', `您申请招领的物品：${claim.title} 未通过审核`);

    return successResponse(res, null, '招领申请已拒绝');
  } catch (error) {
    console.error('拒绝招领申请错误:', error);
    return errorResponse(res, '操作失败', 500);
  }
};

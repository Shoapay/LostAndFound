import { Request, Response } from 'express';
import db from '../config/database';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export const createItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { title, description, category, location, type } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!userId) {
      return errorResponse(res, '未授权', 401);
    }

    if (!title) {
      return errorResponse(res, '物品名称为必填项');
    }

    const itemType = type || 'found';

    const result = db.prepare('INSERT INTO items (user_id, type, title, description, category, location, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)').run(userId, itemType, title, description || null, category || null, location || null, imageUrl);

    const itemId = result.lastInsertRowid as number;

    return successResponse(res, {
      itemId,
      type: itemType,
      title,
      description,
      category,
      location,
      imageUrl
    }, '发布成功');
  } catch (error) {
    console.error('发布失物错误:', error);
    return errorResponse(res, '发布失败', 500);
  }
};

export const getItems = async (req: Request, res: Response) => {
  try {
    const { status, category, keyword, type, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let sql = `
      SELECT i.*, u.username, u.email 
      FROM items i 
      JOIN users u ON i.user_id = u.id 
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += ' AND i.status = ?';
      params.push(String(status));
    }

    if (category) {
      sql += ' AND i.category = ?';
      params.push(String(category));
    }

    if (type) {
      sql += ' AND i.type = ?';
      params.push(String(type));
    }

    if (keyword) {
      sql += ' AND (i.title LIKE ? OR i.description LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    sql += ' ORDER BY i.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), offset);

    const items = db.prepare(sql).all(...params);

    let countSql = 'SELECT COUNT(*) as total FROM items WHERE 1=1';
    const countParams: any[] = [];

    if (status) {
      countSql += ' AND status = ?';
      countParams.push(String(status));
    }

    if (type) {
      countSql += ' AND type = ?';
      countParams.push(String(type));
    }

    const countResult = db.prepare(countSql).get(...countParams) as any;
    const total = countResult.total;

    return successResponse(res, {
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    });
  } catch (error) {
    console.error('获取失物列表错误:', error);
    return errorResponse(res, '获取失物列表失败', 500);
  }
};

export const getItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const item = db.prepare(`
      SELECT i.*, u.username, u.email, u.phone 
      FROM items i 
      JOIN users u ON i.user_id = u.id 
      WHERE i.id = ?
    `).get(id) as any;

    if (!item) {
      return errorResponse(res, '物品不存在', 404);
    }

    return successResponse(res, item);
  } catch (error) {
    console.error('获取失物详情错误:', error);
    return errorResponse(res, '获取失物详情失败', 500);
  }
};

export const getMyItems = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { status, type } = req.query;

    if (!userId) {
      return errorResponse(res, '未授权', 401);
    }

    let sql = 'SELECT * FROM items WHERE user_id = ?';
    const params: any[] = [userId];

    if (status) {
      sql += ' AND status = ?';
      params.push(String(status));
    }

    if (type) {
      sql += ' AND type = ?';
      params.push(String(type));
    }

    sql += ' ORDER BY created_at DESC';

    const items = db.prepare(sql).all(...params);

    return successResponse(res, items);
  } catch (error) {
    console.error('获取我的失物错误:', error);
    return errorResponse(res, '获取我的失物失败', 500);
  }
};

export const updateItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { title, description, category, location, type } = req.body;

    if (!userId) {
      return errorResponse(res, '未授权', 401);
    }

    const item = db.prepare('SELECT * FROM items WHERE id = ? AND user_id = ?').get(id, userId);

    if (!item) {
      return errorResponse(res, '物品不存在或无权限修改', 404);
    }

    db.prepare('UPDATE items SET title = ?, description = ?, category = ?, location = ?, type = ? WHERE id = ?').run(title, description || null, category || null, location || null, type || 'found', id);

    return successResponse(res, null, '更新成功');
  } catch (error) {
    console.error('更新失物错误:', error);
    return errorResponse(res, '更新失败', 500);
  }
};

export const deleteItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return errorResponse(res, '未授权', 401);
    }

    const item = db.prepare('SELECT * FROM items WHERE id = ? AND user_id = ?').get(id, userId);

    if (!item) {
      return errorResponse(res, '物品不存在或无权限删除', 404);
    }

    db.prepare('DELETE FROM items WHERE id = ?').run(id);

    return successResponse(res, null, '删除成功');
  } catch (error) {
    console.error('删除失物错误:', error);
    return errorResponse(res, '删除失败', 500);
  }
};

export const cancelItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return errorResponse(res, '未授权', 401);
    }

    const item = db.prepare('SELECT * FROM items WHERE id = ? AND user_id = ? AND status = \'pending\'').get(id, userId);

    if (!item) {
      return errorResponse(res, '物品不存在、已招领或无权限取消', 404);
    }

    db.prepare('UPDATE items SET status = \'cancelled\' WHERE id = ?').run(id);

    return successResponse(res, null, '取消成功');
  } catch (error) {
    console.error('取消失物招领错误:', error);
    return errorResponse(res, '取消失败', 500);
  }
};

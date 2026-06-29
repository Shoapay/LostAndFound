import { Request, Response } from 'express';
import db from '../config/database';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { isRead } = req.query;

    if (!userId) {
      return errorResponse(res, '未授权', 401);
    }

    let sql = 'SELECT * FROM notifications WHERE user_id = ?';
    const params: any[] = [userId];

    if (isRead !== undefined) {
      sql += ' AND is_read = ?';
      params.push(isRead === 'true' ? 1 : 0);
    }

    sql += ' ORDER BY created_at DESC LIMIT 50';

    const notifications = db.prepare(sql).all(...params);

    return successResponse(res, notifications);
  } catch (error) {
    console.error('获取通知错误:', error);
    return errorResponse(res, '获取通知失败', 500);
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return errorResponse(res, '未授权', 401);
    }

    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(id, userId);

    return successResponse(res, null, '标记成功');
  } catch (error) {
    console.error('标记通知错误:', error);
    return errorResponse(res, '标记失败', 500);
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return errorResponse(res, '未授权', 401);
    }

    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(userId);

    return successResponse(res, null, '全部标记为已读');
  } catch (error) {
    console.error('标记全部通知错误:', error);
    return errorResponse(res, '标记失败', 500);
  }
};

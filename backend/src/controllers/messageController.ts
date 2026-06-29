import { Request, Response } from 'express';
import db from '../config/database';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const senderId = req.userId;
    const { receiverId, itemId, content } = req.body;

    if (!senderId) {
      return errorResponse(res, '未授权', 401);
    }

    if (!receiverId || !content) {
      return errorResponse(res, '接收者和消息内容为必填项');
    }

    if (senderId === receiverId) {
      return errorResponse(res, '不能给自己发送私信');
    }

    const result = db.prepare('INSERT INTO messages (sender_id, receiver_id, item_id, content) VALUES (?, ?, ?, ?)').run(senderId, receiverId, itemId || null, content);

    const receiver = db.prepare('SELECT username FROM users WHERE id = ?').get(receiverId) as any;

    if (receiver) {
      db.prepare(`INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'system')`).run(
        receiverId,
        '您有新的私信',
        `用户给您发送了一条私信`
      );
    }

    return successResponse(res, {
      messageId: result.lastInsertRowid
    }, '发送成功');
  } catch (error) {
    console.error('发送私信错误:', error);
    return errorResponse(res, '发送失败', 500);
  }
};

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return errorResponse(res, '未授权', 401);
    }

    const conversations = db.prepare(`
      SELECT 
        CASE 
          WHEN m.sender_id = ? THEN m.receiver_id
          ELSE m.sender_id
        END as other_user_id,
        u.username as other_user_name,
        u.email as other_user_email,
        MAX(m.created_at) as last_message_time,
        (SELECT content FROM messages m2 
         WHERE (m2.sender_id = ? AND m2.receiver_id = 
                CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END)
                OR (m2.receiver_id = ? AND m2.sender_id = 
                CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END)
         ORDER BY m2.created_at DESC LIMIT 1) as last_message,
        (SELECT COUNT(*) FROM messages m3 
         WHERE m3.sender_id = 
                CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END
           AND m3.receiver_id = ?
           AND m3.is_read = 0) as unread_count
      FROM messages m
      JOIN users u ON u.id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END
      WHERE m.sender_id = ? OR m.receiver_id = ?
      GROUP BY other_user_id
      ORDER BY last_message_time DESC
    `).all(userId, userId, userId, userId, userId, userId, userId, userId, userId, userId) as any[];

    return successResponse(res, conversations);
  } catch (error) {
    console.error('获取会话列表错误:', error);
    return errorResponse(res, '获取会话列表失败', 500);
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { otherUserId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    if (!userId) {
      return errorResponse(res, '未授权', 401);
    }

    const messages = db.prepare(`
      SELECT m.*, u.username as sender_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE (m.sender_id = ? AND m.receiver_id = ?)
         OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `).all(userId, otherUserId, otherUserId, userId, Number(limit), offset) as any[];

    db.prepare(`
      UPDATE messages 
      SET is_read = 1 
      WHERE sender_id = ? AND receiver_id = ? AND is_read = 0
    `).run(otherUserId, userId);

    return successResponse(res, messages.reverse());
  } catch (error) {
    console.error('获取消息列表错误:', error);
    return errorResponse(res, '获取消息列表失败', 500);
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return errorResponse(res, '未授权', 401);
    }

    const result = db.prepare('SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0').get(userId) as any;

    return successResponse(res, { count: result.count });
  } catch (error) {
    console.error('获取未读消息数错误:', error);
    return errorResponse(res, '获取未读消息数失败', 500);
  }
};

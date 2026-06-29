import { Request, Response } from 'express';
import db from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, phone, password } = req.body;

    if (!username || !email || !password) {
      return errorResponse(res, '用户名、邮箱和密码为必填项');
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);

    if (existingUser) {
      return errorResponse(res, '用户名或邮箱已存在', 409);
    }

    const hashedPassword = await hashPassword(password);

    const result = db.prepare('INSERT INTO users (username, email, phone, password) VALUES (?, ?, ?, ?)').run(username, email, phone || null, hashedPassword);

    const userId = result.lastInsertRowid as number;
    const token = generateToken({ userId, email });

    return successResponse(res, {
      userId,
      username,
      email,
      token
    }, '注册成功');
  } catch (error) {
    console.error('注册错误:', error);
    return errorResponse(res, '注册失败', 500);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, '邮箱和密码为必填项');
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (!user) {
      return errorResponse(res, '用户不存在', 404);
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return errorResponse(res, '密码错误', 401);
    }

    const token = generateToken({ userId: user.id, email: user.email });

    return successResponse(res, {
      userId: user.id,
      username: user.username,
      email: user.email,
      token
    }, '登录成功');
  } catch (error) {
    console.error('登录错误:', error);
    return errorResponse(res, '登录失败', 500);
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return errorResponse(res, '未授权', 401);
    }

    const user = db.prepare('SELECT id, username, email, phone, created_at FROM users WHERE id = ?').get(userId) as any;

    if (!user) {
      return errorResponse(res, '用户不存在', 404);
    }

    return successResponse(res, user);
  } catch (error) {
    console.error('获取用户信息错误:', error);
    return errorResponse(res, '获取用户信息失败', 500);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { username, phone } = req.body;

    if (!userId) {
      return errorResponse(res, '未授权', 401);
    }

    db.prepare('UPDATE users SET username = ?, phone = ? WHERE id = ?').run(username, phone || null, userId);

    return successResponse(res, null, '更新成功');
  } catch (error) {
    console.error('更新用户信息错误:', error);
    return errorResponse(res, '更新失败', 500);
  }
};

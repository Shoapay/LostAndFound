import { Response } from 'express';

export const successResponse = (res: Response, data: any, message: string = '操作成功') => {
  return res.json({
    success: true,
    message,
    data
  });
};

export const errorResponse = (res: Response, message: string, statusCode: number = 400) => {
  return res.status(statusCode).json({
    success: false,
    message
  });
};

import jwt, { SignOptions } from 'jsonwebtoken';
import { JwtPayload } from '../types';

export const generateToken = (payload: JwtPayload): string => {
  const secret = process.env.JWT_SECRET || 'default_secret_key';
  
  const options: SignOptions = {
    expiresIn: 604800
  };
  
  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'default_secret_key';
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    return null;
  }
};

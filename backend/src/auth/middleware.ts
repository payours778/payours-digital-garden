import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import './types'; // 触发 Express.Request 扩展
import { JWT_SECRET } from './';

// 兼容历史令牌：部分旧 token 使用 fallback 值签发，兜底校验
const LEGACY_SECRETS = ['fallback-secret-change-me', 'fish-secret-key'];

function verifyToken(token: string): { id: number; username: string; role: string } | null {
  const candidates = [JWT_SECRET, ...LEGACY_SECRETS];
  for (const secret of candidates) {
    try {
      return jwt.verify(token, secret) as { id: number; username: string; role: string };
    } catch {
      // try next candidate
    }
  }
  return null;
}

// 校验 JWT，把用户信息挂到 req.user
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  const token = authHeader.slice(7);
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: '令牌无效或已过期' });
  }
  req.user = {
    id: decoded.id,
    username: decoded.username,
    role: decoded.role,
  };
  next();
}

// 在 requireAuth 基础上校验 role === 'admin'
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: '需要管理员权限' });
    }
    next();
  });
}

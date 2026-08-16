import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import './types'; // 触发 Express.Request 扩展

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';

// 校验 JWT，把用户信息挂到 req.user
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      username: string;
      role: string;
    };
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    };
    next();
  } catch {
    return res.status(401).json({ error: '令牌无效或已过期' });
  }
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

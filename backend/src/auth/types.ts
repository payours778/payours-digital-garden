import 'express';

// 鉴权相关类型集中声明，未来抽成独立服务时整体搬走即可

export interface UserRow {
  id: number;
  username: string;
  password_hash: string;
  phone: string | null;
  role: string;
  created_at: string;
}

export interface SafeUser {
  id: number;
  username: string;
  phone: string | null;
  role: string;
  created_at: string;
}

export interface JwtPayload {
  id: number;
  username: string;
  role: string;
}

// 扩展 Express Request 类型，挂载当前用户信息
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import getDb from '../db';
import type { UserRow, SafeUser, JwtPayload } from './types';
import { sendSmsCode } from '../utils/sms';
import {
  generateCode, saveCode, verifyCode, checkCooldown,
} from '../utils/smsStore';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const parseUser = (row: any[]): UserRow => ({
  id: row[0],
  username: row[1],
  password_hash: row[2],
  phone: row[3],
  role: row[4],
  created_at: row[5],
});

const toSafeUser = (u: UserRow): SafeUser => ({
  id: u.id,
  username: u.username,
  phone: u.phone,
  role: u.role,
  created_at: u.created_at,
});

const generateToken = (user: UserRow) => {
  const payload: JwtPayload = {
    id: user.id,
    username: user.username,
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
};

const nowBeijing = () =>
  new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);

// 注册
export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, phone } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }
    if (username.length < 2 || username.length > 20) {
      return res.status(400).json({ error: '用户名长度需 2-20 个字符' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: '密码长度不能少于 6 位' });
    }

    const db = await getDb();

    const existing = await db.exec('SELECT id FROM users WHERE username = ?', [username]);
    if (existing[0]?.values?.length) {
      return res.status(409).json({ error: '用户名已存在' });
    }

    if (phone) {
      const phoneExisting = await db.exec('SELECT id FROM users WHERE phone = ?', [phone]);
      if (phoneExisting[0]?.values?.length) {
        return res.status(409).json({ error: '手机号已被注册' });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const now = nowBeijing();

    await db.run(
      'INSERT INTO users (username, password_hash, phone, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [username, passwordHash, phone || null, 'user', now, now]
    );

    const maxIdResult = await db.exec('SELECT MAX(id) FROM users');
    const lastId = maxIdResult[0]?.values?.[0]?.[0] as number;

    const queryResult = await db.exec('SELECT * FROM users WHERE id = ?', [lastId]);
    const row = queryResult[0]?.values?.[0];
    if (!row) {
      return res.status(500).json({ error: '注册失败' });
    }

    const user = parseUser(row);

    const token = generateToken(user);
    res.status(201).json({ user: toSafeUser(user), token });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ error: '注册失败' });
  }
};

// 登录（密码）
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    const db = await getDb();
    const result = await db.exec('SELECT * FROM users WHERE username = ?', [username]);
    const row = result[0]?.values?.[0];

    if (!row) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const user = parseUser(row);
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const token = generateToken(user);
    res.json({ user: toSafeUser(user), token });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ error: '登录失败' });
  }
};

// 获取当前用户信息
export const me = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const db = await getDb();
    const result = await db.exec('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const row = result[0]?.values?.[0];

    if (!row) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({ user: toSafeUser(parseUser(row)) });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
};

// 登出（不做黑名单，前端清 token 即可）
export const logout = async (req: Request, res: Response) => {
  res.json({ message: '已登出' });
};

// 修改密码
export const updatePassword = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: '未认证' });
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: '旧密码和新密码都不能为空' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: '新密码长度不能少于 6 位' });
    }

    const db = await getDb();
    const result = await db.exec('SELECT id, password_hash FROM users WHERE id = ?', [req.user.id]);
    const row = result[0]?.values?.[0];
    if (!row) return res.status(404).json({ error: '用户不存在' });

    const passwordHash = row[1] as string;
    const isMatch = await bcrypt.compare(oldPassword, passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: '旧密码错误' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.run('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?', [newHash, nowBeijing(), req.user.id]);

    res.json({ message: '密码修改成功' });
  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({ error: '修改密码失败' });
  }
};

// 修改手机号
export const updatePhone = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: '未认证' });
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: '手机号不能为空' });
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ error: '手机号格式不正确' });
    }

    const db = await getDb();
    const existing = await db.exec('SELECT id FROM users WHERE phone = ? AND id != ?', [phone, req.user.id]);
    if (existing[0]?.values?.length) {
      return res.status(409).json({ error: '该手机号已被其他账号绑定' });
    }

    await db.run('UPDATE users SET phone = ?, updated_at = ? WHERE id = ?', [phone, nowBeijing(), req.user.id]);

    const refreshed = await db.exec('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const row = refreshed[0]?.values?.[0];
    res.json({ message: '手机号修改成功', user: toSafeUser(parseUser(row)) });
  } catch (error) {
    console.error('修改手机号失败:', error);
    res.status(500).json({ error: '修改手机号失败' });
  }
};

// 注销账户
export const closeAccount = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: '未认证' });
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: '请输入密码确认注销' });
    }

    const db = await getDb();
    const result = await db.exec('SELECT id, password_hash, role FROM users WHERE id = ?', [req.user.id]);
    const row = result[0]?.values?.[0];
    if (!row) return res.status(404).json({ error: '用户不存在' });

    const role = row[2] as string;
    if (role === 'admin') {
      return res.status(403).json({ error: '管理员账号不可注销' });
    }

    const passwordHash = row[1] as string;
    const isMatch = await bcrypt.compare(password, passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: '密码错误' });
    }

    await db.run('DELETE FROM users WHERE id = ?', [req.user.id]);

    res.json({ message: '账户已注销' });
  } catch (error) {
    console.error('注销账户失败:', error);
    res.status(500).json({ error: '注销账户失败' });
  }
};

// 短信登录（手机号 + 验证码）
export const loginBySms = async (req: Request, res: Response) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ error: '手机号和验证码不能为空' });
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ error: '手机号格式不正确' });
    }

    // 校验验证码（一次性）
    const ok = await verifyCode(phone, String(code));
    if (!ok) {
      return res.status(401).json({ error: '验证码错误或已过期' });
    }

    const db = await getDb();

    // 查找用户，不存在则自动注册（用手机号作为用户名）
    const existing = await db.exec('SELECT * FROM users WHERE phone = ?', [phone]);
    let row = existing[0]?.values?.[0];

    if (!row) {
      // 自动注册：用户名取手机号，密码不可用（纯手机号登录用户）
      const randomPassword = crypto.randomBytes(12).toString('hex');
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      const now = nowBeijing();
      await db.run(
        'INSERT INTO users (username, password_hash, phone, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [phone, passwordHash, phone, 'user', now, now]
      );
      const maxIdResult = await db.exec('SELECT MAX(id) FROM users');
      const lastId = maxIdResult[0]?.values?.[0]?.[0];
      const query = await db.exec('SELECT * FROM users WHERE id = ?', [lastId]);
      row = query[0]?.values?.[0];
      if (!row) {
        return res.status(500).json({ error: '注册失败' });
      }
    }

    const user = parseUser(row);
    const token = generateToken(user);
    res.json({ user: toSafeUser(user), token });
  } catch (error) {
    console.error('短信登录失败:', error);
    res.status(500).json({ error: '短信登录失败' });
  }
};

// 发送短信验证码
export const sendSms = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: '手机号不能为空' });
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ error: '手机号格式不正确' });
    }

    // 60s 频率限制
    const wait = await checkCooldown(phone);
    if (wait > 0) {
      return res.status(429).json({ error: `发送过于频繁，请 ${wait} 秒后重试` });
    }

    const code = generateCode();
    await saveCode(phone, code);

    const result = await sendSmsCode(phone, code);
    if (!result.success) {
      console.error('[SMS] 发送失败:', result.code, result.message);
      // 即便失败也返回（验证码已存，若是测试环境可继续）；但正常应提示
      return res.status(500).json({ error: `短信发送失败: ${result.message}` });
    }

    res.json({ message: '验证码已发送' });
  } catch (error) {
    console.error('发送验证码失败:', error);
    res.status(500).json({ error: '发送验证码失败' });
  }
};

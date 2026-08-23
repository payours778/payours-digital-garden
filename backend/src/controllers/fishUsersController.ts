import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDb } from '../db';
import { JWT_SECRET } from '../auth';

const JWT_EXPIRES_IN = '7d';

export async function register(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '账号和密码不能为空' });
    }

    if (username.length < 2 || username.length > 20) {
      return res.status(400).json({ error: '账号长度应在2-20个字符之间' });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: '密码至少4个字符' });
    }

    const db = await getDb();
    const existing = await db.exec('SELECT id FROM fish_users WHERE username = ?', [username]);
    if (existing[0]?.values?.length) {
      return res.status(400).json({ error: '账号已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const ins = await db.run(`INSERT INTO fish_users (username, password) VALUES (?, ?)`, [username, hashedPassword]);
    const userId = Number(ins.lastInsertRowid);
    const token = jwt.sign({ id: userId, username, role: 'user' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(200).json({
      success: true,
      message: '注册成功',
      token,
      user: { id: userId, username }
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ error: '注册失败' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '账号和密码不能为空' });
    }

    const db = await getDb();
    const result = await db.exec('SELECT id, username, password FROM fish_users WHERE username = ?', [username]);
    const row = result[0]?.values?.[0];

    if (!row) {
      return res.status(401).json({ error: '账号或密码错误' });
    }

    const isValid = await bcrypt.compare(password, row[2]);
    if (!isValid) {
      return res.status(401).json({ error: '账号或密码错误' });
    }

    const token = jwt.sign({ id: row[0], username: row[1], role: 'user' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(200).json({
      success: true,
      message: '登录成功',
      token,
      user: { id: row[0], username: row[1] }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ error: '登录失败' });
  }
}

export async function verifyToken(req: Request, res: Response, next: () => void) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未登录' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; username: string };

    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: '登录已失效' });
  }
}
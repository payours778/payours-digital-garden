import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDb, saveDb } from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'fish-secret-key';
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
    const stmt = db.prepare('SELECT id FROM fish_users WHERE username = ?');
    stmt.bind([username]);
    let existingUser: any[] | null = null;
    if (stmt.step()) {
      existingUser = stmt.get();
    }
    stmt.free();
    if (existingUser && existingUser.length > 0) {
      return res.status(400).json({ error: '账号已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(`INSERT INTO fish_users (username, password) VALUES (?, ?)`, [username, hashedPassword]);
    await saveDb();

    const userId = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
    const token = jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

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
    const stmt = db.prepare('SELECT id, username, password FROM fish_users WHERE username = ?');
    stmt.bind([username]);
    let user: any[] | null = null;
    if (stmt.step()) {
      user = stmt.get();
    }
    stmt.free();
    
    if (!user || user.length === 0) {
      return res.status(401).json({ error: '账号或密码错误' });
    }

    const isValid = await bcrypt.compare(password, user[2]);
    if (!isValid) {
      return res.status(401).json({ error: '账号或密码错误' });
    }

    const token = jwt.sign({ userId: user[0], username: user[1] }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(200).json({
      success: true,
      message: '登录成功',
      token,
      user: { id: user[0], username: user[1] }
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
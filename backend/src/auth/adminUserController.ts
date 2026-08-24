import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db';
import { SafeUser } from './types';

// 管理员用户管理控制器：仅供 requireAdmin 路由使用。
// 注意：password_hash 一律不返回给前端。

const toSafeUser = (row: any[]): SafeUser => ({
  id: row[0],
  username: row[1],
  phone: row[3],
  role: row[4],
  created_at: row[5],
});

const nowBeijing = () =>
  new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);

// GET /api/users/admin?page=1&pageSize=10&search=&role=
// 列表：支持分页、按 username/phone 搜索、按 role 筛选
export const getUsers = async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize || '10'), 10) || 10));
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const role = typeof req.query.role === 'string' ? req.query.role.trim() : '';

    const where: string[] = [];
    const params: any[] = [];

    if (search) {
      where.push('(username LIKE ? OR phone LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (role) {
      where.push('role = ?');
      params.push(role);
    }

    const whereSql = where.length ? ' WHERE ' + where.join(' AND ') : '';

    // 总数
    const countResult = await db.exec(`SELECT COUNT(*) FROM users${whereSql}`, params);
    const total = Number(countResult[0]?.values?.[0]?.[0] || 0);

    // 数据
    const offset = (page - 1) * pageSize;
    const result = await db.exec(
      `SELECT id, username, password_hash, phone, role, created_at, updated_at FROM users${whereSql} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );
    const users = (result[0]?.values || []).map(toSafeUser);

    res.json({
      users,
      total,
      page,
      pageSize,
      pages: pageSize > 0 ? Math.ceil(total / pageSize) : 0,
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ error: '获取用户列表失败' });
  }
};

// GET /api/users/admin/:id —— 用户详情
export const getUserById = async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const result = await db.exec(
      'SELECT id, username, password_hash, phone, role, created_at, updated_at FROM users WHERE id = ?',
      [Number(req.params.id)]
    );
    const row = result[0]?.values?.[0];
    if (!row) {
      return res.status(404).json({ error: '用户不存在' });
    }
    res.json({ user: toSafeUser(row) });
  } catch (error) {
    console.error('获取用户详情失败:', error);
    res.status(500).json({ error: '获取用户详情失败' });
  }
};

// POST /api/users/admin —— 创建用户
export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, password, phone, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }
    if (username.length < 2 || username.length > 20) {
      return res.status(400).json({ error: '用户名长度需 2-20 个字符' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: '密码长度不能少于 6 位' });
    }

    const finalRole = role === 'admin' ? 'admin' : 'user';

    const db = await getDb();

    // 用户名唯一校验
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
    const ins = await db.run(
      'INSERT INTO users (username, password_hash, phone, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [username, passwordHash, phone || null, finalRole, now, now]
    );

    const userId = Number(ins.lastInsertRowid);
    const result = await db.exec(
      'SELECT id, username, password_hash, phone, role, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );
    const row = result[0]?.values?.[0];
    if (!row) {
      return res.status(500).json({ error: '创建用户失败' });
    }

    res.status(201).json({ user: toSafeUser(row) });
  } catch (error: any) {
    if (error.message?.includes('Duplicate entry')) {
      return res.status(409).json({ error: '用户名或手机号已存在' });
    }
    console.error('创建用户失败:', error);
    res.status(500).json({ error: '创建用户失败' });
  }
};

// PUT /api/users/admin/:id —— 编辑用户（仅更新提供的字段，密码可选）
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = Number(id);
    const { username, password, phone, role } = req.body;

    const db = await getDb();
    const existing = await db.exec('SELECT id FROM users WHERE id = ?', [userId]);
    if (!existing[0]?.values?.length) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (username !== undefined) {
      if (username.length < 2 || username.length > 20) {
        return res.status(400).json({ error: '用户名长度需 2-20 个字符' });
      }
      fields.push('username = ?');
      values.push(username);
    }
    if (phone !== undefined) {
      fields.push('phone = ?');
      values.push(phone === '' ? null : phone);
    }
    if (role !== undefined) {
      fields.push('role = ?');
      values.push(role === 'admin' ? 'admin' : 'user');
    }
    if (password !== undefined && password !== '') {
      if (password.length < 6) {
        return res.status(400).json({ error: '密码长度不能少于 6 位' });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      fields.push('password_hash = ?');
      values.push(passwordHash);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: '没有需要更新的字段' });
    }

    fields.push('updated_at = ?');
    values.push(nowBeijing());
    values.push(userId);

    await db.run(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);

    const result = await db.exec(
      'SELECT id, username, password_hash, phone, role, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );
    const row = result[0]?.values?.[0];
    res.json({ user: row ? toSafeUser(row) : null });
  } catch (error: any) {
    if (error.message?.includes('Duplicate entry')) {
      return res.status(409).json({ error: '用户名或手机号已存在' });
    }
    console.error('编辑用户失败:', error);
    res.status(500).json({ error: '编辑用户失败' });
  }
};

// DELETE /api/users/admin/:id —— 删除用户（禁止删除自己，防止自锁）
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = Number(id);

    if (req.user?.id === userId) {
      return res.status(400).json({ error: '不能删除当前登录的账号' });
    }

    const db = await getDb();
    const existing = await db.exec('SELECT id, role FROM users WHERE id = ?', [userId]);
    if (!existing[0]?.values?.length) {
      return res.status(404).json({ error: '用户不存在' });
    }

    await db.run('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({ error: '删除用户失败' });
  }
};
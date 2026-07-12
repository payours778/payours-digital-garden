import { Request, Response } from 'express';
import getDb, { saveDb } from '../db';
import { CreateProjectRequest, UpdateProjectRequest } from '../models';

const parseRow = (row: any[]) => ({
  id: row[0],
  name: row[1],
  description: row[2],
  tech: JSON.parse(row[3] || '[]'),
  link: row[4],
  stars: row[5],
  created_at: row[6]
});

// 获取项目列表（支持搜索、按技术栈筛选、按 stars/created_at 排序）
export const getProjects = async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { search, tech, sort = 'created_at', order = 'desc' } = req.query;

    let sql = 'SELECT * FROM projects';
    const conditions: string[] = [];
    const params: any[] = [];

    // 按名称/描述搜索
    if (search && typeof search === 'string') {
      conditions.push('(name LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    // 按技术栈筛选（tech 字段是 JSON 数组字符串，用 LIKE 匹配）
    if (tech && typeof tech === 'string') {
      conditions.push('tech LIKE ?');
      params.push(`%"${tech}"%`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    // 排序（白名单校验，防止 SQL 注入）
    const allowedSortFields = ['created_at', 'stars', 'name'];
    const sortField = allowedSortFields.includes(sort as string) ? sort : 'created_at';
    const orderClause = order === 'asc' ? 'ASC' : 'DESC';
    sql += ` ORDER BY ${sortField} ${orderClause}`;

    const result = db.exec(sql, params);
    const projects = result[0]?.values?.map(parseRow) || [];
    res.json({ projects, total: projects.length });
  } catch (error) {
    console.error('获取项目列表失败:', error);
    res.status(500).json({ error: '获取项目列表失败' });
  }
};

// 获取项目详情（参数化查询防 SQL 注入）
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const result = db.exec('SELECT * FROM projects WHERE id = ?', [Number(id)]);
    const rows = result[0]?.values;

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: '项目不存在' });
    }

    res.json({ project: parseRow(rows[0]) });
  } catch (error) {
    console.error('获取项目详情失败:', error);
    res.status(500).json({ error: '获取项目详情失败' });
  }
};

// 创建项目
export const createProject = async (req: Request, res: Response) => {
  try {
    const { name, description, tech, link, stars } = req.body as CreateProjectRequest;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: '项目名称不能为空' });
    }

    const db = await getDb();
    const techJson = JSON.stringify(tech || []);
    const now = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);

    db.run(
      'INSERT INTO projects (name, description, tech, link, stars, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [name.trim(), description || '', techJson, link || '', stars || 0, now]
    );

    const maxIdResult = db.exec('SELECT MAX(id) FROM projects');
    const lastId = maxIdResult[0]?.values?.[0]?.[0];

    if (!lastId) {
      return res.status(500).json({ error: '创建项目失败' });
    }

    const queryResult = db.exec('SELECT * FROM projects WHERE id = ?', [lastId]);
    const row = queryResult[0]?.values?.[0];

    if (!row) {
      return res.status(500).json({ error: '创建项目失败' });
    }

    await saveDb();
    res.status(201).json({ project: parseRow(row) });
  } catch (error) {
    console.error('创建项目失败:', error);
    res.status(500).json({ error: '创建项目失败' });
  }
};

// 更新项目
export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, tech, link, stars } = req.body as UpdateProjectRequest;

    const db = await getDb();
    const existingResult = db.exec('SELECT * FROM projects WHERE id = ?', [Number(id)]);

    if (!existingResult[0]?.values?.length) {
      return res.status(404).json({ error: '项目不存在' });
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (name !== undefined) { fields.push('name = ?'); values.push(name.trim()); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (tech !== undefined) { fields.push('tech = ?'); values.push(JSON.stringify(tech)); }
    if (link !== undefined) { fields.push('link = ?'); values.push(link); }
    if (stars !== undefined) { fields.push('stars = ?'); values.push(stars); }

    if (fields.length > 0) {
      values.push(Number(id));
      db.run(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`, values);
      await saveDb();
    }

    const updatedResult = db.exec('SELECT * FROM projects WHERE id = ?', [Number(id)]);
    const row = updatedResult[0]?.values?.[0];

    res.json({ project: parseRow(row!) });
  } catch (error) {
    console.error('更新项目失败:', error);
    res.status(500).json({ error: '更新项目失败' });
  }
};

// 删除项目
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const existingResult = db.exec('SELECT * FROM projects WHERE id = ?', [Number(id)]);

    if (!existingResult[0]?.values?.length) {
      return res.status(404).json({ error: '项目不存在' });
    }

    db.run('DELETE FROM projects WHERE id = ?', [Number(id)]);
    await saveDb();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除项目失败:', error);
    res.status(500).json({ error: '删除项目失败' });
  }
};

// 获取项目统计信息
export const getProjectStats = async (req: Request, res: Response) => {
  try {
    const db = await getDb();

    // 项目总数
    const countResult = db.exec('SELECT COUNT(*) FROM projects');
    const total = countResult[0]?.values?.[0]?.[0] || 0;

    // 总 stars 数
    const starsResult = db.exec('SELECT SUM(stars) FROM projects');
    const totalStars = starsResult[0]?.values?.[0]?.[0] || 0;

    // 技术栈统计（聚合所有项目的 tech 数组）
    const allResult = db.exec('SELECT tech FROM projects');
    const techRows = allResult[0]?.values || [];
    const techCount: Record<string, number> = {};

    techRows.forEach((row) => {
      const techs: string[] = JSON.parse(String(row[0] || '[]'));
      techs.forEach((t) => {
        techCount[t] = (techCount[t] || 0) + 1;
      });
    });

    // 按使用次数降序
    const topTech = Object.entries(techCount)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => ({ name, count }));

    res.json({
      total,
      totalStars,
      topTech,
    });
  } catch (error) {
    console.error('获取项目统计失败:', error);
    res.status(500).json({ error: '获取项目统计失败' });
  }
};

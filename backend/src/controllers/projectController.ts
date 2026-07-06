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

export const getProjects = async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const result = db.exec('SELECT * FROM projects ORDER BY created_at DESC');
    const projects = result[0]?.values?.map(parseRow) || [];
    res.json({ projects });
  } catch (error) {
    res.status(500).json({ error: '获取项目列表失败' });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const result = db.exec(`SELECT * FROM projects WHERE id = ${id}`);
    const rows = result[0]?.values;

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: '项目不存在' });
    }

    res.json({ project: parseRow(rows[0]) });
  } catch (error) {
    res.status(500).json({ error: '获取项目详情失败' });
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const { name, description, tech, link, stars } = req.body as CreateProjectRequest;

    if (!name) {
      return res.status(400).json({ error: '项目名称不能为空' });
    }

    const db = await getDb();
    const techJson = JSON.stringify(tech || []);
    const now = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);

    db.run(
      'INSERT INTO projects (name, description, tech, link, stars, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description || '', techJson, link || '', stars || 0, now]
    );

    const maxIdResult = db.exec('SELECT MAX(id) FROM projects');
    const lastId = maxIdResult[0]?.values?.[0]?.[0];

    if (!lastId) {
      return res.status(500).json({ error: '创建项目失败' });
    }

    const queryResult = db.exec(`SELECT * FROM projects WHERE id = ${lastId}`);
    const row = queryResult[0]?.values?.[0];

    if (!row) {
      return res.status(500).json({ error: '创建项目失败' });
    }

    await saveDb();
    res.status(201).json({ project: parseRow(row) });
  } catch (error) {
    res.status(500).json({ error: '创建项目失败' });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, tech, link, stars } = req.body as UpdateProjectRequest;

    const db = await getDb();
    const existingResult = db.exec(`SELECT * FROM projects WHERE id = ${id}`);

    if (!existingResult[0]?.values?.length) {
      return res.status(404).json({ error: '项目不存在' });
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (name !== undefined) { fields.push('name = ?'); values.push(name); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (tech !== undefined) { fields.push('tech = ?'); values.push(JSON.stringify(tech)); }
    if (link !== undefined) { fields.push('link = ?'); values.push(link); }
    if (stars !== undefined) { fields.push('stars = ?'); values.push(stars); }

    if (fields.length > 0) {
      db.run(`UPDATE projects SET ${fields.join(', ')} WHERE id = ${id}`, values);
      await saveDb();
    }

    const updatedResult = db.exec(`SELECT * FROM projects WHERE id = ${id}`);
    const row = updatedResult[0]?.values?.[0];

    res.json({ project: parseRow(row!) });
  } catch (error) {
    res.status(500).json({ error: '更新项目失败' });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const existingResult = db.exec(`SELECT * FROM projects WHERE id = ${id}`);

    if (!existingResult[0]?.values?.length) {
      return res.status(404).json({ error: '项目不存在' });
    }

    db.run(`DELETE FROM projects WHERE id = ${id}`);
    await saveDb();
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除项目失败' });
  }
};

import { Request, Response } from 'express';
import getDb, { saveDb } from '../db';

interface Essay {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  cover: string;
  date: string;
  created_at: string;
}

const parseEssay = (row: any[]): Essay => {
  return {
    id: row[0],
    title: row[1],
    content: row[2],
    excerpt: row[3] || '',
    cover: row[4] || '',
    date: row[5] || '',
    created_at: row[6] || ''
  };
};

export const getEssays = async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { search } = req.query;

    let sql = 'SELECT * FROM essays ORDER BY date DESC';
    const params: any[] = [];

    if (search && typeof search === 'string') {
      sql = 'SELECT * FROM essays WHERE title LIKE ? OR excerpt LIKE ? ORDER BY date DESC';
      params.push(`%${search}%`, `%${search}%`);
    }

    const result = db.exec(sql, params);
    const essays = result[0]?.values?.map(parseEssay) || [];
    res.json({ essays, total: essays.length });
  } catch (error) {
    console.error('获取随笔列表失败:', error);
    res.status(500).json({ error: '获取随笔列表失败' });
  }
};

export const getEssayById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const result = db.exec('SELECT * FROM essays WHERE id = ?', [Number(id)]);
    
    if (!result[0]?.values?.length) {
      return res.status(404).json({ error: '随笔未找到' });
    }

    const essay = parseEssay(result[0].values[0]);
    res.json({ essay });
  } catch (error) {
    console.error('获取随笔失败:', error);
    res.status(500).json({ error: '获取随笔失败' });
  }
};

export const createEssay = async (req: Request, res: Response) => {
  try {
    const { title, content, excerpt, cover, date } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: '标题和内容不能为空' });
    }

    const db = await getDb();
    const result = db.run(
      'INSERT INTO essays (title, content, excerpt, cover, date) VALUES (?, ?, ?, ?, ?)',
      [title, content, excerpt || '', cover || '', date || new Date().toISOString().split('T')[0]]
    );

    const lastId = db.exec('SELECT MAX(id) FROM essays')[0].values[0][0];
    const inserted = db.exec('SELECT * FROM essays WHERE id = ?', [lastId]);
    const essay = parseEssay(inserted[0].values[0]);

    await saveDb();
    res.status(201).json({ essay });
  } catch (error) {
    console.error('创建随笔失败:', error);
    res.status(500).json({ error: '创建随笔失败' });
  }
};

export const updateEssay = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, cover, date } = req.body;

    const db = await getDb();
    const existing = db.exec('SELECT * FROM essays WHERE id = ?', [Number(id)]);
    
    if (!existing[0]?.values?.length) {
      return res.status(404).json({ error: '随笔未找到' });
    }

    const result = db.run(
      'UPDATE essays SET title = ?, content = ?, excerpt = ?, cover = ?, date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, content, excerpt || '', cover || '', date || '', Number(id)]
    );

    const updated = db.exec('SELECT * FROM essays WHERE id = ?', [Number(id)]);
    const essay = parseEssay(updated[0].values[0]);

    await saveDb();
    res.json({ essay });
  } catch (error) {
    console.error('更新随笔失败:', error);
    res.status(500).json({ error: '更新随笔失败' });
  }
};

export const deleteEssay = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    
    const existing = db.exec('SELECT * FROM essays WHERE id = ?', [Number(id)]);
    if (!existing[0]?.values?.length) {
      return res.status(404).json({ error: '随笔未找到' });
    }

    db.run('DELETE FROM essays WHERE id = ?', [Number(id)]);
    await saveDb();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除随笔失败:', error);
    res.status(500).json({ error: '删除随笔失败' });
  }
};
import { Request, Response } from 'express';
import getDb, { saveDb, getCache, setCache, invalidateCache } from '../db';
import { CreatePostRequest, UpdatePostRequest } from '../models';

const parseRow = (row: any[]) => ({
  id: row[0],
  title: row[1],
  content: row[2],
  excerpt: row[3],
  slug: row[4],
  cover: row[5],
  tags: JSON.parse(row[6] || '[]'),
  views: row[7],
  created_at: row[8],
  updated_at: row[9]
});

// 获取文章列表（支持搜索、按标签筛选、排序）
export const getPosts = async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { search, tag, sort = 'created_at', order = 'desc', limit } = req.query;

    let sql = 'SELECT * FROM posts';
    const conditions: string[] = [];
    const params: any[] = [];

    if (search && typeof search === 'string') {
      conditions.push('(title LIKE ? OR excerpt LIKE ? OR content LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (tag && typeof tag === 'string') {
      conditions.push('tags LIKE ?');
      params.push(`%"${tag}"%`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    const allowedSortFields = ['created_at', 'views', 'title'];
    const sortField = allowedSortFields.includes(sort as string) ? sort : 'created_at';
    const orderClause = order === 'asc' ? 'ASC' : 'DESC';
    sql += ` ORDER BY ${sortField} ${orderClause}`;

    if (limit && typeof limit === 'string') {
      const limitNum = parseInt(limit, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        sql += ` LIMIT ${limitNum}`;
      }
    }

    const result = db.exec(sql, params);
    const posts = result[0]?.values?.map(parseRow) || [];
    res.json({ posts, total: posts.length });
  } catch (error) {
    console.error('获取文章列表失败:', error);
    res.status(500).json({ error: '获取文章列表失败' });
  }
};

// 获取归档数据（按年份/月份分组）
export const getPostArchive = async (req: Request, res: Response) => {
  try {
    const cached = getCache('posts:archive');
    if (cached) {
      return res.json(cached);
    }

    const db = await getDb();
    const result = db.exec('SELECT id, title, created_at FROM posts ORDER BY created_at DESC');
    const rows = result[0]?.values || [];

    const archive: Record<string, Record<string, { id: number; title: string; date: string }[]>> = {};

    rows.forEach((row) => {
      const dateStr = String(row[2]);
      const date = new Date(dateStr);
      const year = date.getFullYear().toString();
      const month = String(date.getMonth() + 1).padStart(2, '0');

      if (!archive[year]) archive[year] = {};
      if (!archive[year][month]) archive[year][month] = [];

      archive[year][month].push({
        id: Number(row[0]),
        title: String(row[1]),
        date: dateStr
      });
    });

    const sortedArchive = Object.entries(archive)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([year, months]) => ({
        year,
        months: Object.entries(months)
          .sort(([a], [b]) => Number(b) - Number(a))
          .map(([month, posts]) => ({
            month,
            monthName: `${year}年${parseInt(month)}月`,
            count: posts.length,
            posts
          }))
      }));

    const resultData = { archive: sortedArchive, total: rows.length };
    setCache('posts:archive', resultData);
    res.json(resultData);
  } catch (error) {
    console.error('获取归档数据失败:', error);
    res.status(500).json({ error: '获取归档数据失败' });
  }
};

// 获取所有标签及计数（归档页面侧边栏用）
export const getPostTags = async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const result = db.exec('SELECT tags FROM posts');
    const rows = result[0]?.values || [];
    const tagCount: Record<string, number> = {};

    rows.forEach((row) => {
      const tags: string[] = JSON.parse(String(row[0] || '[]'));
      tags.forEach((t) => {
        tagCount[t] = (tagCount[t] || 0) + 1;
      });
    });

    const tags = Object.entries(tagCount)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => ({ name, count }));

    res.json({ tags, total: rows.length });
  } catch (error) {
    console.error('获取标签失败:', error);
    res.status(500).json({ error: '获取标签失败' });
  }
};

// 获取文章详情（参数化查询防 SQL 注入）
export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const result = db.exec('SELECT * FROM posts WHERE id = ?', [Number(id)]);
    const rows = result[0]?.values;

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: '文章不存在' });
    }

    // 浏览量 +1
    db.run('UPDATE posts SET views = views + 1 WHERE id = ?', [Number(id)]);
    await saveDb();

    res.json({ post: parseRow(rows[0]) });
  } catch (error) {
    console.error('获取文章详情失败:', error);
    res.status(500).json({ error: '获取文章详情失败' });
  }
};

// 创建文章
export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, content, excerpt, slug, cover, tags } = req.body as CreatePostRequest;

    if (!title || !content || !excerpt || !slug) {
      return res.status(400).json({ error: '标题、内容、摘要和 slug 不能为空' });
    }

    const db = await getDb();
    const tagsJson = JSON.stringify(tags || []);
    const now = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);

    db.run(
      'INSERT INTO posts (title, content, excerpt, slug, cover, tags, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, content, excerpt, slug, cover || null, tagsJson, now, now]
    );

    const maxIdResult = db.exec('SELECT MAX(id) FROM posts');
    const lastId = maxIdResult[0]?.values?.[0]?.[0];

    if (!lastId) {
      return res.status(500).json({ error: '创建文章失败' });
    }

    const queryResult = db.exec('SELECT * FROM posts WHERE id = ?', [lastId]);
    const row = queryResult[0]?.values?.[0];

    if (!row) {
      return res.status(500).json({ error: '创建文章失败' });
    }

    await saveDb();
    invalidateCache('posts');
    res.status(201).json({ post: parseRow(row) });
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'slug 已存在' });
    }
    console.error('创建文章失败:', error);
    res.status(500).json({ error: '创建文章失败' });
  }
};

// 更新文章
export const updatePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, cover, tags } = req.body as UpdatePostRequest;

    const db = await getDb();
    const existingResult = db.exec('SELECT * FROM posts WHERE id = ?', [Number(id)]);

    if (!existingResult[0]?.values?.length) {
      return res.status(404).json({ error: '文章不存在' });
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (title !== undefined) { fields.push('title = ?'); values.push(title); }
    if (content !== undefined) { fields.push('content = ?'); values.push(content); }
    if (excerpt !== undefined) { fields.push('excerpt = ?'); values.push(excerpt); }
    if (cover !== undefined) { fields.push('cover = ?'); values.push(cover); }
    if (tags !== undefined) { fields.push('tags = ?'); values.push(JSON.stringify(tags)); }

    const now = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);
    fields.push('updated_at = ?');
    values.push(now);

    values.push(Number(id));
    db.run(`UPDATE posts SET ${fields.join(', ')} WHERE id = ?`, values);
    await saveDb();
    invalidateCache('posts');

    const updatedResult = db.exec('SELECT * FROM posts WHERE id = ?', [Number(id)]);
    const row = updatedResult[0]?.values?.[0];

    res.json({ post: parseRow(row!) });
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'slug 已存在' });
    }
    console.error('更新文章失败:', error);
    res.status(500).json({ error: '更新文章失败' });
  }
};

// 删除文章
export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const existingResult = db.exec('SELECT * FROM posts WHERE id = ?', [Number(id)]);

    if (!existingResult[0]?.values?.length) {
      return res.status(404).json({ error: '文章不存在' });
    }

    db.run('DELETE FROM posts WHERE id = ?', [Number(id)]);
    await saveDb();
    invalidateCache('posts');
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除文章失败:', error);
    res.status(500).json({ error: '删除文章失败' });
  }
};

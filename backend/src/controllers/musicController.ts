import { Request, Response } from 'express';
import getDb, { saveDb } from '../db';
import { CreateMusicRequest, UpdateMusicRequest } from '../models';

const parseRow = (row: any[]) => ({
  id: row[0],
  title: row[1],
  artist: row[2] || '',
  url: row[3],
  cover: row[4] || '',
  duration: row[5] || '00:00',
  created_at: row[6]
});

// 获取音乐列表
export const getMusicList = async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const result = db.exec('SELECT * FROM music ORDER BY created_at DESC');
    const music = result[0]?.values?.map(parseRow) || [];
    res.json({ music, total: music.length });
  } catch (error) {
    console.error('获取音乐列表失败:', error);
    res.status(500).json({ error: '获取音乐列表失败' });
  }
};

// 获取单首音乐
export const getMusicById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const result = db.exec('SELECT * FROM music WHERE id = ?', [Number(id)]);
    const rows = result[0]?.values;

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: '音乐不存在' });
    }

    res.json({ music: parseRow(rows[0]) });
  } catch (error) {
    console.error('获取音乐详情失败:', error);
    res.status(500).json({ error: '获取音乐详情失败' });
  }
};

// 创建音乐
export const createMusic = async (req: Request, res: Response) => {
  try {
    const { title, artist, url, cover, duration } = req.body as CreateMusicRequest;

    if (!title || !url) {
      return res.status(400).json({ error: '标题和音频地址不能为空' });
    }

    const db = await getDb();
    db.run(
      'INSERT INTO music (title, artist, url, cover, duration) VALUES (?, ?, ?, ?, ?)',
      [title, artist || '', url, cover || '', duration || '00:00']
    );

    const maxIdResult = db.exec('SELECT MAX(id) FROM music');
    const lastId = maxIdResult[0]?.values?.[0]?.[0];

    if (!lastId) {
      return res.status(500).json({ error: '创建音乐失败' });
    }

    const queryResult = db.exec('SELECT * FROM music WHERE id = ?', [lastId]);
    const row = queryResult[0]?.values?.[0];

    await saveDb();
    res.status(201).json({ music: parseRow(row!) });
  } catch (error) {
    console.error('创建音乐失败:', error);
    res.status(500).json({ error: '创建音乐失败' });
  }
};

// 更新音乐
export const updateMusic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, artist, url, cover, duration } = req.body as UpdateMusicRequest;

    const db = await getDb();
    const existingResult = db.exec('SELECT * FROM music WHERE id = ?', [Number(id)]);

    if (!existingResult[0]?.values?.length) {
      return res.status(404).json({ error: '音乐不存在' });
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (title !== undefined) { fields.push('title = ?'); values.push(title); }
    if (artist !== undefined) { fields.push('artist = ?'); values.push(artist); }
    if (url !== undefined) { fields.push('url = ?'); values.push(url); }
    if (cover !== undefined) { fields.push('cover = ?'); values.push(cover); }
    if (duration !== undefined) { fields.push('duration = ?'); values.push(duration); }

    if (fields.length === 0) {
      return res.status(400).json({ error: '没有需要更新的字段' });
    }

    values.push(Number(id));
    db.run(`UPDATE music SET ${fields.join(', ')} WHERE id = ?`, values);
    await saveDb();

    const updatedResult = db.exec('SELECT * FROM music WHERE id = ?', [Number(id)]);
    const row = updatedResult[0]?.values?.[0];

    res.json({ music: parseRow(row!) });
  } catch (error) {
    console.error('更新音乐失败:', error);
    res.status(500).json({ error: '更新音乐失败' });
  }
};

// 删除音乐
export const deleteMusic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const existingResult = db.exec('SELECT * FROM music WHERE id = ?', [Number(id)]);

    if (!existingResult[0]?.values?.length) {
      return res.status(404).json({ error: '音乐不存在' });
    }

    db.run('DELETE FROM music WHERE id = ?', [Number(id)]);
    await saveDb();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除音乐失败:', error);
    res.status(500).json({ error: '删除音乐失败' });
  }
};

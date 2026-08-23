import { Request, Response } from 'express';
import getDb from '../db';
import { CreateMomentRequest, UpdateMomentRequest } from '../models';

const parseImages = (imagesVal: any): string[] => {
  if (imagesVal === null || imagesVal === undefined) return [];
  const imagesStr = String(imagesVal);
  if (!imagesStr) return [];
  try {
    const parsed = JSON.parse(imagesStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [imagesStr];
  }
};

export const getMoments = async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const moments = await db.exec('SELECT * FROM moments ORDER BY created_at DESC');
    res.json({ moments: moments[0]?.values?.map((row: any[]) => ({
      id: row[0],
      content: row[1],
      images: parseImages(row[2]),
      likes: row[3],
      created_at: row[4]
    })) || [] });
  } catch (error) {
    res.status(500).json({ error: '获取说说列表失败' });
  }
};

export const getMomentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const result = await db.exec(`SELECT * FROM moments WHERE id = ${id}`);
    const rows = result[0]?.values;
    
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: '说说不存在' });
    }
    
    const row = rows[0];
    const moment = {
      id: row[0],
      content: row[1],
      images: parseImages(row[2]),
      likes: row[3],
      created_at: row[4]
    };
    
    res.json({ moment });
  } catch (error) {
    res.status(500).json({ error: '获取说说详情失败' });
  }
};

export const createMoment = async (req: Request, res: Response) => {
  try {
    const { content, images } = req.body as CreateMomentRequest;
    
    if (!content) {
      return res.status(400).json({ error: '内容不能为空' });
    }
    
    const imagesArray = Array.isArray(images) ? images : (images ? [images] : []);
    const imagesJson = JSON.stringify(imagesArray);
    
    const db = await getDb();
    const now = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);
    await db.run(
      'INSERT INTO moments (content, images, created_at) VALUES (?, ?, ?)',
      [content, imagesJson, now]
    );
    
    const maxIdResult = await db.exec('SELECT MAX(id) FROM moments');
    const lastId = maxIdResult[0]?.values?.[0]?.[0];
    
    if (!lastId) {
      return res.status(500).json({ error: '发布说说失败' });
    }
    
    const queryResult = await db.exec(`SELECT * FROM moments WHERE id = ${lastId}`);
    const row = queryResult[0]?.values?.[0];
    
    if (!row) {
      return res.status(500).json({ error: '发布说说失败' });
    }
    
    const newMoment = {
      id: row[0],
      content: row[1],
      images: parseImages(row[2]),
      likes: row[3],
      created_at: row[4]
    };
    
    res.status(201).json({ moment: newMoment });
  } catch (error) {
    console.error('发布说说错误:', error);
    res.status(500).json({ error: '发布说说失败' });
  }
};

export const updateMoment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, images } = req.body as UpdateMomentRequest;
    
    const db = await getDb();
    const existingResult = await db.exec(`SELECT * FROM moments WHERE id = ${id}`);
    
    if (!existingResult[0]?.values?.length) {
      return res.status(404).json({ error: '说说不存在' });
    }
    
    const fields: string[] = [];
    const values: any[] = [];
    
    if (content !== undefined) { fields.push('content = ?'); values.push(content); }
    if (images !== undefined) { 
      const imagesArray = Array.isArray(images) ? images : (images ? [images] : []);
      fields.push('images = ?'); 
      values.push(JSON.stringify(imagesArray)); 
    }
    
    await db.run(`UPDATE moments SET ${fields.join(', ')} WHERE id = ${id}`, values);
    
    const updatedResult = await db.exec(`SELECT * FROM moments WHERE id = ${id}`);
    const row = updatedResult[0]?.values?.[0];
    
    if (!row) {
      return res.status(500).json({ error: '更新说说失败' });
    }
    
    const updatedMoment = {
      id: row[0],
      content: row[1],
      images: parseImages(row[2]),
      likes: row[3],
      created_at: row[4]
    };
    
    res.json({ moment: updatedMoment });
  } catch (error) {
    res.status(500).json({ error: '更新说说失败' });
  }
};

export const deleteMoment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const existingResult = await db.exec(`SELECT * FROM moments WHERE id = ${id}`);
    
    if (!existingResult[0]?.values?.length) {
      return res.status(404).json({ error: '说说不存在' });
    }
    
    await db.run(`DELETE FROM moments WHERE id = ${id}`);
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除说说失败' });
  }
};

export const likeMoment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const existingResult = await db.exec(`SELECT * FROM moments WHERE id = ${id}`);
    
    if (!existingResult[0]?.values?.length) {
      return res.status(404).json({ error: '说说不存在' });
    }
    
    await db.run(`UPDATE moments SET likes = likes + 1 WHERE id = ${id}`);
    
    const updatedResult = await db.exec(`SELECT * FROM moments WHERE id = ${id}`);
    const row = updatedResult[0]?.values?.[0];
    
    if (!row) {
      return res.status(500).json({ error: '点赞失败' });
    }
    
    const updatedMoment = {
      id: row[0],
      content: row[1],
      images: parseImages(row[2]),
      likes: row[3],
      created_at: row[4]
    };
    
    res.json({ moment: updatedMoment });
  } catch (error) {
    res.status(500).json({ error: '点赞失败' });
  }
};
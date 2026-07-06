import { Request, Response } from 'express';
import getDb, { saveDb } from '../db';
import { CreateAlbumRequest, UpdateAlbumRequest } from '../models';

const parseAlbumRow = (row: any[]) => ({
  id: row[0],
  name: row[1],
  description: row[2],
  cover_url: row[3],
  created_at: row[4],
  photo_count: 0,
  photos: [] as any[],
});

const parsePhotoRow = (row: any[]) => ({
  id: row[0],
  album_id: row[1],
  url: row[2],
  description: row[3],
  created_at: row[4],
});

// 获取所有相册列表
export const getAlbums = async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const result = db.exec('SELECT * FROM albums ORDER BY created_at DESC');
    const albums = (result[0]?.values || []).map(parseAlbumRow);

    // 获取每个相册的照片数
    for (const album of albums) {
      const countResult = db.exec(`SELECT COUNT(*) FROM photos WHERE album_id = ${album.id}`);
      album.photo_count = Number(countResult[0]?.values?.[0]?.[0]) || 0;
    }

    res.json({ albums });
  } catch (error) {
    res.status(500).json({ error: '获取相册列表失败' });
  }
};

// 获取相册详情（含照片）
export const getAlbumById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    const albumResult = db.exec(`SELECT * FROM albums WHERE id = ${id}`);
    const albumRows = albumResult[0]?.values;

    if (!albumRows || albumRows.length === 0) {
      return res.status(404).json({ error: '相册不存在' });
    }

    const album = parseAlbumRow(albumRows[0]);

    const photosResult = db.exec(`SELECT * FROM photos WHERE album_id = ${id} ORDER BY created_at DESC`);
    album.photos = (photosResult[0]?.values || []).map(parsePhotoRow);

    res.json({ album });
  } catch (error) {
    res.status(500).json({ error: '获取相册详情失败' });
  }
};

// 创建相册
export const createAlbum = async (req: Request, res: Response) => {
  try {
    const { name, description, cover_url } = req.body as CreateAlbumRequest;

    if (!name) {
      return res.status(400).json({ error: '相册名称不能为空' });
    }

    const db = await getDb();
    const now = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);

    db.run(
      'INSERT INTO albums (name, description, cover_url, created_at) VALUES (?, ?, ?, ?)',
      [name, description || '', cover_url || '', now]
    );

    const maxIdResult = db.exec('SELECT MAX(id) FROM albums');
    const lastId = maxIdResult[0]?.values?.[0]?.[0];

    if (!lastId) {
      return res.status(500).json({ error: '创建相册失败' });
    }

    const queryResult = db.exec(`SELECT * FROM albums WHERE id = ${lastId}`);
    const row = queryResult[0]?.values?.[0];

    if (!row) {
      return res.status(500).json({ error: '创建相册失败' });
    }

    await saveDb();
    res.status(201).json({ album: parseAlbumRow(row) });
  } catch (error) {
    res.status(500).json({ error: '创建相册失败' });
  }
};

// 更新相册
export const updateAlbum = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, cover_url } = req.body as UpdateAlbumRequest;

    const db = await getDb();
    const existingResult = db.exec(`SELECT * FROM albums WHERE id = ${id}`);

    if (!existingResult[0]?.values?.length) {
      return res.status(404).json({ error: '相册不存在' });
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (name !== undefined) { fields.push('name = ?'); values.push(name); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (cover_url !== undefined) { fields.push('cover_url = ?'); values.push(cover_url); }

    if (fields.length > 0) {
      db.run(`UPDATE albums SET ${fields.join(', ')} WHERE id = ${id}`, values);
      await saveDb();
    }

    const updatedResult = db.exec(`SELECT * FROM albums WHERE id = ${id}`);
    const row = updatedResult[0]?.values?.[0];

    res.json({ album: parseAlbumRow(row!) });
  } catch (error) {
    res.status(500).json({ error: '更新相册失败' });
  }
};

// 删除相册（同时删除相册内所有照片）
export const deleteAlbum = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const existingResult = db.exec(`SELECT * FROM albums WHERE id = ${id}`);

    if (!existingResult[0]?.values?.length) {
      return res.status(404).json({ error: '相册不存在' });
    }

    db.run(`DELETE FROM photos WHERE album_id = ${id}`);
    db.run(`DELETE FROM albums WHERE id = ${id}`);
    await saveDb();
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除相册失败' });
  }
};

// 批量添加照片到相册
export const addPhotos = async (req: Request, res: Response) => {
  try {
    const { albumId } = req.params;
    const { photos } = req.body as { photos: Array<{ url: string; description?: string }> };

    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({ error: '照片数据不能为空' });
    }

    const db = await getDb();
    const albumResult = db.exec(`SELECT * FROM albums WHERE id = ${albumId}`);

    if (!albumResult[0]?.values?.length) {
      return res.status(404).json({ error: '相册不存在' });
    }

    const now = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);

    for (const photo of photos) {
      db.run(
        'INSERT INTO photos (album_id, url, description, created_at) VALUES (?, ?, ?, ?)',
        [albumId, photo.url, photo.description || '', now]
      );
    }

    await saveDb();

    const photosResult = db.exec(`SELECT * FROM photos WHERE album_id = ${albumId} ORDER BY created_at DESC`);
    const insertedPhotos = (photosResult[0]?.values || []).map(parsePhotoRow);

    res.status(201).json({ photos: insertedPhotos });
  } catch (error) {
    res.status(500).json({ error: '添加照片失败' });
  }
};

// 删除单张照片
export const deletePhoto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const existingResult = db.exec(`SELECT * FROM photos WHERE id = ${id}`);

    if (!existingResult[0]?.values?.length) {
      return res.status(404).json({ error: '照片不存在' });
    }

    db.run(`DELETE FROM photos WHERE id = ${id}`);
    await saveDb();
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除照片失败' });
  }
};

// 获取所有照片
export const getAllPhotos = async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const result = db.exec('SELECT * FROM photos ORDER BY created_at DESC');
    const photos = (result[0]?.values || []).map(parsePhotoRow);
    res.json({ photos });
  } catch (error) {
    res.status(500).json({ error: '获取照片列表失败' });
  }
};

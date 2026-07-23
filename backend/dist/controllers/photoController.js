"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchPhotos = exports.getAllPhotos = exports.deletePhoto = exports.updatePhoto = exports.addPhotos = exports.uploadPhoto = exports.deleteAlbum = exports.updateAlbum = exports.createAlbum = exports.getAlbumById = exports.getAlbums = void 0;
const db_1 = __importStar(require("../db"));
const oss_1 = require("../utils/oss");
const parseAlbumRow = (row) => ({
    id: row[0],
    name: row[1],
    description: row[2],
    cover_url: row[3],
    created_at: row[4],
    photo_count: 0,
    photos: [],
});
const parsePhotoRow = (row) => ({
    id: row[0],
    album_id: row[1],
    url: row[2],
    description: row[3],
    created_at: row[4],
});
const getAlbums = async (req, res) => {
    try {
        const db = await (0, db_1.default)();
        const result = db.exec('SELECT * FROM albums ORDER BY created_at DESC');
        const albums = (result[0]?.values || []).map(parseAlbumRow);
        for (const album of albums) {
            const countResult = db.exec(`SELECT COUNT(*) FROM photos WHERE album_id = ${album.id}`);
            album.photo_count = Number(countResult[0]?.values?.[0]?.[0]) || 0;
        }
        res.json({ albums });
    }
    catch (error) {
        res.status(500).json({ error: '获取相册列表失败' });
    }
};
exports.getAlbums = getAlbums;
const getAlbumById = async (req, res) => {
    try {
        const { id } = req.params;
        const db = await (0, db_1.default)();
        const albumResult = db.exec(`SELECT * FROM albums WHERE id = ${id}`);
        const albumRows = albumResult[0]?.values;
        if (!albumRows || albumRows.length === 0) {
            return res.status(404).json({ error: '相册不存在' });
        }
        const album = parseAlbumRow(albumRows[0]);
        const photosResult = db.exec(`SELECT * FROM photos WHERE album_id = ${id} ORDER BY created_at DESC`);
        album.photos = (photosResult[0]?.values || []).map(parsePhotoRow);
        album.photo_count = album.photos.length;
        res.json({ album });
    }
    catch (error) {
        res.status(500).json({ error: '获取相册详情失败' });
    }
};
exports.getAlbumById = getAlbumById;
const createAlbum = async (req, res) => {
    try {
        const { name, description, cover_url } = req.body;
        if (!name) {
            return res.status(400).json({ error: '相册名称不能为空' });
        }
        const db = await (0, db_1.default)();
        const now = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);
        db.run('INSERT INTO albums (name, description, cover_url, created_at) VALUES (?, ?, ?, ?)', [name, description || '', cover_url || '', now]);
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
        await (0, db_1.saveDb)();
        res.status(201).json({ album: parseAlbumRow(row) });
    }
    catch (error) {
        res.status(500).json({ error: '创建相册失败' });
    }
};
exports.createAlbum = createAlbum;
const updateAlbum = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, cover_url } = req.body;
        const db = await (0, db_1.default)();
        const existingResult = db.exec(`SELECT * FROM albums WHERE id = ${id}`);
        if (!existingResult[0]?.values?.length) {
            return res.status(404).json({ error: '相册不存在' });
        }
        const fields = [];
        const values = [];
        if (name !== undefined) {
            fields.push('name = ?');
            values.push(name);
        }
        if (description !== undefined) {
            fields.push('description = ?');
            values.push(description);
        }
        if (cover_url !== undefined) {
            fields.push('cover_url = ?');
            values.push(cover_url);
        }
        if (fields.length > 0) {
            db.run(`UPDATE albums SET ${fields.join(', ')} WHERE id = ${id}`, values);
            await (0, db_1.saveDb)();
        }
        const updatedResult = db.exec(`SELECT * FROM albums WHERE id = ${id}`);
        const row = updatedResult[0]?.values?.[0];
        res.json({ album: parseAlbumRow(row) });
    }
    catch (error) {
        res.status(500).json({ error: '更新相册失败' });
    }
};
exports.updateAlbum = updateAlbum;
const deleteAlbum = async (req, res) => {
    try {
        const { id } = req.params;
        const db = await (0, db_1.default)();
        const existingResult = db.exec(`SELECT * FROM albums WHERE id = ${id}`);
        if (!existingResult[0]?.values?.length) {
            return res.status(404).json({ error: '相册不存在' });
        }
        db.run(`DELETE FROM photos WHERE album_id = ${id}`);
        db.run(`DELETE FROM albums WHERE id = ${id}`);
        await (0, db_1.saveDb)();
        res.json({ message: '删除成功' });
    }
    catch (error) {
        res.status(500).json({ error: '删除相册失败' });
    }
};
exports.deleteAlbum = deleteAlbum;
const uploadPhoto = async (req, res) => {
    try {
        const { albumId } = req.params;
        const { description } = req.body;
        if (!req.file) {
            return res.status(400).json({ error: '请选择要上传的照片' });
        }
        const db = await (0, db_1.default)();
        const albumResult = db.exec(`SELECT * FROM albums WHERE id = ${albumId}`);
        if (!albumResult[0]?.values?.length) {
            return res.status(404).json({ error: '相册不存在' });
        }
        const { buffer, originalname } = req.file;
        const url = await (0, oss_1.uploadImage)(buffer, originalname, 'photos');
        const now = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);
        db.run('INSERT INTO photos (album_id, url, description, created_at) VALUES (?, ?, ?, ?)', [albumId, url, description || '', now]);
        const maxIdResult = db.exec('SELECT MAX(id) FROM photos');
        const lastId = maxIdResult[0]?.values?.[0]?.[0];
        await (0, db_1.saveDb)();
        const photoResult = db.exec(`SELECT * FROM photos WHERE id = ${lastId}`);
        const row = photoResult[0]?.values?.[0];
        res.status(201).json({ photo: row ? parsePhotoRow(row) : null });
    }
    catch (error) {
        console.error('上传照片失败:', error);
        res.status(500).json({ error: `上传照片失败: ${error.message}` });
    }
};
exports.uploadPhoto = uploadPhoto;
const addPhotos = async (req, res) => {
    try {
        const { albumId } = req.params;
        const { photos } = req.body;
        if (!photos || !Array.isArray(photos) || photos.length === 0) {
            return res.status(400).json({ error: '照片数据不能为空' });
        }
        const db = await (0, db_1.default)();
        const albumResult = db.exec(`SELECT * FROM albums WHERE id = ${albumId}`);
        if (!albumResult[0]?.values?.length) {
            return res.status(404).json({ error: '相册不存在' });
        }
        const now = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);
        for (const photo of photos) {
            db.run('INSERT INTO photos (album_id, url, description, created_at) VALUES (?, ?, ?, ?)', [albumId, photo.url, photo.description || '', now]);
        }
        await (0, db_1.saveDb)();
        const photosResult = db.exec(`SELECT * FROM photos WHERE album_id = ${albumId} ORDER BY created_at DESC`);
        const insertedPhotos = (photosResult[0]?.values || []).map(parsePhotoRow);
        res.status(201).json({ photos: insertedPhotos });
    }
    catch (error) {
        res.status(500).json({ error: '添加照片失败' });
    }
};
exports.addPhotos = addPhotos;
const updatePhoto = async (req, res) => {
    try {
        const { id } = req.params;
        const { description } = req.body;
        const db = await (0, db_1.default)();
        const existingResult = db.exec(`SELECT * FROM photos WHERE id = ${id}`);
        if (!existingResult[0]?.values?.length) {
            return res.status(404).json({ error: '照片不存在' });
        }
        if (description !== undefined) {
            db.run(`UPDATE photos SET description = ? WHERE id = ${id}`, [description]);
            await (0, db_1.saveDb)();
        }
        const updatedResult = db.exec(`SELECT * FROM photos WHERE id = ${id}`);
        const row = updatedResult[0]?.values?.[0];
        res.json({ photo: parsePhotoRow(row) });
    }
    catch (error) {
        res.status(500).json({ error: '更新照片失败' });
    }
};
exports.updatePhoto = updatePhoto;
const deletePhoto = async (req, res) => {
    try {
        const { id } = req.params;
        const db = await (0, db_1.default)();
        const existingResult = db.exec(`SELECT * FROM photos WHERE id = ${id}`);
        if (!existingResult[0]?.values?.length) {
            return res.status(404).json({ error: '照片不存在' });
        }
        db.run(`DELETE FROM photos WHERE id = ${id}`);
        await (0, db_1.saveDb)();
        res.json({ message: '删除成功' });
    }
    catch (error) {
        res.status(500).json({ error: '删除照片失败' });
    }
};
exports.deletePhoto = deletePhoto;
const getAllPhotos = async (req, res) => {
    try {
        const db = await (0, db_1.default)();
        const result = db.exec('SELECT * FROM photos ORDER BY created_at DESC');
        const photos = (result[0]?.values || []).map(parsePhotoRow);
        res.json({ photos });
    }
    catch (error) {
        res.status(500).json({ error: '获取照片列表失败' });
    }
};
exports.getAllPhotos = getAllPhotos;
const searchPhotos = async (req, res) => {
    try {
        const { keyword, album_id, page = 1, limit = 20 } = req.query;
        const db = await (0, db_1.default)();
        let query = 'SELECT * FROM photos WHERE 1=1';
        const params = [];
        if (keyword) {
            query += ' AND (description LIKE ? OR url LIKE ?)';
            params.push(`%${keyword}%`, `%${keyword}%`);
        }
        if (album_id) {
            query += ' AND album_id = ?';
            params.push(Number(album_id));
        }
        query += ' ORDER BY created_at DESC';
        const offset = (Number(page) - 1) * Number(limit);
        query += ' LIMIT ? OFFSET ?';
        params.push(Number(limit), offset);
        const result = db.exec(query, params);
        const photos = (result[0]?.values || []).map(parsePhotoRow);
        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)').replace('ORDER BY created_at DESC', '').replace('LIMIT ? OFFSET ?', '');
        const countResult = db.exec(countQuery, params.slice(0, -2));
        const total = Number(countResult[0]?.values?.[0]?.[0]) || 0;
        res.json({
            photos,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: '搜索照片失败' });
    }
};
exports.searchPhotos = searchPhotos;
//# sourceMappingURL=photoController.js.map
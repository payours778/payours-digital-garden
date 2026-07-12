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
exports.deleteMusic = exports.updateMusic = exports.createMusic = exports.getMusicById = exports.getMusicList = void 0;
const db_1 = __importStar(require("../db"));
const parseRow = (row) => ({
    id: row[0],
    title: row[1],
    artist: row[2] || '',
    url: row[3],
    cover: row[4] || '',
    duration: row[5] || '00:00',
    created_at: row[6]
});
// 获取音乐列表
const getMusicList = async (req, res) => {
    try {
        const db = await (0, db_1.default)();
        const result = db.exec('SELECT * FROM music ORDER BY created_at DESC');
        const music = result[0]?.values?.map(parseRow) || [];
        res.json({ music, total: music.length });
    }
    catch (error) {
        console.error('获取音乐列表失败:', error);
        res.status(500).json({ error: '获取音乐列表失败' });
    }
};
exports.getMusicList = getMusicList;
// 获取单首音乐
const getMusicById = async (req, res) => {
    try {
        const { id } = req.params;
        const db = await (0, db_1.default)();
        const result = db.exec('SELECT * FROM music WHERE id = ?', [Number(id)]);
        const rows = result[0]?.values;
        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: '音乐不存在' });
        }
        res.json({ music: parseRow(rows[0]) });
    }
    catch (error) {
        console.error('获取音乐详情失败:', error);
        res.status(500).json({ error: '获取音乐详情失败' });
    }
};
exports.getMusicById = getMusicById;
// 创建音乐
const createMusic = async (req, res) => {
    try {
        const { title, artist, url, cover, duration } = req.body;
        if (!title || !url) {
            return res.status(400).json({ error: '标题和音频地址不能为空' });
        }
        const db = await (0, db_1.default)();
        db.run('INSERT INTO music (title, artist, url, cover, duration) VALUES (?, ?, ?, ?, ?)', [title, artist || '', url, cover || '', duration || '00:00']);
        const maxIdResult = db.exec('SELECT MAX(id) FROM music');
        const lastId = maxIdResult[0]?.values?.[0]?.[0];
        if (!lastId) {
            return res.status(500).json({ error: '创建音乐失败' });
        }
        const queryResult = db.exec('SELECT * FROM music WHERE id = ?', [lastId]);
        const row = queryResult[0]?.values?.[0];
        await (0, db_1.saveDb)();
        res.status(201).json({ music: parseRow(row) });
    }
    catch (error) {
        console.error('创建音乐失败:', error);
        res.status(500).json({ error: '创建音乐失败' });
    }
};
exports.createMusic = createMusic;
// 更新音乐
const updateMusic = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, artist, url, cover, duration } = req.body;
        const db = await (0, db_1.default)();
        const existingResult = db.exec('SELECT * FROM music WHERE id = ?', [Number(id)]);
        if (!existingResult[0]?.values?.length) {
            return res.status(404).json({ error: '音乐不存在' });
        }
        const fields = [];
        const values = [];
        if (title !== undefined) {
            fields.push('title = ?');
            values.push(title);
        }
        if (artist !== undefined) {
            fields.push('artist = ?');
            values.push(artist);
        }
        if (url !== undefined) {
            fields.push('url = ?');
            values.push(url);
        }
        if (cover !== undefined) {
            fields.push('cover = ?');
            values.push(cover);
        }
        if (duration !== undefined) {
            fields.push('duration = ?');
            values.push(duration);
        }
        if (fields.length === 0) {
            return res.status(400).json({ error: '没有需要更新的字段' });
        }
        values.push(Number(id));
        db.run(`UPDATE music SET ${fields.join(', ')} WHERE id = ?`, values);
        await (0, db_1.saveDb)();
        const updatedResult = db.exec('SELECT * FROM music WHERE id = ?', [Number(id)]);
        const row = updatedResult[0]?.values?.[0];
        res.json({ music: parseRow(row) });
    }
    catch (error) {
        console.error('更新音乐失败:', error);
        res.status(500).json({ error: '更新音乐失败' });
    }
};
exports.updateMusic = updateMusic;
// 删除音乐
const deleteMusic = async (req, res) => {
    try {
        const { id } = req.params;
        const db = await (0, db_1.default)();
        const existingResult = db.exec('SELECT * FROM music WHERE id = ?', [Number(id)]);
        if (!existingResult[0]?.values?.length) {
            return res.status(404).json({ error: '音乐不存在' });
        }
        db.run('DELETE FROM music WHERE id = ?', [Number(id)]);
        await (0, db_1.saveDb)();
        res.json({ message: '删除成功' });
    }
    catch (error) {
        console.error('删除音乐失败:', error);
        res.status(500).json({ error: '删除音乐失败' });
    }
};
exports.deleteMusic = deleteMusic;
//# sourceMappingURL=musicController.js.map
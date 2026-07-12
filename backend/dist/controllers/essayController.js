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
exports.deleteEssay = exports.updateEssay = exports.createEssay = exports.getEssayById = exports.getEssays = void 0;
const db_1 = __importStar(require("../db"));
const parseEssay = (row) => {
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
const getEssays = async (req, res) => {
    try {
        const db = await (0, db_1.default)();
        const { search } = req.query;
        let sql = 'SELECT * FROM essays ORDER BY date DESC';
        const params = [];
        if (search && typeof search === 'string') {
            sql = 'SELECT * FROM essays WHERE title LIKE ? OR excerpt LIKE ? ORDER BY date DESC';
            params.push(`%${search}%`, `%${search}%`);
        }
        const result = db.exec(sql, params);
        const essays = result[0]?.values?.map(parseEssay) || [];
        res.json({ essays, total: essays.length });
    }
    catch (error) {
        console.error('获取随笔列表失败:', error);
        res.status(500).json({ error: '获取随笔列表失败' });
    }
};
exports.getEssays = getEssays;
const getEssayById = async (req, res) => {
    try {
        const { id } = req.params;
        const db = await (0, db_1.default)();
        const result = db.exec('SELECT * FROM essays WHERE id = ?', [Number(id)]);
        if (!result[0]?.values?.length) {
            return res.status(404).json({ error: '随笔未找到' });
        }
        const essay = parseEssay(result[0].values[0]);
        res.json({ essay });
    }
    catch (error) {
        console.error('获取随笔失败:', error);
        res.status(500).json({ error: '获取随笔失败' });
    }
};
exports.getEssayById = getEssayById;
const createEssay = async (req, res) => {
    try {
        const { title, content, excerpt, cover, date } = req.body;
        if (!title || !content) {
            return res.status(400).json({ error: '标题和内容不能为空' });
        }
        const db = await (0, db_1.default)();
        const result = db.run('INSERT INTO essays (title, content, excerpt, cover, date) VALUES (?, ?, ?, ?, ?)', [title, content, excerpt || '', cover || '', date || new Date().toISOString().split('T')[0]]);
        const lastId = db.exec('SELECT MAX(id) FROM essays')[0].values[0][0];
        const inserted = db.exec('SELECT * FROM essays WHERE id = ?', [lastId]);
        const essay = parseEssay(inserted[0].values[0]);
        await (0, db_1.saveDb)();
        res.status(201).json({ essay });
    }
    catch (error) {
        console.error('创建随笔失败:', error);
        res.status(500).json({ error: '创建随笔失败' });
    }
};
exports.createEssay = createEssay;
const updateEssay = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, excerpt, cover, date } = req.body;
        const db = await (0, db_1.default)();
        const existing = db.exec('SELECT * FROM essays WHERE id = ?', [Number(id)]);
        if (!existing[0]?.values?.length) {
            return res.status(404).json({ error: '随笔未找到' });
        }
        const result = db.run('UPDATE essays SET title = ?, content = ?, excerpt = ?, cover = ?, date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [title, content, excerpt || '', cover || '', date || '', Number(id)]);
        const updated = db.exec('SELECT * FROM essays WHERE id = ?', [Number(id)]);
        const essay = parseEssay(updated[0].values[0]);
        await (0, db_1.saveDb)();
        res.json({ essay });
    }
    catch (error) {
        console.error('更新随笔失败:', error);
        res.status(500).json({ error: '更新随笔失败' });
    }
};
exports.updateEssay = updateEssay;
const deleteEssay = async (req, res) => {
    try {
        const { id } = req.params;
        const db = await (0, db_1.default)();
        const existing = db.exec('SELECT * FROM essays WHERE id = ?', [Number(id)]);
        if (!existing[0]?.values?.length) {
            return res.status(404).json({ error: '随笔未找到' });
        }
        db.run('DELETE FROM essays WHERE id = ?', [Number(id)]);
        await (0, db_1.saveDb)();
        res.json({ message: '删除成功' });
    }
    catch (error) {
        console.error('删除随笔失败:', error);
        res.status(500).json({ error: '删除随笔失败' });
    }
};
exports.deleteEssay = deleteEssay;
//# sourceMappingURL=essayController.js.map
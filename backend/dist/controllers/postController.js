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
exports.deletePost = exports.updatePost = exports.createPost = exports.getPostById = exports.getPostTags = exports.getPostArchive = exports.getPosts = void 0;
const db_1 = __importStar(require("../db"));
const parseRow = (row) => ({
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
const getPosts = async (req, res) => {
    try {
        const db = await (0, db_1.default)();
        const { search, tag, sort = 'created_at', order = 'desc', limit } = req.query;
        let sql = 'SELECT * FROM posts';
        const conditions = [];
        const params = [];
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
        const sortField = allowedSortFields.includes(sort) ? sort : 'created_at';
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
    }
    catch (error) {
        console.error('获取文章列表失败:', error);
        res.status(500).json({ error: '获取文章列表失败' });
    }
};
exports.getPosts = getPosts;
// 获取归档数据（按年份/月份分组）
const getPostArchive = async (req, res) => {
    try {
        const cached = (0, db_1.getCache)('posts:archive');
        if (cached) {
            return res.json(cached);
        }
        const db = await (0, db_1.default)();
        const result = db.exec('SELECT id, title, created_at FROM posts ORDER BY created_at DESC');
        const rows = result[0]?.values || [];
        const archive = {};
        rows.forEach((row) => {
            const dateStr = String(row[2]);
            const date = new Date(dateStr);
            const year = date.getFullYear().toString();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            if (!archive[year])
                archive[year] = {};
            if (!archive[year][month])
                archive[year][month] = [];
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
        (0, db_1.setCache)('posts:archive', resultData);
        res.json(resultData);
    }
    catch (error) {
        console.error('获取归档数据失败:', error);
        res.status(500).json({ error: '获取归档数据失败' });
    }
};
exports.getPostArchive = getPostArchive;
// 获取所有标签及计数（归档页面侧边栏用）
const getPostTags = async (req, res) => {
    try {
        const db = await (0, db_1.default)();
        const result = db.exec('SELECT tags FROM posts');
        const rows = result[0]?.values || [];
        const tagCount = {};
        rows.forEach((row) => {
            const tags = JSON.parse(String(row[0] || '[]'));
            tags.forEach((t) => {
                tagCount[t] = (tagCount[t] || 0) + 1;
            });
        });
        const tags = Object.entries(tagCount)
            .sort(([, a], [, b]) => b - a)
            .map(([name, count]) => ({ name, count }));
        res.json({ tags, total: rows.length });
    }
    catch (error) {
        console.error('获取标签失败:', error);
        res.status(500).json({ error: '获取标签失败' });
    }
};
exports.getPostTags = getPostTags;
// 获取文章详情（参数化查询防 SQL 注入）
const getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        const db = await (0, db_1.default)();
        const result = db.exec('SELECT * FROM posts WHERE id = ?', [Number(id)]);
        const rows = result[0]?.values;
        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: '文章不存在' });
        }
        // 浏览量 +1
        db.run('UPDATE posts SET views = views + 1 WHERE id = ?', [Number(id)]);
        await (0, db_1.saveDb)();
        res.json({ post: parseRow(rows[0]) });
    }
    catch (error) {
        console.error('获取文章详情失败:', error);
        res.status(500).json({ error: '获取文章详情失败' });
    }
};
exports.getPostById = getPostById;
// 创建文章
const createPost = async (req, res) => {
    try {
        const { title, content, excerpt, slug, cover, tags } = req.body;
        if (!title || !content || !excerpt || !slug) {
            return res.status(400).json({ error: '标题、内容、摘要和 slug 不能为空' });
        }
        const db = await (0, db_1.default)();
        const tagsJson = JSON.stringify(tags || []);
        const now = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);
        db.run('INSERT INTO posts (title, content, excerpt, slug, cover, tags, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [title, content, excerpt, slug, cover || null, tagsJson, now, now]);
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
        await (0, db_1.saveDb)();
        (0, db_1.invalidateCache)('posts');
        res.status(201).json({ post: parseRow(row) });
    }
    catch (error) {
        if (error.message?.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'slug 已存在' });
        }
        console.error('创建文章失败:', error);
        res.status(500).json({ error: '创建文章失败' });
    }
};
exports.createPost = createPost;
// 更新文章
const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, excerpt, cover, tags } = req.body;
        const db = await (0, db_1.default)();
        const existingResult = db.exec('SELECT * FROM posts WHERE id = ?', [Number(id)]);
        if (!existingResult[0]?.values?.length) {
            return res.status(404).json({ error: '文章不存在' });
        }
        const fields = [];
        const values = [];
        if (title !== undefined) {
            fields.push('title = ?');
            values.push(title);
        }
        if (content !== undefined) {
            fields.push('content = ?');
            values.push(content);
        }
        if (excerpt !== undefined) {
            fields.push('excerpt = ?');
            values.push(excerpt);
        }
        if (cover !== undefined) {
            fields.push('cover = ?');
            values.push(cover);
        }
        if (tags !== undefined) {
            fields.push('tags = ?');
            values.push(JSON.stringify(tags));
        }
        const now = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);
        fields.push('updated_at = ?');
        values.push(now);
        values.push(Number(id));
        db.run(`UPDATE posts SET ${fields.join(', ')} WHERE id = ?`, values);
        await (0, db_1.saveDb)();
        (0, db_1.invalidateCache)('posts');
        const updatedResult = db.exec('SELECT * FROM posts WHERE id = ?', [Number(id)]);
        const row = updatedResult[0]?.values?.[0];
        res.json({ post: parseRow(row) });
    }
    catch (error) {
        if (error.message?.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'slug 已存在' });
        }
        console.error('更新文章失败:', error);
        res.status(500).json({ error: '更新文章失败' });
    }
};
exports.updatePost = updatePost;
// 删除文章
const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const db = await (0, db_1.default)();
        const existingResult = db.exec('SELECT * FROM posts WHERE id = ?', [Number(id)]);
        if (!existingResult[0]?.values?.length) {
            return res.status(404).json({ error: '文章不存在' });
        }
        db.run('DELETE FROM posts WHERE id = ?', [Number(id)]);
        await (0, db_1.saveDb)();
        (0, db_1.invalidateCache)('posts');
        res.json({ message: '删除成功' });
    }
    catch (error) {
        console.error('删除文章失败:', error);
        res.status(500).json({ error: '删除文章失败' });
    }
};
exports.deletePost = deletePost;
//# sourceMappingURL=postController.js.map
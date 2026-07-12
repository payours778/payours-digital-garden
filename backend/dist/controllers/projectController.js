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
exports.getProjectStats = exports.deleteProject = exports.updateProject = exports.createProject = exports.getProjectById = exports.getProjects = void 0;
const db_1 = __importStar(require("../db"));
const parseRow = (row) => ({
    id: row[0],
    name: row[1],
    description: row[2],
    tech: JSON.parse(row[3] || '[]'),
    link: row[4],
    stars: row[5],
    created_at: row[6]
});
// 获取项目列表（支持搜索、按技术栈筛选、按 stars/created_at 排序）
const getProjects = async (req, res) => {
    try {
        const db = await (0, db_1.default)();
        const { search, tech, sort = 'created_at', order = 'desc' } = req.query;
        let sql = 'SELECT * FROM projects';
        const conditions = [];
        const params = [];
        // 按名称/描述搜索
        if (search && typeof search === 'string') {
            conditions.push('(name LIKE ? OR description LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }
        // 按技术栈筛选（tech 字段是 JSON 数组字符串，用 LIKE 匹配）
        if (tech && typeof tech === 'string') {
            conditions.push('tech LIKE ?');
            params.push(`%"${tech}"%`);
        }
        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        // 排序（白名单校验，防止 SQL 注入）
        const allowedSortFields = ['created_at', 'stars', 'name'];
        const sortField = allowedSortFields.includes(sort) ? sort : 'created_at';
        const orderClause = order === 'asc' ? 'ASC' : 'DESC';
        sql += ` ORDER BY ${sortField} ${orderClause}`;
        const result = db.exec(sql, params);
        const projects = result[0]?.values?.map(parseRow) || [];
        res.json({ projects, total: projects.length });
    }
    catch (error) {
        console.error('获取项目列表失败:', error);
        res.status(500).json({ error: '获取项目列表失败' });
    }
};
exports.getProjects = getProjects;
// 获取项目详情（参数化查询防 SQL 注入）
const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const db = await (0, db_1.default)();
        const result = db.exec('SELECT * FROM projects WHERE id = ?', [Number(id)]);
        const rows = result[0]?.values;
        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: '项目不存在' });
        }
        res.json({ project: parseRow(rows[0]) });
    }
    catch (error) {
        console.error('获取项目详情失败:', error);
        res.status(500).json({ error: '获取项目详情失败' });
    }
};
exports.getProjectById = getProjectById;
// 创建项目
const createProject = async (req, res) => {
    try {
        const { name, description, tech, link, stars } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: '项目名称不能为空' });
        }
        const db = await (0, db_1.default)();
        const techJson = JSON.stringify(tech || []);
        const now = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);
        db.run('INSERT INTO projects (name, description, tech, link, stars, created_at) VALUES (?, ?, ?, ?, ?, ?)', [name.trim(), description || '', techJson, link || '', stars || 0, now]);
        const maxIdResult = db.exec('SELECT MAX(id) FROM projects');
        const lastId = maxIdResult[0]?.values?.[0]?.[0];
        if (!lastId) {
            return res.status(500).json({ error: '创建项目失败' });
        }
        const queryResult = db.exec('SELECT * FROM projects WHERE id = ?', [lastId]);
        const row = queryResult[0]?.values?.[0];
        if (!row) {
            return res.status(500).json({ error: '创建项目失败' });
        }
        await (0, db_1.saveDb)();
        res.status(201).json({ project: parseRow(row) });
    }
    catch (error) {
        console.error('创建项目失败:', error);
        res.status(500).json({ error: '创建项目失败' });
    }
};
exports.createProject = createProject;
// 更新项目
const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, tech, link, stars } = req.body;
        const db = await (0, db_1.default)();
        const existingResult = db.exec('SELECT * FROM projects WHERE id = ?', [Number(id)]);
        if (!existingResult[0]?.values?.length) {
            return res.status(404).json({ error: '项目不存在' });
        }
        const fields = [];
        const values = [];
        if (name !== undefined) {
            fields.push('name = ?');
            values.push(name.trim());
        }
        if (description !== undefined) {
            fields.push('description = ?');
            values.push(description);
        }
        if (tech !== undefined) {
            fields.push('tech = ?');
            values.push(JSON.stringify(tech));
        }
        if (link !== undefined) {
            fields.push('link = ?');
            values.push(link);
        }
        if (stars !== undefined) {
            fields.push('stars = ?');
            values.push(stars);
        }
        if (fields.length > 0) {
            values.push(Number(id));
            db.run(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`, values);
            await (0, db_1.saveDb)();
        }
        const updatedResult = db.exec('SELECT * FROM projects WHERE id = ?', [Number(id)]);
        const row = updatedResult[0]?.values?.[0];
        res.json({ project: parseRow(row) });
    }
    catch (error) {
        console.error('更新项目失败:', error);
        res.status(500).json({ error: '更新项目失败' });
    }
};
exports.updateProject = updateProject;
// 删除项目
const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const db = await (0, db_1.default)();
        const existingResult = db.exec('SELECT * FROM projects WHERE id = ?', [Number(id)]);
        if (!existingResult[0]?.values?.length) {
            return res.status(404).json({ error: '项目不存在' });
        }
        db.run('DELETE FROM projects WHERE id = ?', [Number(id)]);
        await (0, db_1.saveDb)();
        res.json({ message: '删除成功' });
    }
    catch (error) {
        console.error('删除项目失败:', error);
        res.status(500).json({ error: '删除项目失败' });
    }
};
exports.deleteProject = deleteProject;
// 获取项目统计信息
const getProjectStats = async (req, res) => {
    try {
        const db = await (0, db_1.default)();
        // 项目总数
        const countResult = db.exec('SELECT COUNT(*) FROM projects');
        const total = countResult[0]?.values?.[0]?.[0] || 0;
        // 总 stars 数
        const starsResult = db.exec('SELECT SUM(stars) FROM projects');
        const totalStars = starsResult[0]?.values?.[0]?.[0] || 0;
        // 技术栈统计（聚合所有项目的 tech 数组）
        const allResult = db.exec('SELECT tech FROM projects');
        const techRows = allResult[0]?.values || [];
        const techCount = {};
        techRows.forEach((row) => {
            const techs = JSON.parse(String(row[0] || '[]'));
            techs.forEach((t) => {
                techCount[t] = (techCount[t] || 0) + 1;
            });
        });
        // 按使用次数降序
        const topTech = Object.entries(techCount)
            .sort(([, a], [, b]) => b - a)
            .map(([name, count]) => ({ name, count }));
        res.json({
            total,
            totalStars,
            topTech,
        });
    }
    catch (error) {
        console.error('获取项目统计失败:', error);
        res.status(500).json({ error: '获取项目统计失败' });
    }
};
exports.getProjectStats = getProjectStats;
//# sourceMappingURL=projectController.js.map
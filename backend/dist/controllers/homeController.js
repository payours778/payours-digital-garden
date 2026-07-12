"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHomeData = void 0;
const db_1 = __importDefault(require("../db"));
const parsePostRow = (row) => ({
    id: row[0],
    title: row[1],
    content: row[2],
    excerpt: row[3],
    slug: row[4],
    cover: row[5],
    tags: row[6] ? JSON.parse(String(row[6])) : [],
    views: row[7],
    created_at: row[8],
    updated_at: row[9]
});
const parseMomentRow = (row) => ({
    id: row[0],
    content: row[1],
    images: row[2] ? JSON.parse(String(row[2])) : [],
    likes: row[3],
    created_at: row[4]
});
const getHomeData = async (req, res) => {
    try {
        const db = await (0, db_1.default)();
        const postsResult = db.exec('SELECT * FROM posts ORDER BY created_at DESC LIMIT 4');
        const posts = postsResult[0]?.values?.map(parsePostRow) || [];
        const momentsResult = db.exec('SELECT * FROM moments ORDER BY created_at DESC LIMIT 1');
        const latestMoment = momentsResult[0]?.values?.[0] ? parseMomentRow(momentsResult[0].values[0]) : null;
        const postCountResult = db.exec('SELECT COUNT(*) FROM posts');
        const postCount = postCountResult[0]?.values?.[0]?.[0] || 0;
        const momentCountResult = db.exec('SELECT COUNT(*) FROM moments');
        const momentCount = momentCountResult[0]?.values?.[0]?.[0] || 0;
        res.json({
            posts,
            latestMoment,
            stats: {
                posts: postCount,
                moments: momentCount,
                photos: 11
            }
        });
    }
    catch (error) {
        console.error('获取首页数据失败:', error);
        res.status(500).json({ error: '获取首页数据失败' });
    }
};
exports.getHomeData = getHomeData;
//# sourceMappingURL=homeController.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCache = getCache;
exports.setCache = setCache;
exports.invalidateCache = invalidateCache;
exports.getDb = getDb;
exports.saveDb = saveDb;
const sql_js_1 = __importDefault(require("sql.js"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dbPath = path_1.default.join(__dirname, '../../../database/blog.db');
const wasmPath = path_1.default.join(__dirname, '../../node_modules/sql.js/dist/sql-wasm.wasm');
let db = null;
const cache = {};
const CACHE_TTL = 5 * 60 * 1000;
function getCache(key) {
    const entry = cache[key];
    if (!entry)
        return null;
    if (Date.now() - entry.timestamp > CACHE_TTL) {
        delete cache[key];
        return null;
    }
    return entry.data;
}
function setCache(key, data) {
    cache[key] = { data, timestamp: Date.now() };
}
function invalidateCache(pattern) {
    if (pattern) {
        Object.keys(cache).forEach((key) => {
            if (key.includes(pattern)) {
                delete cache[key];
            }
        });
    }
    else {
        Object.keys(cache).forEach((key) => delete cache[key]);
    }
}
async function getDb() {
    if (db)
        return db;
    const SQL = await (0, sql_js_1.default)({
        locateFile: () => wasmPath
    });
    if (fs_1.default.existsSync(dbPath)) {
        const buffer = fs_1.default.readFileSync(dbPath);
        db = new SQL.Database(buffer);
    }
    else {
        db = new SQL.Database();
    }
    // 自动建表（IF NOT EXISTS，不影响现有数据）
    db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      excerpt TEXT,
      slug TEXT UNIQUE NOT NULL,
      cover TEXT,
      tags TEXT DEFAULT '[]',
      views INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS moments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      images TEXT DEFAULT '[]',
      likes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS albums (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      cover_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      album_id INTEGER,
      url TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      tech TEXT DEFAULT '[]',
      link TEXT,
      stars INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS music (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      artist TEXT,
      url TEXT NOT NULL,
      cover TEXT,
      duration TEXT DEFAULT '00:00',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
    // 自动迁移：给旧 posts 表补 tags 字段（如果不存在）
    const postsCols = db.exec("PRAGMA table_info(posts)");
    const hasTags = postsCols[0]?.values?.some((row) => row[1] === 'tags');
    if (!hasTags) {
        db.run("ALTER TABLE posts ADD COLUMN tags TEXT DEFAULT '[]'");
    }
    // 自动迁移：给旧 music 表补 duration 字段（如果不存在）
    const musicCols = db.exec("PRAGMA table_info(music)");
    const hasDuration = musicCols[0]?.values?.some((row) => row[1] === 'duration');
    if (!hasDuration) {
        db.run("ALTER TABLE music ADD COLUMN duration TEXT DEFAULT '00:00'");
    }
    return db;
}
async function saveDb() {
    const database = await getDb();
    const data = database.export();
    const dataDir = path_1.default.dirname(dbPath);
    if (!fs_1.default.existsSync(dataDir)) {
        fs_1.default.mkdirSync(dataDir, { recursive: true });
    }
    fs_1.default.writeFileSync(dbPath, Buffer.from(data));
}
exports.default = getDb;
//# sourceMappingURL=index.js.map
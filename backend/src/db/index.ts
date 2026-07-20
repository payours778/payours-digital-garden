import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(__dirname, '../../../database/blog.db');
const wasmPath = path.join(__dirname, '../../node_modules/sql.js/dist/sql-wasm.wasm');

let db: Database | null = null;

interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache: Record<string, CacheEntry> = {};
const CACHE_TTL = 5 * 60 * 1000;

export function getCache(key: string): any | null {
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    delete cache[key];
    return null;
  }
  return entry.data;
}

export function setCache(key: string, data: any): void {
  cache[key] = { data, timestamp: Date.now() };
}

export function invalidateCache(pattern?: string): void {
  if (pattern) {
    Object.keys(cache).forEach((key) => {
      if (key.includes(pattern)) {
        delete cache[key];
      }
    });
  } else {
    Object.keys(cache).forEach((key) => delete cache[key]);
  }
}

export async function getDb(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs({
    locateFile: () => wasmPath
  });

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
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
    CREATE TABLE IF NOT EXISTS fish_rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      participant1_id INTEGER,
      participant1_nickname TEXT,
      participant2_id INTEGER,
      participant2_nickname TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS fish_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER,
      sender_id INTEGER,
      sender_nickname TEXT,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES fish_rooms(id) ON DELETE CASCADE
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

  // 自动迁移：给旧 fish_rooms 表补 nickname 字段（如果不存在）
  const fishRoomsCols = db.exec("PRAGMA table_info(fish_rooms)");
  const hasP1Nick = fishRoomsCols[0]?.values?.some((row) => row[1] === 'participant1_nickname');
  if (!hasP1Nick) {
    db.run("ALTER TABLE fish_rooms ADD COLUMN participant1_nickname TEXT DEFAULT '用户1'");
  }
  const hasP2Nick = fishRoomsCols[0]?.values?.some((row) => row[1] === 'participant2_nickname');
  if (!hasP2Nick) {
    db.run("ALTER TABLE fish_rooms ADD COLUMN participant2_nickname TEXT DEFAULT '用户2'");
  }

  // 自动迁移：给旧 fish_messages 表补 sender_nickname 字段（如果不存在）
  const fishMessagesCols = db.exec("PRAGMA table_info(fish_messages)");
  const hasSenderNick = fishMessagesCols[0]?.values?.some((row) => row[1] === 'sender_nickname');
  if (!hasSenderNick) {
    db.run("ALTER TABLE fish_messages ADD COLUMN sender_nickname TEXT");
  }

  // 初始化10个固定房间码
  const fixedCodes = ['FISH01', 'FISH02', 'FISH03', 'FISH04', 'FISH05', 'FISH06', 'FISH07', 'FISH08', 'FISH09', 'FISH10'];
  fixedCodes.forEach((code) => {
    db.run("INSERT OR IGNORE INTO fish_rooms (code) VALUES (?)", [code]);
  });

  return db;
}

export async function saveDb(): Promise<void> {
  const database = await getDb();
  const data = database.export();
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(dbPath, Buffer.from(data));
}

export default getDb;

import initSqlJs, { Database } from "sql.js";
import fs from "fs";
import path from "path";

const dbPath = path.join(__dirname, "../../../database/blog.db");
const wasmPath = path.join(__dirname, "../../node_modules/sql.js/dist/sql-wasm.wasm");

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

const ROOM_COUNT = 100;
const MAX_PARTICIPANTS = 10;

export async function getDb(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs({
    locateFile: () => wasmPath,
  });

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Use db.exec() for multi-statement SQL
  db.exec(
    "CREATE TABLE IF NOT EXISTS posts (" +
    "  id INTEGER PRIMARY KEY AUTOINCREMENT," +
    "  title TEXT NOT NULL," +
    "  content TEXT NOT NULL," +
    "  excerpt TEXT," +
    "  slug TEXT UNIQUE NOT NULL," +
    "  cover TEXT," +
    "  tags TEXT DEFAULT '[]'," +
    "  views INTEGER DEFAULT 0," +
    "  created_at DATETIME DEFAULT CURRENT_TIMESTAMP," +
    "  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP" +
    ");" +
    "CREATE TABLE IF NOT EXISTS moments (" +
    "  id INTEGER PRIMARY KEY AUTOINCREMENT," +
    "  content TEXT NOT NULL," +
    "  images TEXT DEFAULT '[]'," +
    "  likes INTEGER DEFAULT 0," +
    "  created_at DATETIME DEFAULT CURRENT_TIMESTAMP" +
    ");" +
    "CREATE TABLE IF NOT EXISTS albums (" +
    "  id INTEGER PRIMARY KEY AUTOINCREMENT," +
    "  name TEXT NOT NULL," +
    "  description TEXT," +
    "  cover_url TEXT," +
    "  created_at DATETIME DEFAULT CURRENT_TIMESTAMP" +
    ");" +
    "CREATE TABLE IF NOT EXISTS photos (" +
    "  id INTEGER PRIMARY KEY AUTOINCREMENT," +
    "  album_id INTEGER," +
    "  url TEXT NOT NULL," +
    "  description TEXT," +
    "  created_at DATETIME DEFAULT CURRENT_TIMESTAMP," +
    "  FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE" +
    ");" +
    "CREATE TABLE IF NOT EXISTS projects (" +
    "  id INTEGER PRIMARY KEY AUTOINCREMENT," +
    "  name TEXT NOT NULL," +
    "  description TEXT," +
    "  tech TEXT DEFAULT '[]'," +
    "  link TEXT," +
    "  stars INTEGER DEFAULT 0," +
    "  created_at DATETIME DEFAULT CURRENT_TIMESTAMP" +
    ");" +
    "CREATE TABLE IF NOT EXISTS music (" +
    "  id INTEGER PRIMARY KEY AUTOINCREMENT," +
    "  title TEXT NOT NULL," +
    "  artist TEXT," +
    "  url TEXT NOT NULL," +
    "  cover TEXT," +
    "  duration TEXT DEFAULT '00:00'," +
    "  created_at DATETIME DEFAULT CURRENT_TIMESTAMP" +
    ");" +
    "CREATE TABLE IF NOT EXISTS fish_rooms (" +
    "  id INTEGER PRIMARY KEY AUTOINCREMENT," +
    "  code TEXT UNIQUE NOT NULL," +
    "  max_participants INTEGER DEFAULT 10," +
    "  created_at DATETIME DEFAULT CURRENT_TIMESTAMP" +
    ");" +
    "CREATE TABLE IF NOT EXISTS fish_room_participants (" +
    "  id INTEGER PRIMARY KEY AUTOINCREMENT," +
    "  room_id INTEGER," +
    "  token TEXT," +
    "  nickname TEXT NOT NULL," +
    "  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP," +
    "  last_active DATETIME DEFAULT CURRENT_TIMESTAMP," +
    "  FOREIGN KEY (room_id) REFERENCES fish_rooms(id) ON DELETE CASCADE" +
    ");" +
    "CREATE TABLE IF NOT EXISTS fish_messages (" +
    "  id INTEGER PRIMARY KEY AUTOINCREMENT," +
    "  room_id INTEGER," +
    "  sender_nickname TEXT," +
    "  content TEXT NOT NULL," +
    "  created_at DATETIME DEFAULT CURRENT_TIMESTAMP," +
    "  FOREIGN KEY (room_id) REFERENCES fish_rooms(id) ON DELETE CASCADE" +
    ");"
  );

  // Migrations for existing databases that may have missing columns
  const fishPartCols = db.exec("PRAGMA table_info(fish_room_participants)");
  const hasToken = fishPartCols[0]?.values?.some((row: any) => row[1] === "token");
  if (!hasToken) {
    db.run("ALTER TABLE fish_room_participants ADD COLUMN token TEXT");
    db.run("UPDATE fish_room_participants SET token = 'legacy_' || id WHERE token IS NULL");
  }

  // Remove legacy columns if they exist
  try { db.run("ALTER TABLE fish_rooms DROP COLUMN participant1_nickname"); } catch {}
  try { db.run("ALTER TABLE fish_rooms DROP COLUMN participant2_nickname"); } catch {}

  // Initialize 100 rooms
  const existingResult = db.exec("SELECT COUNT(*) FROM fish_rooms");
  const existingCount = Number(existingResult[0]?.values?.[0]?.[0] || 0);
  if (existingCount < ROOM_COUNT) {
    db.run("DELETE FROM fish_rooms");
    for (let i = 0; i < ROOM_COUNT; i++) {
      const code = "FISH" + String(i).padStart(2, "0");
      db!.run("INSERT OR IGNORE INTO fish_rooms (code) VALUES (?)", [code]);
    }
  }

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

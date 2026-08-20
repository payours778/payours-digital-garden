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

const MAX_PARTICIPANTS = 10;
export { MAX_PARTICIPANTS };

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

  // ---- 所有表 CREATE IF NOT EXISTS（列名对齐真实线上库 + controllers 按位置解析顺序）----
  db.exec(
    "CREATE TABLE IF NOT EXISTS posts (" +
    "  id INTEGER PRIMARY KEY AUTOINCREMENT," +
    "  title TEXT NOT NULL," +
    "  content TEXT NOT NULL," +
    "  excerpt TEXT," +
    "  slug TEXT UNIQUE NOT NULL," +
    "  cover TEXT," +
    "  views INTEGER DEFAULT 0," +
    "  created_at DATETIME DEFAULT CURRENT_TIMESTAMP," +
    "  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP," +
    "  tags TEXT DEFAULT '[]'" +
    ");" +
    "CREATE TABLE IF NOT EXISTS users (" +
    "  id INTEGER PRIMARY KEY AUTOINCREMENT," +
    "  username TEXT UNIQUE NOT NULL," +
    "  password_hash TEXT NOT NULL," +
    "  phone TEXT UNIQUE," +
    "  role TEXT DEFAULT 'user'," +
    "  created_at DATETIME DEFAULT CURRENT_TIMESTAMP," +
    "  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP" +
    ");" +
    "CREATE TABLE IF NOT EXISTS essays (" +
    "  id INTEGER PRIMARY KEY AUTOINCREMENT," +
    "  title TEXT NOT NULL," +
    "  content TEXT NOT NULL," +
    "  excerpt TEXT," +
    "  cover TEXT," +
    "  date TEXT," +
    "  created_at DATETIME DEFAULT CURRENT_TIMESTAMP" +
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
    "  description TEXT DEFAULT ''," +
    "  cover TEXT DEFAULT ''," +
    "  created_at DATETIME DEFAULT CURRENT_TIMESTAMP" +
    ");" +
    "CREATE TABLE IF NOT EXISTS photos (" +
    "  id INTEGER PRIMARY KEY AUTOINCREMENT," +
    "  album_id INTEGER NOT NULL," +
    "  url TEXT NOT NULL," +
    "  caption TEXT DEFAULT ''," +
    "  created_at DATETIME DEFAULT CURRENT_TIMESTAMP" +
    ");" +
    "CREATE TABLE IF NOT EXISTS projects (" +
    "  id INTEGER PRIMARY KEY AUTOINCREMENT," +
    "  name TEXT NOT NULL," +
    "  description TEXT DEFAULT ''," +
    "  tech TEXT DEFAULT '[]'," +
    "  link TEXT DEFAULT ''," +
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
    "  owner_id INTEGER," +
    "  room_type TEXT NOT NULL DEFAULT 'private'," +
    "  lifecycle TEXT NOT NULL DEFAULT 'permanent'," +
    "  is_public INTEGER NOT NULL DEFAULT 0," +
    "  max_participants INTEGER DEFAULT 10," +
    "  destroyed_at DATETIME," +
    "  created_at DATETIME DEFAULT CURRENT_TIMESTAMP" +
    ");" +
    "CREATE TABLE IF NOT EXISTS fish_room_participants (" +
    "  id INTEGER PRIMARY KEY AUTOINCREMENT," +
    "  room_id INTEGER," +
    "  token TEXT," +
    "  nickname TEXT NOT NULL," +
    "  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP," +
    "  last_active DATETIME DEFAULT CURRENT_TIMESTAMP" +
    ");" +
    "CREATE TABLE IF NOT EXISTS fish_messages (" +
    "  id INTEGER PRIMARY KEY AUTOINCREMENT," +
    "  room_id INTEGER," +
    "  sender_nickname TEXT," +
    "  content TEXT NOT NULL," +
    "  created_at DATETIME DEFAULT CURRENT_TIMESTAMP" +
    ");" +
    // ---- 灵境游戏：农场数据（每个用户一行）----
    "CREATE TABLE IF NOT EXISTS game_farm_states (" +
    "  id INTEGER PRIMARY KEY AUTOINCREMENT," +
    "  user_id INTEGER NOT NULL UNIQUE," +
    "  coins INTEGER DEFAULT 100," +
    "  level INTEGER DEFAULT 1," +
    "  exp INTEGER DEFAULT 0," +
    "  plots TEXT DEFAULT '[]'," +
    "  inventory TEXT DEFAULT '[]'," +
    "  seed_inventory TEXT DEFAULT '[{\"cropId\":\"wheat\",\"count\":8},{\"cropId\":\"carrot\",\"count\":5},{\"cropId\":\"tomato\",\"count\":3}]'," +
    "  item_inventory TEXT DEFAULT '[]'," +
    "  active_buffs TEXT DEFAULT '[]'," +
    "  growth_boost_multiplier INTEGER DEFAULT 1," +
    "  refresh_count INTEGER DEFAULT 0," +
    "  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP" +
    ");"
  );

  // ---- 列缺失自动补齐（旧库升级，SQLite 不能 RENAME/DROP 列，旧列保留忽略）----
  const ensureCol = (table: string, col: string, def: string) => {
    const rows = db!.exec(`PRAGMA table_info(${table})`)[0]?.values || [];
    if (!rows.some((r: any) => r[1] === col)) {
      try { db!.run(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`); } catch {}
    }
  };
  ensureCol("posts", "tags", "TEXT DEFAULT '[]'");
  ensureCol("essays", "date", "TEXT");
  ensureCol("essays", "excerpt", "TEXT");
  ensureCol("essays", "cover", "TEXT");
  ensureCol("essays", "created_at", "DATETIME DEFAULT CURRENT_TIMESTAMP");
  ensureCol("users", "password_hash", "TEXT");
  ensureCol("users", "phone", "TEXT");
  ensureCol("users", "updated_at", "DATETIME DEFAULT CURRENT_TIMESTAMP");
  ensureCol("fish_room_participants", "token", "TEXT");
  ensureCol("fish_room_participants", "last_active", "DATETIME DEFAULT CURRENT_TIMESTAMP");
  ensureCol("fish_rooms", "owner_id", "INTEGER");
  ensureCol("fish_rooms", "room_type", "TEXT NOT NULL DEFAULT 'private'");
  ensureCol("fish_rooms", "lifecycle", "TEXT NOT NULL DEFAULT 'permanent'");
  ensureCol("fish_rooms", "is_public", "INTEGER NOT NULL DEFAULT 0");
  ensureCol("fish_rooms", "destroyed_at", "DATETIME");
  try { db!.run("UPDATE fish_room_participants SET token = 'legacy_' || id WHERE token IS NULL"); } catch {}
  try { db!.run("ALTER TABLE fish_rooms DROP COLUMN participant1_nickname"); } catch {}
  try { db!.run("ALTER TABLE fish_rooms DROP COLUMN participant2_nickname"); } catch {}

  // ---- 索引（CREATE INDEX IF NOT EXISTS 幂等，应用每次启动都会校验）----
  db.exec(
    "CREATE INDEX IF NOT EXISTS idx_posts_created      ON posts(created_at DESC);" +
    "CREATE INDEX IF NOT EXISTS idx_posts_slug         ON posts(slug);" +
    "CREATE INDEX IF NOT EXISTS idx_essays_date        ON essays(date DESC);" +
    "CREATE INDEX IF NOT EXISTS idx_moments_created    ON moments(created_at DESC);" +
    "CREATE INDEX IF NOT EXISTS idx_albums_created     ON albums(created_at DESC);" +
    "CREATE INDEX IF NOT EXISTS idx_photos_album       ON photos(album_id, created_at DESC);" +
    "CREATE INDEX IF NOT EXISTS idx_projects_created   ON projects(created_at DESC);" +
    "CREATE INDEX IF NOT EXISTS idx_music_created      ON music(created_at DESC);" +
    "CREATE INDEX IF NOT EXISTS idx_fish_rooms_code    ON fish_rooms(code);" +
    "CREATE INDEX IF NOT EXISTS idx_fish_participants_room  ON fish_room_participants(room_id, last_active);" +
    "CREATE INDEX IF NOT EXISTS idx_fish_participants_token ON fish_room_participants(token);" +
    "CREATE INDEX IF NOT EXISTS idx_fish_messages_room       ON fish_messages(room_id, id);" +
    "CREATE INDEX IF NOT EXISTS idx_users_username           ON users(username);" +
    "CREATE INDEX IF NOT EXISTS idx_game_farm_user           ON game_farm_states(user_id);"
  );

  // ---- 旧的固定 FISHxx 房间不再预创建（已由 RoomPool 资源池动态管理）----
  // 公开大厅房由 backend/src/services/roomPool.ts 的 ensurePublicRooms() 在启动时初始化。

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

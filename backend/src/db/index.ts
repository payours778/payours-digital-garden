import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// ---- MySQL 连接池（替代原 sql.js 内存数据库）----
const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "blog",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "blog_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
  timezone: "+08:00", // 与业务生成的北京时间保持一致
});

// ---- 缓存（沿用原有实现，不依赖数据库）----
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

// ---- 兼容 sql.js 的结果结构 ----
// 原 sql.js: db.exec(sql) 返回 [{ columns: string[], values: any[][] }]
// 这里转换成相同结构，控制器里的解析逻辑（result[0].values）无需改动。
interface SqlJsLikeResult {
  columns: string[];
  values: any[][];
}

interface SqlJsLikeDb {
  exec(sql: string, params?: any[]): Promise<SqlJsLikeResult[]>;
  run(sql: string, params?: any[]): Promise<{ changes: number; lastInsertRowid: number | null }>;
}

let dbInstance: SqlJsLikeDb | null = null;

export async function getDb(): Promise<SqlJsLikeDb> {
  if (dbInstance) return dbInstance;

  dbInstance = {
    /**
     * 执行一条 SQL，返回 sql.js 兼容的 [{ columns, values }]。
     * SELECT 以行数组形式返回（values 是二维数组，位置索引和原来一致）。
     */
    async exec(sql, params) {
      const [rows, fields] = await pool.query(sql, params);
      if (Array.isArray(rows)) {
        const columns = fields.map((f) => f.name);
        const values = rows.map((row: any) => columns.map((c) => row[c]));
        return [{ columns, values }];
      }
      // INSERT/UPDATE/DELETE 走 exec 时返回空结果集（原 sql.js exec 同样不返回 data）
      return [{ columns: [], values: [] }];
    },

    /**
     * 执行写操作，返回 { changes, lastInsertRowid }。
     * lastInsertRowid 对应 AUTO_INCREMENT 生成的 id。
     */
    async run(sql, params) {
      const [result] = await pool.query(sql, params);
      const ok = result as mysql.ResultSetHeader;
      return {
        changes: ok.affectedRows ?? 0,
        lastInsertRowid: ok.insertId
          ? Number(ok.insertId)
          : (ok.insertId ?? null),
      };
    },
  };

  return dbInstance;
}

export default getDb;
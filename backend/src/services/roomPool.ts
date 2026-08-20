import crypto from 'crypto';
import { getDb, saveDb } from '../db';

export type RoomType = 'public' | 'private';
export type Lifecycle = 'temp' | 'permanent';

export interface RoomRow {
  id: number;
  code: string;
  owner_id: number | null;
  room_type: RoomType;
  lifecycle: Lifecycle;
  is_public: 0 | 1;
  max_participants: number;
  destroyed_at: string | null;
  created_at: string;
}

export interface CreateRoomOptions {
  ownerId: number;
  username: string;
  isPublic: boolean;
  lifecycle: Lifecycle;
  maxParticipants?: number;
}

export interface CreateRoomResult {
  room: RoomRow;
  token: string;
}

// 持久公开大厅房（固定 code，启动时确保存在）
const PUBLIC_ROOM_CODES = ['PUBLIC-LOBBY-1', 'PUBLIC-LOBBY-2'];
const PUBLIC_ROOM_NAMES = {
  'PUBLIC-LOBBY-1': '公开大厅 · 闲聊',
  'PUBLIC-LOBBY-2': '公开大厅 · 水群',
} as const;

const ACTIVE_TIMEOUT_SECONDS = 3600;

// 统一列清单：与 parseRoomRow 的位置一一对应（避免依赖 SELECT * 的实际列顺序）
export const ROOM_COLUMNS =
  'id, code, owner_id, room_type, lifecycle, is_public, max_participants, destroyed_at, created_at';

const parseRoomRow = (row: any[]): RoomRow => ({
  id: row[0],
  code: row[1],
  owner_id: row[2],
  room_type: row[3] as RoomType,
  lifecycle: row[4] as Lifecycle,
  is_public: row[5] as 0 | 1,
  max_participants: row[6],
  destroyed_at: row[7],
  created_at: row[8],
});

export const roomPool = {
  // 启动时确保 2 个持久公开大厅房存在（幂等）
  async ensurePublicRooms(): Promise<void> {
    const db = await getDb();
    for (const code of PUBLIC_ROOM_CODES) {
      const exists = db.exec('SELECT id FROM fish_rooms WHERE code = ?', [code]);
      if (!exists[0]?.values?.length) {
        db.run(
          "INSERT INTO fish_rooms (code, owner_id, room_type, lifecycle, is_public, max_participants) VALUES (?, NULL, 'public', 'permanent', 1, 50)",
          [code]
        );
      }
    }
    await saveDb();
  },

  // 创建私有房：随机不可猜 code，仅持链接可进
  async createPrivateRoom(opts: CreateRoomOptions): Promise<CreateRoomResult> {
    const db = await getDb();
    const code = 'rm_' + crypto.randomBytes(6).toString('hex');
    const max = opts.maxParticipants ?? 10;
    db.run(
      "INSERT INTO fish_rooms (code, owner_id, room_type, lifecycle, is_public, max_participants) VALUES (?, ?, 'private', ?, ?, ?)",
      [code, opts.ownerId, opts.lifecycle, opts.isPublic ? 1 : 0, max]
    );
    const roomId = Number(db.exec('SELECT last_insert_rowid()')[0].values[0][0]);
    const token = crypto.randomUUID();
    db.run(
      "INSERT INTO fish_room_participants (room_id, token, nickname, joined_at, last_active) VALUES (?, ?, ?, datetime('now'), datetime('now'))",
      [roomId, token, opts.username]
    );
    await saveDb();
    const room = this.getRoomRow(db, roomId)!;
    return { room, token };
  },

  // 每日清理：销毁 lifecycle='temp' 且无活跃成员的房间（连带消息与参与者）
  async destroyTempRooms(): Promise<number> {
    const db = await getDb();
    const timeout = '-' + ACTIVE_TIMEOUT_SECONDS + ' seconds';
    const stale = db.exec(
      `SELECT r.id FROM fish_rooms r
       WHERE r.lifecycle = 'temp'
         AND (r.destroyed_at IS NULL)
         AND (SELECT COUNT(*) FROM fish_room_participants p WHERE p.room_id = r.id AND p.last_active >= datetime('now', ?)) = 0`,
      [timeout]
    );
    const ids = (stale[0]?.values || []).map((r: any) => r[0]);
    for (const id of ids) {
      db.run('DELETE FROM fish_messages WHERE room_id = ?', [id]);
      db.run('DELETE FROM fish_room_participants WHERE room_id = ?', [id]);
      db.run("UPDATE fish_rooms SET destroyed_at = datetime('now') WHERE id = ?", [id]);
    }
    if (ids.length) await saveDb();
    return ids.length;
  },

  async getRoomByCode(code: string): Promise<RoomRow | null> {
    const db = await getDb();
    return this.getRoomRow(db, code);
  },

  // 列出可见的公开房（public 类型且 is_public=1）
  async listPublicRooms(): Promise<RoomRow[]> {
    const db = await getDb();
    const result = db.exec(
      `SELECT ${ROOM_COLUMNS} FROM fish_rooms WHERE room_type = 'public' AND is_public = 1 AND destroyed_at IS NULL ORDER BY id`
    );
    return (result[0]?.values || []).map(parseRoomRow);
  },

  getRoomRow(db: any, key: number | string): RoomRow | null {
    const result =
      typeof key === 'number'
        ? db.exec(`SELECT ${ROOM_COLUMNS} FROM fish_rooms WHERE id = ?`, [key])
        : db.exec(`SELECT ${ROOM_COLUMNS} FROM fish_rooms WHERE UPPER(code) = UPPER(?)`, [key]);
    const row = result[0]?.values?.[0];
    return row ? parseRoomRow(row) : null;
  },
};

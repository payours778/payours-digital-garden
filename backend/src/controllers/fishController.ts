import { Request, Response } from 'express';
import crypto from 'crypto';
import { getDb, saveDb } from '../db';
import { roomPool, RoomRow, ROOM_COLUMNS } from '../services/roomPool';

interface Participant {
  id: number;
  room_id: number;
  token: string;
  nickname: string;
  joined_at: string;
  last_active: string;
}

interface Room extends RoomRow {
  participants: Participant[];
}

interface Message {
  id: number;
  room_id: number;
  sender_nickname: string;
  content: string;
  created_at: string;
}

const ACTIVE_TIMEOUT_SECONDS = 3600;
const PRESENCE_TIMEOUT_SECONDS = 90;
const MAX_OWNED_ROOMS = 10; // 普通用户最多拥有的房间数 // 在线判定窗口：最近 90 秒有心跳即算在线
const MAX_MESSAGES = 200;

const parseRoomRow = (row: any[]): Room => ({
  id: row[0],
  code: row[1],
  owner_id: row[2],
  room_type: row[3],
  lifecycle: row[4],
  is_public: row[5],
  max_participants: row[6],
  destroyed_at: row[7],
  created_at: row[8],
  participants: [],
});

const parseParticipantRow = (row: any[]): Participant => ({
  id: row[0],
  room_id: row[1],
  token: row[2],
  nickname: row[3],
  joined_at: row[4],
  last_active: row[5],
});

const parseMessageRow = (row: any[]): Message => ({
  id: row[0],
  room_id: row[1],
  sender_nickname: row[2],
  content: row[3],
  created_at: row[4],
});

const cleanupStaleParticipants = async (): Promise<void> => {
  const db = await getDb();
  const timeout = "-" + ACTIVE_TIMEOUT_SECONDS + " seconds";
  db.run("DELETE FROM fish_room_participants WHERE last_active < datetime('now', ?)", [timeout]);
  await saveDb();
};

const getActiveParticipants = (db: any, roomId: number): Participant[] => {
  const timeout = "-" + PRESENCE_TIMEOUT_SECONDS + " seconds";
  const result = db.exec("SELECT * FROM fish_room_participants WHERE room_id = ? AND last_active >= datetime('now', ?) ORDER BY joined_at", [roomId, timeout]);
  return (result[0]?.values || []).map(parseParticipantRow);
};

const generateToken = (): string => crypto.randomUUID();

export const createRoom = async (req: Request, res: Response) => {
  try {
    const { isPublic, lifecycle } = req.body;
    const user = (req as any).user;
    if (!user?.username) {
      return res.status(401).json({ error: '\u8bf7\u5148\u767b\u5f55' });
    }

    // 普通用户最多同时拥有 10 个房间（管理员不限）
    if (user.role !== 'admin') {
      const ownedDb = await getDb();
      const ownedResult = ownedDb.exec(
        'SELECT COUNT(*) FROM fish_rooms WHERE owner_id = ? AND destroyed_at IS NULL',
        [user.id]
      );
      const ownedCount = Number(ownedResult[0]?.values?.[0]?.[0] || 0);
      if (ownedCount >= MAX_OWNED_ROOMS) {
        return res.status(400).json({ error: '\u6bcf\u4e2a\u8d26\u53f7\u6700\u591a\u521b\u5efa 10 \u4e2a\u623f\u95f4\uff0c\u8bf7\u5148\u5220\u9664\u65e7\u623f\u95f4' });
      }
    }

    await cleanupStaleParticipants();
    const { room, token } = await roomPool.createPrivateRoom({
      ownerId: user.id,
      username: user.username,
      isPublic: Boolean(isPublic),
      lifecycle: lifecycle === 'temp' ? 'temp' : 'permanent',
    });

    const db = await getDb();
    db.run(
      "INSERT INTO fish_messages (room_id, sender_nickname, content) VALUES (?, '\u7cfb\u7edf', ?)",
      [room.id, '\ud83c\udf80 ' + user.username + ' \u521b\u5efa\u4e86\u623f\u95f4']
    );
    await saveDb();

    const fullRoom = parseRoomRow(
      db.exec('SELECT ' + ROOM_COLUMNS + ' FROM fish_rooms WHERE id = ?', [room.id])[0].values[0]
    );
    fullRoom.participants = getActiveParticipants(db, room.id);

    res.json({ room: fullRoom, participantToken: token });
  } catch (error) {
    console.error('createRoom error:', error);
    res.status(500).json({ error: '\u521b\u5efa\u623f\u95f4\u5931\u8d25' });
  }
};

export const joinRoom = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const user = (req as any).user;
    if (!user?.username) {
      return res.status(401).json({ error: '\u8bf7\u5148\u767b\u5f55' });
    }

    await cleanupStaleParticipants();
    const db = await getDb();

    const roomRow = await roomPool.getRoomByCode(code);
    if (!roomRow || roomRow.destroyed_at) {
      return res.status(404).json({ error: '\u623f\u95f4\u4e0d\u5b58\u5728' });
    }
    const room = parseRoomRow(db.exec('SELECT ' + ROOM_COLUMNS + ' FROM fish_rooms WHERE id = ?', [roomRow.id])[0].values[0]);

    const participants = getActiveParticipants(db, room.id);
    room.participants = participants;

    if (participants.length >= room.max_participants) {
      return res.status(400).json({ error: '\u623f\u95f4\u5df2\u6ee1' });
    }

    // 同一账号已在房内则不重复加入
    const already = participants.find(p => p.nickname === user.username);
    let token: string;
    if (already) {
      token = already.token;
    } else {
      token = generateToken();
      db.run(
        "INSERT INTO fish_room_participants (room_id, token, nickname, last_active) VALUES (?, ?, ?, datetime('now'))",
        [room.id, token, user.username]
      );
      db.run(
        "INSERT INTO fish_messages (room_id, sender_nickname, content) VALUES (?, '\u7cfb\u7edf', ?)",
        [room.id, '\ud83c\udf80 ' + user.username + ' \u52a0\u5165\u4e86\u623f\u95f4']
      );
      await saveDb();
    }

    room.participants = getActiveParticipants(db, room.id);
    res.json({ room, participantToken: token });
  } catch (error) {
    console.error('joinRoom error:', error);
    res.status(500).json({ error: '\u52a0\u5165\u623f\u95f4\u5931\u8d25' });
  }
};

export const getRoomByCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    await cleanupStaleParticipants();
    const db = await getDb();

    const roomResult = db.exec('SELECT ' + ROOM_COLUMNS + ' FROM fish_rooms WHERE UPPER(code) = UPPER(?)', [code]);

    if (!roomResult[0]?.values?.length) {
      return res.status(404).json({ error: '\u623f\u95f4\u4e0d\u5b58\u5728' });
    }

    const room = parseRoomRow(roomResult[0].values[0]);
    room.participants = getActiveParticipants(db, room.id);

    res.json({ room });
  } catch (error) {
    console.error('getRoomByCode error:', error);
    res.status(500).json({ error: '\u83b7\u53d6\u623f\u95f4\u5931\u8d25' });
  }
};

export const getRoomByCodeFull = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const { participantToken } = req.query;

    await cleanupStaleParticipants();
    const db = await getDb();

    if (participantToken && typeof participantToken === 'string') {
      db.run("UPDATE fish_room_participants SET last_active = datetime('now') WHERE token = ?", [participantToken]);
    }

    const roomResult = db.exec('SELECT ' + ROOM_COLUMNS + ' FROM fish_rooms WHERE UPPER(code) = UPPER(?)', [code]);

    if (!roomResult[0]?.values?.length) {
      return res.status(404).json({ error: '\u623f\u95f4\u4e0d\u5b58\u5728' });
    }

    const room = parseRoomRow(roomResult[0].values[0]);
    room.participants = getActiveParticipants(db, room.id);

    res.json({ room });
  } catch (error) {
    console.error('getRoomByCodeFull error:', error);
    res.status(500).json({ error: '\u83b7\u53d6\u623f\u95f4\u5931\u8d25' });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { participantToken, content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: '\u6d88\u606f\u5185\u5bb9\u4e0d\u80fd\u4e3a\u7a7a' });
    }

    if (!participantToken) {
      return res.status(401).json({ error: '\u672a\u6388\u6743' });
    }

    const db = await getDb();

    const participantResult = db.exec('SELECT nickname FROM fish_room_participants WHERE token = ? AND room_id = ?', [participantToken, Number(roomId)]);
    const participant = participantResult[0]?.values?.[0];
    if (!participant) {
      return res.status(404).json({ error: '\u53c2\u4e0e\u8005\u4e0d\u5b58\u5728' });
    }

    const nickname = String(participant[0]);

    db.run("UPDATE fish_room_participants SET last_active = datetime('now') WHERE token = ?", [participantToken]);

    db.run(
      'INSERT INTO fish_messages (room_id, sender_nickname, content) VALUES (?, ?, ?)',
      [Number(roomId), nickname, content.trim()]
    );

    // Trim old messages
    const countResult = db.exec('SELECT COUNT(*) FROM fish_messages WHERE room_id = ?', [Number(roomId)]);
    const count = Number(countResult[0]?.values?.[0]?.[0] || 0);
    if (count > MAX_MESSAGES) {
      db.run('DELETE FROM fish_messages WHERE id IN (SELECT id FROM fish_messages WHERE room_id = ? ORDER BY id LIMIT ?)', [Number(roomId), count - MAX_MESSAGES]);
    }

    await saveDb();

    const messagesResult = db.exec('SELECT * FROM fish_messages WHERE room_id = ? ORDER BY id DESC LIMIT 1', [Number(roomId)]);
    const message = messagesResult[0]?.values?.[0] ? parseMessageRow(messagesResult[0].values[0]) : null;

    res.json({ message });
  } catch (error) {
    console.error('sendMessage error:', error);
    res.status(500).json({ error: '\u53d1\u9001\u6d88\u606f\u5931\u8d25' });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { participantToken } = req.query;

    const db = await getDb();

    if (participantToken && typeof participantToken === 'string') {
      db.run("UPDATE fish_room_participants SET last_active = datetime('now') WHERE token = ?", [participantToken]);
    }

    const messagesResult = db.exec('SELECT * FROM fish_messages WHERE room_id = ? ORDER BY id', [Number(roomId)]);
    const messages = (messagesResult[0]?.values || []).map(parseMessageRow);

    // 在线人数：最近 PRESENCE_TIMEOUT_SECONDS 内有心跳的参与者
    const participants = getActiveParticipants(db, Number(roomId));

    res.json({ messages, online: participants.length, participants });
  } catch (error) {
    console.error('getMessages error:', error);
    res.status(500).json({ error: '\u83b7\u53d6\u6d88\u606f\u5931\u8d25' });
  }
};

export const leaveRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { participantToken } = req.body;
    const user = (req as any).user;
    const db = await getDb();

    // 优先用 token 精确退出；未带 token 时按当前登录账号退出（我的房间列表移除）
    let participant: any[] | null = null;
    if (participantToken) {
      const r = db.exec('SELECT nickname FROM fish_room_participants WHERE token = ? AND room_id = ?', [participantToken, Number(roomId)]);
      participant = r[0]?.values?.[0] || null;
    } else if (user?.username) {
      const r = db.exec('SELECT nickname FROM fish_room_participants WHERE nickname = ? AND room_id = ?', [user.username, Number(roomId)]);
      participant = r[0]?.values?.[0] || null;
    }
    if (!participant) {
      return res.status(404).json({ error: '\u53c2\u4e0e\u8005\u4e0d\u5b58\u5728' });
    }

    const nickname = String(participant[0]);

    if (participantToken) {
      db.run('DELETE FROM fish_room_participants WHERE token = ? AND room_id = ?', [participantToken, Number(roomId)]);
    } else {
      db.run('DELETE FROM fish_room_participants WHERE nickname = ? AND room_id = ?', [user.username, Number(roomId)]);
    }

    db.run(
      "INSERT INTO fish_messages (room_id, sender_nickname, content) VALUES (?, '\u7cfb\u7edf', ?)",
      [Number(roomId), '\ud83d\udce2 ' + nickname + ' \u79bb\u5f00\u4e86\u623f\u95f4']
    );

    await saveDb();

    res.json({ success: true });
  } catch (error) {
    console.error('leaveRoom error:', error);
    res.status(500).json({ error: '\u79bb\u5f00\u623f\u95f4\u5931\u8d25' });
  }
};

// 房主删除整个房间（连带消息与参与者，标记销毁）
export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const user = (req as any).user;
    if (!user?.id) {
      return res.status(401).json({ error: '\u8bf7\u5148\u767b\u5f55' });
    }
    const db = await getDb();

    const roomResult = db.exec('SELECT ' + ROOM_COLUMNS + ' FROM fish_rooms WHERE id = ?', [Number(roomId)]);
    const row = roomResult[0]?.values?.[0];
    if (!row) {
      return res.status(404).json({ error: '\u623f\u95f4\u4e0d\u5b58\u5728' });
    }
    const room = parseRoomRow(row);
    if (room.owner_id !== user.id) {
      return res.status(403).json({ error: '\u53ea\u6709\u623f\u4e3b\u53ef\u4ee5\u5220\u9664\u623f\u95f4' });
    }

    db.run('DELETE FROM fish_messages WHERE room_id = ?', [room.id]);
    db.run('DELETE FROM fish_room_participants WHERE room_id = ?', [room.id]);
    db.run("UPDATE fish_rooms SET destroyed_at = datetime('now') WHERE id = ?", [room.id]);
    await saveDb();

    res.json({ success: true });
  } catch (error) {
    console.error('deleteRoom error:', error);
    res.status(500).json({ error: '\u5220\u9664\u623f\u95f4\u5931\u8d25' });
  }
};

export const getRoomsList = async (req: Request, res: Response) => {
  try {
    await cleanupStaleParticipants();
    const db = await getDb();

    const roomsResult = db.exec('SELECT ' + ROOM_COLUMNS + ' FROM fish_rooms ORDER BY id');
    const rooms: Room[] = (roomsResult[0]?.values || []).map(parseRoomRow);
    rooms.forEach(r => { r.participants = getActiveParticipants(db, r.id); });

    res.json({ rooms });
  } catch (error) {
    console.error('getRoomsList error:', error);
    res.status(500).json({ error: '\u83b7\u53d6\u623f\u95f4\u5217\u8868\u5931\u8d25' });
  }
};

export const getParticipantInfo = async (req: Request, res: Response) => {
  try {
    const { participantToken } = req.query;
    if (!participantToken || typeof participantToken !== 'string') {
      return res.status(400).json({ error: '\u7f3a\u5c11 participantToken' });
    }

    await cleanupStaleParticipants();
    const db = await getDb();

    db.run("UPDATE fish_room_participants SET last_active = datetime('now') WHERE token = ?", [participantToken]);

    const result = db.exec('SELECT * FROM fish_room_participants WHERE token = ?', [participantToken]);
    const row = result[0]?.values?.[0];
    if (!row) {
      return res.status(404).json({ error: '\u53c2\u4e0e\u8005\u4e0d\u5b58\u5728\u6216\u5df2\u8fc7\u671f' });
    }

    res.json({ participant: parseParticipantRow(row) });
  } catch (error) {
    console.error('getParticipantInfo error:', error);
    res.status(500).json({ error: '\u83b7\u53d6\u53c2\u4e0e\u8005\u4fe1\u606f\u5931\u8d25' });
  }
};

export const listPublicRooms = async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    const rooms = await roomPool.listPublicRooms();
    const enriched: Room[] = rooms.map(r => {
      const parsed = parseRoomRow(db.exec('SELECT ' + ROOM_COLUMNS + ' FROM fish_rooms WHERE id = ?', [r.id])[0].values[0]);
      parsed.participants = getActiveParticipants(db, r.id);
      return parsed;
    });
    res.json({ rooms: enriched });
  } catch (error) {
    console.error('listPublicRooms error:', error);
    res.status(500).json({ error: '\u83b7\u53d6\u516c\u5f00\u623f\u95f4\u5931\u8d25' });
  }
};

// 返回当前账号相关的房间（owner 或参与者），按账号入库，排除已销毁与公开大厅
export const getMyRooms = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user?.username) {
      return res.status(401).json({ error: '\u8bf7\u5148\u767b\u5f55' });
    }
    const db = await getDb();
    const result = db.exec(
      `SELECT DISTINCT r.id, r.code, r.owner_id, r.room_type, r.lifecycle, r.is_public, r.max_participants, r.destroyed_at, r.created_at FROM fish_rooms r
       LEFT JOIN fish_room_participants p ON p.room_id = r.id
       WHERE r.destroyed_at IS NULL
         AND r.room_type = 'private'
         AND (r.owner_id = ? OR p.nickname = ?)
       ORDER BY r.created_at DESC`,
      [user.id || -1, user.username]
    );
    const enriched: Room[] = (result[0]?.values || []).map((row: any[]) => {
      const parsed = parseRoomRow(row);
      parsed.participants = getActiveParticipants(db, parsed.id);
      return parsed;
    });
    res.json({ rooms: enriched });
  } catch (error) {
    console.error('getMyRooms error:', error);
    res.status(500).json({ error: '\u83b7\u53d6\u6211\u7684\u623f\u95f4\u5931\u8d25' });
  }
};




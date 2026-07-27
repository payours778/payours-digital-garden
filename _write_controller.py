import os

content = r"""import { Request, Response } from 'express';
import crypto from 'crypto';
import { getDb, saveDb } from '../db';

interface Participant {
  id: number;
  room_id: number;
  token: string;
  nickname: string;
  joined_at: string;
  last_active: string;
}

interface Room {
  id: number;
  code: string;
  max_participants: number;
  participants: Participant[];
  created_at: string;
}

interface Message {
  id: number;
  room_id: number;
  sender_nickname: string;
  content: string;
  created_at: string;
}

const ACTIVE_TIMEOUT_SECONDS = 3600;
const MAX_MESSAGES = 200;

const parseRoomRow = (row: any[]): Room => ({
  id: row[0],
  code: row[1],
  max_participants: row[2],
  participants: [],
  created_at: row[3],
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
  db.run("DELETE FROM fish_room_participants WHERE last_active < datetime('now', ?)", ["-""" + str(3600) + """ seconds"]);
  await saveDb();
};

const getActiveParticipants = (db: any, roomId: number): Participant[] => {
  const result = db.exec("SELECT * FROM fish_room_participants WHERE room_id = ? AND last_active >= datetime('now', ?) ORDER BY joined_at", [roomId, "-""" + str(3600) + """ seconds"]);
  return (result[0]?.values || []).map(parseParticipantRow);
};

const generateToken = (): string => crypto.randomUUID();

export const createRoom = async (req: Request, res: Response) => {
  try {
    const { nickname } = req.body;

    if (!nickname) {
      return res.status(400).json({ error: '请输入昵称' });
    }

    await cleanupStaleParticipants();
    const db = await getDb();

    const roomsResult = db.exec('SELECT * FROM fish_rooms ORDER BY id');
    const rooms = (roomsResult[0]?.values || []).map(parseRoomRow);

    const availableRoom = rooms.find(r => {
      const participants = getActiveParticipants(db, r.id);
      return participants.length < r.max_participants;
    });

    if (!availableRoom) {
      return res.status(400).json({ error: '暂时没有可用房间，请稍后再试' });
    }

    const room = availableRoom;
    const token = generateToken();

    db.run(
      "INSERT INTO fish_room_participants (room_id, token, nickname, last_active) VALUES (?, ?, ?, datetime('now'))",
      [room.id, token, nickname]
    );

    db.run(
      "INSERT INTO fish_messages (room_id, sender_nickname, content) VALUES (?, '系统', ?)",
      [room.id, '?? ' + nickname + ' 加入了房间']
    );

    await saveDb();

    room.participants = getActiveParticipants(db, room.id);

    res.json({ room, participantToken: token });
  } catch (error) {
    console.error('createRoom error:', error);
    res.status(500).json({ error: '创建房间失败' });
  }
};

export const joinRoom = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const { nickname } = req.body;

    if (!nickname) {
      return res.status(400).json({ error: '请输入昵称' });
    }

    await cleanupStaleParticipants();
    const db = await getDb();

    const roomResult = db.exec('SELECT * FROM fish_rooms WHERE UPPER(code) = UPPER(?)', [code]);

    if (!roomResult[0]?.values?.length) {
      return res.status(404).json({ error: '房间不存在' });
    }

    const room = parseRoomRow(roomResult[0].values[0]);
    const participants = getActiveParticipants(db, room.id);
    room.participants = participants;

    if (participants.length >= room.max_participants) {
      return res.status(400).json({ error: '房间已满' });
    }

    const token = generateToken();

    db.run(
      "INSERT INTO fish_room_participants (room_id, token, nickname, last_active) VALUES (?, ?, ?, datetime('now'))",
      [room.id, token, nickname]
    );

    db.run(
      "INSERT INTO fish_messages (room_id, sender_nickname, content) VALUES (?, '系统', ?)",
      [room.id, '?? ' + nickname + ' 加入了房间']
    );

    await saveDb();

    room.participants = getActiveParticipants(db, room.id);

    res.json({ room, participantToken: token });
  } catch (error) {
    console.error('joinRoom error:', error);
    res.status(500).json({ error: '加入房间失败' });
  }
};

export const getRoomByCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    await cleanupStaleParticipants();
    const db = await getDb();

    const roomResult = db.exec('SELECT * FROM fish_rooms WHERE UPPER(code) = UPPER(?)', [code]);

    if (!roomResult[0]?.values?.length) {
      return res.status(404).json({ error: '房间不存在' });
    }

    const room = parseRoomRow(roomResult[0].values[0]);
    room.participants = getActiveParticipants(db, room.id);

    res.json({ room });
  } catch (error) {
    console.error('getRoomByCode error:', error);
    res.status(500).json({ error: '获取房间失败' });
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
      await saveDb();
    }

    const roomResult = db.exec('SELECT * FROM fish_rooms WHERE UPPER(code) = UPPER(?)', [code]);

    if (!roomResult[0]?.values?.length) {
      return res.status(404).json({ error: '房间不存在' });
    }

    const room = parseRoomRow(roomResult[0].values[0]);
    room.participants = getActiveParticipants(db, room.id);

    res.json({ room });
  } catch (error) {
    console.error('getRoomByCodeFull error:', error);
    res.status(500).json({ error: '获取房间失败' });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { participantToken, content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: '消息内容不能为空' });
    }

    if (!participantToken) {
      return res.status(401).json({ error: '未授权' });
    }

    const db = await getDb();

    const participantResult = db.exec('SELECT nickname FROM fish_room_participants WHERE token = ? AND room_id = ?', [participantToken, Number(roomId)]);
    const participant = participantResult[0]?.values?.[0];
    if (!participant) {
      return res.status(404).json({ error: '参与者不存在' });
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
    res.status(500).json({ error: '发送消息失败' });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { participantToken } = req.query;

    const db = await getDb();

    if (participantToken && typeof participantToken === 'string') {
      db.run("UPDATE fish_room_participants SET last_active = datetime('now') WHERE token = ?", [participantToken]);
      await saveDb();
    }

    const messagesResult = db.exec('SELECT * FROM fish_messages WHERE room_id = ? ORDER BY id', [Number(roomId)]);
    const messages = (messagesResult[0]?.values || []).map(parseMessageRow);

    res.json({ messages });
  } catch (error) {
    console.error('getMessages error:', error);
    res.status(500).json({ error: '获取消息失败' });
  }
};

export const leaveRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { participantToken } = req.body;
    const db = await getDb();

    const participantResult = db.exec('SELECT nickname FROM fish_room_participants WHERE token = ? AND room_id = ?', [participantToken, Number(roomId)]);
    const participant = participantResult[0]?.values?.[0];
    if (!participant) {
      return res.status(404).json({ error: '参与者不存在' });
    }

    const nickname = String(participant[0]);

    db.run('DELETE FROM fish_room_participants WHERE token = ? AND room_id = ?', [participantToken, Number(roomId)]);

    db.run(
      "INSERT INTO fish_messages (room_id, sender_nickname, content) VALUES (?, '系统', ?)",
      [Number(roomId), '?? ' + nickname + ' 离开了房间']
    );

    await saveDb();

    res.json({ success: true });
  } catch (error) {
    console.error('leaveRoom error:', error);
    res.status(500).json({ error: '离开房间失败' });
  }
};

export const getRoomsList = async (req: Request, res: Response) => {
  try {
    await cleanupStaleParticipants();
    const db = await getDb();

    const roomsResult = db.exec('SELECT * FROM fish_rooms ORDER BY id');
    const rooms: Room[] = (roomsResult[0]?.values || []).map(parseRoomRow);
    rooms.forEach(r => { r.participants = getActiveParticipants(db, r.id); });

    res.json({ rooms });
  } catch (error) {
    console.error('getRoomsList error:', error);
    res.status(500).json({ error: '获取房间列表失败' });
  }
};

export const getParticipantInfo = async (req: Request, res: Response) => {
  try {
    const { participantToken } = req.query;
    if (!participantToken || typeof participantToken !== 'string') {
      return res.status(400).json({ error: '缺少 participantToken' });
    }

    await cleanupStaleParticipants();
    const db = await getDb();

    db.run("UPDATE fish_room_participants SET last_active = datetime('now') WHERE token = ?", [participantToken]);
    await saveDb();

    const result = db.exec('SELECT * FROM fish_room_participants WHERE token = ?', [participantToken]);
    const row = result[0]?.values?.[0];
    if (!row) {
      return res.status(404).json({ error: '参与者不存在或已过期' });
    }

    res.json({ participant: parseParticipantRow(row) });
  } catch (error) {
    console.error('getParticipantInfo error:', error);
    res.status(500).json({ error: '获取参与者信息失败' });
  }
};
"""

with open('E:/data/blog-test/backend/src/controllers/fishController.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print('controller written')

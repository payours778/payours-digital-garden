import { Request, Response } from 'express';
import getDb, { saveDb } from '../db';

const FIXED_CODES = ['FISH01', 'FISH02', 'FISH03', 'FISH04', 'FISH05', 'FISH06', 'FISH07', 'FISH08', 'FISH09', 'FISH10'];

const parseRoomRow = (row: any[]) => ({
  id: row[0],
  code: row[1],
  participant1_id: row[2],
  participant1_nickname: row[3],
  participant2_id: row[4],
  participant2_nickname: row[5],
  created_at: row[6],
});

const parseMessageRow = (row: any[]) => ({
  id: row[0],
  room_id: row[1],
  sender_id: row[2],
  sender_nickname: row[3],
  content: row[4],
  created_at: row[5],
});

export const createRoom = async (req: Request, res: Response) => {
  try {
    const { nickname = '用户1' } = req.body;
    const db = await getDb();

    const result = db.exec('SELECT * FROM fish_rooms WHERE participant2_id IS NULL ORDER BY id LIMIT 1');
    const rows = result[0]?.values;

    if (!rows || rows.length === 0) {
      return res.status(400).json({ error: '当前没有空闲房间，请稍后再试' });
    }

    const room = parseRoomRow(rows[0]);

    db.run(`UPDATE fish_rooms SET participant1_id = 1, participant1_nickname = '${nickname.trim() || '用户1'}' WHERE id = ${room.id}`);
    await saveDb();

    const updatedResult = db.exec(`SELECT * FROM fish_rooms WHERE id = ${room.id}`);
    const updatedRow = updatedResult[0]?.values?.[0];

    res.status(201).json({ room: parseRoomRow(updatedRow!) });
  } catch (error) {
    console.error('创建房间错误:', error);
    res.status(500).json({ error: '创建房间失败' });
  }
};

export const joinRoom = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const { nickname = '用户2' } = req.body;
    const db = await getDb();

    const result = db.exec(`SELECT * FROM fish_rooms WHERE UPPER(code) = UPPER('${code}')`);
    const rows = result[0]?.values;

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: '房间不存在' });
    }

    const room = parseRoomRow(rows[0]);

    if (room.participant2_id) {
      return res.status(400).json({ error: '房间已满' });
    }

    if (!room.participant1_id) {
      return res.status(400).json({ error: '房间尚未被创建，请等待对方创建' });
    }

    db.run(`UPDATE fish_rooms SET participant2_id = 2, participant2_nickname = '${nickname.trim() || '用户2'}' WHERE id = ${room.id}`);
    await saveDb();

    const updatedResult = db.exec(`SELECT * FROM fish_rooms WHERE id = ${room.id}`);
    const updatedRow = updatedResult[0]?.values?.[0];

    res.json({ room: parseRoomRow(updatedRow!) });
  } catch (error) {
    res.status(500).json({ error: '加入房间失败' });
  }
};

export const getRoomByCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const db = await getDb();

    const result = db.exec(`SELECT * FROM fish_rooms WHERE UPPER(code) = UPPER('${code}')`);
    const rows = result[0]?.values;

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: '房间不存在' });
    }

    res.json({ room: parseRoomRow(rows[0]) });
  } catch (error) {
    res.status(500).json({ error: '获取房间信息失败' });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { senderId, senderNickname, content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: '消息内容不能为空' });
    }

    const db = await getDb();
    const roomResult = db.exec(`SELECT * FROM fish_rooms WHERE id = ${roomId}`);
    
    if (!roomResult[0]?.values?.length) {
      return res.status(404).json({ error: '房间不存在' });
    }

    const now = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);

    db.run(
      'INSERT INTO fish_messages (room_id, sender_id, sender_nickname, content, created_at) VALUES (?, ?, ?, ?, ?)',
      [roomId, senderId, senderNickname || '用户', content.trim(), now]
    );

    const maxIdResult = db.exec('SELECT MAX(id) FROM fish_messages');
    const lastId = maxIdResult[0]?.values?.[0]?.[0];

    await saveDb();

    const messageResult = db.exec(`SELECT * FROM fish_messages WHERE id = ${lastId}`);
    const row = messageResult[0]?.values?.[0];

    res.status(201).json({ message: parseMessageRow(row!) });
  } catch (error) {
    res.status(500).json({ error: '发送消息失败' });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;

    const db = await getDb();
    const query = `SELECT * FROM fish_messages WHERE room_id = ${roomId} ORDER BY created_at ASC`;

    const result = db.exec(query);
    const messages = (result[0]?.values || []).map(parseMessageRow);

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: '获取消息失败' });
  }
};

export const resetRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const db = await getDb();

    const roomResult = db.exec(`SELECT * FROM fish_rooms WHERE id = ${roomId}`);
    
    if (!roomResult[0]?.values?.length) {
      return res.status(404).json({ error: '房间不存在' });
    }

    db.run(`DELETE FROM fish_messages WHERE room_id = ${roomId}`);
    db.run(`UPDATE fish_rooms SET participant1_id = NULL, participant1_nickname = '', participant2_id = NULL, participant2_nickname = '' WHERE id = ${roomId}`);
    await saveDb();

    const updatedResult = db.exec(`SELECT * FROM fish_rooms WHERE id = ${roomId}`);
    const updatedRow = updatedResult[0]?.values?.[0];

    res.json({ room: parseRoomRow(updatedRow!) });
  } catch (error) {
    res.status(500).json({ error: '重置房间失败' });
  }
};

export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const db = await getDb();

    const roomResult = db.exec(`SELECT * FROM fish_rooms WHERE id = ${roomId}`);
    
    if (!roomResult[0]?.values?.length) {
      return res.status(404).json({ error: '房间不存在' });
    }

    db.run(`DELETE FROM fish_messages WHERE room_id = ${roomId}`);
    db.run(`DELETE FROM fish_rooms WHERE id = ${roomId}`);
    await saveDb();

    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除房间失败' });
  }
};

export const getRoomsList = async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const result = db.exec('SELECT * FROM fish_rooms ORDER BY id');
    const rooms = (result[0]?.values || []).map(parseRoomRow);
    res.json({ rooms });
  } catch (error) {
    res.status(500).json({ error: '获取房间列表失败' });
  }
};

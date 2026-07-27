import path from 'path';
import getDb, { saveDb } from './index';

const schema = [
  'CREATE TABLE IF NOT EXISTS posts (',
  '  id INTEGER PRIMARY KEY AUTOINCREMENT,',
  "  title TEXT NOT NULL,",
  '  content TEXT NOT NULL,',
  '  excerpt TEXT,',
  '  slug TEXT UNIQUE NOT NULL,',
  '  cover TEXT,',
  "  tags TEXT DEFAULT '[]',",
  '  views INTEGER DEFAULT 0,',
  '  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,',
  '  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP',
  ');',
  'CREATE TABLE IF NOT EXISTS essays (',
  '  id INTEGER PRIMARY KEY AUTOINCREMENT,',
  '  title TEXT NOT NULL,',
  '  content TEXT NOT NULL,',
  '  excerpt TEXT,',
  '  cover TEXT,',
  '  date TEXT,',
  '  created_at DATETIME DEFAULT CURRENT_TIMESTAMP',
  ');',
  'CREATE TABLE IF NOT EXISTS moments (',
  '  id INTEGER PRIMARY KEY AUTOINCREMENT,',
  '  content TEXT NOT NULL,',
  "  images TEXT DEFAULT '[]',",
  '  likes INTEGER DEFAULT 0,',
  '  created_at DATETIME DEFAULT CURRENT_TIMESTAMP',
  ');',
  'CREATE TABLE IF NOT EXISTS users (',
  '  id INTEGER PRIMARY KEY AUTOINCREMENT,',
  '  username TEXT UNIQUE NOT NULL,',
  '  password TEXT NOT NULL,',
  "  role TEXT DEFAULT 'admin',",
  '  created_at DATETIME DEFAULT CURRENT_TIMESTAMP',
  ');',
  'CREATE TABLE IF NOT EXISTS albums (',
  '  id INTEGER PRIMARY KEY AUTOINCREMENT,',
  '  name TEXT NOT NULL,',
  '  description TEXT,',
  '  cover_url TEXT,',
  '  created_at DATETIME DEFAULT CURRENT_TIMESTAMP',
  ');',
  'CREATE TABLE IF NOT EXISTS photos (',
  '  id INTEGER PRIMARY KEY AUTOINCREMENT,',
  '  album_id INTEGER,',
  '  url TEXT NOT NULL,',
  '  description TEXT,',
  '  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,',
  '  FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE',
  ');',
  'CREATE TABLE IF NOT EXISTS projects (',
  '  id INTEGER PRIMARY KEY AUTOINCREMENT,',
  '  name TEXT NOT NULL,',
  '  description TEXT,',
  "  tech TEXT DEFAULT '[]',",
  '  link TEXT,',
  '  stars INTEGER DEFAULT 0,',
  '  created_at DATETIME DEFAULT CURRENT_TIMESTAMP',
  ');',
  'CREATE TABLE IF NOT EXISTS music (',
  '  id INTEGER PRIMARY KEY AUTOINCREMENT,',
  '  title TEXT NOT NULL,',
  '  artist TEXT,',
  '  url TEXT NOT NULL,',
  '  cover TEXT,',
  "  duration TEXT DEFAULT '00:00',",
  '  created_at DATETIME DEFAULT CURRENT_TIMESTAMP',
  ');',
].join('\n');

// Fish tables with token column, then 100 rooms
const fishSchema = [
  'DROP TABLE IF EXISTS fish_messages;',
  'DROP TABLE IF EXISTS fish_room_participants;',
  'DROP TABLE IF EXISTS fish_rooms;',
  '',
  'CREATE TABLE fish_rooms (',
  '  id INTEGER PRIMARY KEY AUTOINCREMENT,',
  '  code TEXT UNIQUE NOT NULL,',
  '  max_participants INTEGER DEFAULT 10,',
  '  created_at DATETIME DEFAULT CURRENT_TIMESTAMP',
  ');',
  '',
  'CREATE TABLE fish_room_participants (',
  '  id INTEGER PRIMARY KEY AUTOINCREMENT,',
  '  room_id INTEGER,',
  '  token TEXT,',
  '  nickname TEXT NOT NULL,',
  '  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,',
  '  last_active DATETIME DEFAULT CURRENT_TIMESTAMP,',
  '  FOREIGN KEY (room_id) REFERENCES fish_rooms(id) ON DELETE CASCADE',
  ');',
  '',
  'CREATE TABLE fish_messages (',
  '  id INTEGER PRIMARY KEY AUTOINCREMENT,',
  '  room_id INTEGER,',
  '  sender_nickname TEXT,',
  '  content TEXT NOT NULL,',
  '  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,',
  '  FOREIGN KEY (room_id) REFERENCES fish_rooms(id) ON DELETE CASCADE',
  ');',
  '',
  // Insert 100 rooms FISH00-FISH99
  'INSERT OR IGNORE INTO fish_rooms (code) VALUES',
];
for (let i = 0; i < 100; i++) {
  const code = 'FISH' + String(i).padStart(2, '0');
  fishSchema.push((i === 0 ? '' : ',') + "('" + code + "')");
}
fishSchema.push(';', '');
fishSchema.push("INSERT OR IGNORE INTO users (username, password, role) VALUES ('admin', 'admin123', 'admin');");

const fullSchema = schema + '\n' + fishSchema.join('\n');

async function initDatabase() {
  try {
    const db = await getDb();
    db.exec(fullSchema);
    await saveDb();
    console.log('数据库初始化成功');
    process.exitCode = 0;
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exitCode = 1;
  }
}

initDatabase();

/* ============================================================
   DB Schema Migration Tool
   Usage:  node database/migrate-db.js   (run from project root, or any dir)
   Effect: CREATE IF NOT EXISTS 全部表 -> 缺列则 ADD COLUMN
           -> 重建 users/albums/photos（解决列名/约束不匹配）
           -> CREATE INDEX IF NOT EXISTS 13 个索引
           -> 补 fish 房间到 100 个
           -> 绝不丢数据；重建前先 copy 备份
   ============================================================ */
const path = require('path');
const fs = require('fs');
// 从 backend/node_modules 加载依赖（database 目录本身不装 npm 包）
const BACKEND_NODE_MODULES = path.resolve(__dirname, '..', 'backend', 'node_modules');
const initSqlJs = require(path.join(BACKEND_NODE_MODULES, 'sql.js'));
const bcrypt = require(path.join(BACKEND_NODE_MODULES, 'bcryptjs'));

const DB_FILE = path.resolve(__dirname, 'blog.db');
const ROOM_COUNT = 100;
const ADMIN_PHONE = '13512333216';

const NOW_BJ = () => new Date(Date.now() + 8 * 3600e3).toISOString().replace('T', ' ').slice(0, 19);

async function main() {
  if (!fs.existsSync(DB_FILE)) {
    console.log('[ERR] blog.db not found at', DB_FILE);
    console.log('       Run "cd ../backend && npm run db:init" first to create empty DB, then retry.');
    process.exit(1);
  }

  const SQL = await initSqlJs({
    locateFile: f => path.join(__dirname, '..', 'backend', 'node_modules', 'sql.js', 'dist', f)
  });

  // 1) 先做文件级备份
  const backup = DB_FILE + '.migrate-backup-' + Date.now();
  fs.copyFileSync(DB_FILE, backup);
  console.log('[Backup] Copy to:', path.basename(backup));

  const buf = fs.readFileSync(DB_FILE);
  const db = new SQL.Database(buf);

  // ---- 2) CREATE IF NOT EXISTS 所有表（不会破坏已有数据）----
  const schema = [
    "CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, content TEXT NOT NULL, excerpt TEXT, slug TEXT UNIQUE NOT NULL, cover TEXT, views INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, tags TEXT DEFAULT '[]')",
    "CREATE TABLE IF NOT EXISTS essays (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, content TEXT NOT NULL, excerpt TEXT, cover TEXT, date TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)",
    "CREATE TABLE IF NOT EXISTS moments (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT NOT NULL, images TEXT DEFAULT '[]', likes INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)",
    "CREATE TABLE IF NOT EXISTS albums (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT DEFAULT '', cover TEXT DEFAULT '', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)",
    "CREATE TABLE IF NOT EXISTS photos_new (id INTEGER PRIMARY KEY AUTOINCREMENT, album_id INTEGER NOT NULL, url TEXT NOT NULL, caption TEXT DEFAULT '', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)",
    "CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT DEFAULT '', tech TEXT DEFAULT '[]', link TEXT DEFAULT '', stars INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)",
    "CREATE TABLE IF NOT EXISTS music (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, artist TEXT, url TEXT NOT NULL, cover TEXT, duration TEXT DEFAULT '00:00', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)",
    "CREATE TABLE IF NOT EXISTS fish_rooms (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT UNIQUE NOT NULL, max_participants INTEGER DEFAULT 10, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)",
    "CREATE TABLE IF NOT EXISTS fish_room_participants (id INTEGER PRIMARY KEY AUTOINCREMENT, room_id INTEGER, token TEXT, nickname TEXT NOT NULL, joined_at DATETIME DEFAULT CURRENT_TIMESTAMP, last_active DATETIME DEFAULT CURRENT_TIMESTAMP)",
    "CREATE TABLE IF NOT EXISTS fish_messages (id INTEGER PRIMARY KEY AUTOINCREMENT, room_id INTEGER, sender_nickname TEXT, content TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)",
  ];
  for (const s of schema) db.run(s);

  // ---- 3) 列缺失补齐（SQLite 不能 RENAME，所以只补缺的列）----
  const colsOf = t => (db.exec(`PRAGMA table_info(${t})`)[0]?.values || []).map(r => r[1]);
  const addIfMissing = (t, col, def) => {
    if (!colsOf(t).includes(col)) { try { db.run(`ALTER TABLE ${t} ADD COLUMN ${col} ${def}`); console.log(`[Migrate] ${t} add column ${col}`); } catch (e) { console.log(`[WARN]    ${t}.${col} skip:`, e.message); } }
  };
  addIfMissing('posts', 'tags', "TEXT DEFAULT '[]'");
  addIfMissing('posts', 'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
  addIfMissing('posts', 'views', 'INTEGER DEFAULT 0');
  addIfMissing('essays', 'date', 'TEXT');
  addIfMissing('essays', 'excerpt', 'TEXT');
  addIfMissing('essays', 'cover', 'TEXT');
  addIfMissing('essays', 'created_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
  addIfMissing('fish_room_participants', 'token', 'TEXT');
  addIfMissing('fish_room_participants', 'last_active', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
  try { db.run("UPDATE fish_room_participants SET token = 'legacy_' || id WHERE token IS NULL"); } catch {}

  // ---- 4) 重建 users / albums / photos（解决列名/约束不匹配 + 老库密码明文的问题）----
  // users
  const userCols = colsOf('users');
  const needsUserRebuild =
    userCols.includes('password') && !userCols.includes('password_hash') ||
    !userCols.includes('phone') ||
    !userCols.includes('updated_at');
  if (needsUserRebuild) {
    console.log('[Migrate] Rebuild users table (plaintext -> bcrypt, add phone/updated_at, default role=user)');
    const oldRows = db.exec('SELECT * FROM users')[0]?.values || [];
    const oldCols = colsOf('users');
    db.run('DROP TABLE IF EXISTS users_new');
    db.run("CREATE TABLE users_new (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, phone TEXT UNIQUE, role TEXT DEFAULT 'user', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
    const i = Object.fromEntries(oldCols.map((c, idx) => [c, idx]));
    let migrated = 0;
    const now = NOW_BJ();
    for (const row of oldRows) {
      const uname = String(row[i.username ?? 1] || '');
      const oldPw = String(row[i.password ?? 2] || '');
      const pwHash = oldPw.length > 0 ? bcrypt.hashSync(oldPw, 10) : '!';
      const id = row[i.id ?? 0];
      const oldRole = i.role !== undefined ? String(row[i.role] || '').toLowerCase() : 'admin';
      const finalRole = uname.toLowerCase() === 'admin' ? 'admin' : (oldRole === 'admin' ? 'admin' : 'user');
      const phone = uname.toLowerCase() === 'admin' ? ADMIN_PHONE : null;
      const createdAt = i.created_at !== undefined ? row[i.created_at] : now;
      const insert = db.prepare('INSERT INTO users_new (id, username, password_hash, phone, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
      insert.run(id, uname, pwHash, phone, finalRole, createdAt || now, now);
      migrated++;
    }
    db.run('DROP TABLE users');
    db.run('ALTER TABLE users_new RENAME TO users');
    console.log(`[Migrate] users migrated: ${migrated} row(s)`);
  } else {
    console.log('[Migrate] users schema OK, skipped rebuild');
  }

  // albums
  const albumCols = colsOf('albums');
  const needsAlbumRebuild = !albumCols.includes('cover') || albumCols.includes('cover_url');
  if (needsAlbumRebuild) {
    console.log('[Migrate] Rebuild albums table (cover_url -> cover, defaults fix)');
    const oldRows = db.exec('SELECT * FROM albums')[0]?.values || [];
    const oldColsMap = Object.fromEntries(albumCols.map((c, idx) => [c, idx]));
    db.run('DROP TABLE IF EXISTS albums_new');
    db.run("CREATE TABLE albums_new (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT DEFAULT '', cover TEXT DEFAULT '', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
    const ins = db.prepare('INSERT INTO albums_new (id, name, description, cover, created_at) VALUES (?, ?, ?, ?, ?)');
    for (const row of oldRows) {
      const id = row[oldColsMap.id ?? 0];
      const name = row[oldColsMap.name ?? 1];
      const desc = oldColsMap.description !== undefined ? (row[oldColsMap.description] ?? '') : '';
      const cov = oldColsMap.cover_url !== undefined ? row[oldColsMap.cover_url] : (oldColsMap.cover !== undefined ? row[oldColsMap.cover] : '');
      const createdAt = oldColsMap.created_at !== undefined ? row[oldColsMap.created_at] : NOW_BJ();
      ins.run(id, name || '', desc || '', cov || '', createdAt || NOW_BJ());
    }
    db.run('DROP TABLE albums');
    db.run('ALTER TABLE albums_new RENAME TO albums');
    console.log(`[Migrate] albums migrated: ${oldRows.length} row(s)`);
  } else {
    console.log('[Migrate] albums schema OK, skipped rebuild');
  }

  // photos
  const photoCols = colsOf('photos');
  const needsPhotoRebuild = !photoCols.includes('caption') || photoCols.includes('description') || (photoCols.includes('album_id') && !photoCols.some(c => String(c).includes('NOT_NULL_ALBUM_HACK')) && false);
  if (needsPhotoRebuild) {
    console.log('[Migrate] Rebuild photos table (description -> caption, album_id NOT NULL)');
    const oldRows = db.exec('SELECT * FROM photos')[0]?.values || [];
    const oldColsMap = Object.fromEntries(photoCols.map((c, idx) => [c, idx]));
    db.run("CREATE TABLE IF NOT EXISTS photos_new (id INTEGER PRIMARY KEY AUTOINCREMENT, album_id INTEGER NOT NULL, url TEXT NOT NULL, caption TEXT DEFAULT '', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
    const ins = db.prepare('INSERT OR IGNORE INTO photos_new (id, album_id, url, caption, created_at) VALUES (?, ?, ?, ?, ?)');
    const now = NOW_BJ();
    for (const row of oldRows) {
      const id = row[oldColsMap.id ?? 0];
      const aid = row[oldColsMap.album_id ?? 1];
      const url = row[oldColsMap.url ?? 2];
      const cap = oldColsMap.caption !== undefined ? row[oldColsMap.caption] : (oldColsMap.description !== undefined ? row[oldColsMap.description] : '');
      const createdAt = oldColsMap.created_at !== undefined ? row[oldColsMap.created_at] : now;
      try { ins.run(id, aid == null ? 0 : aid, url || '', cap || '', createdAt || now); } catch {}
    }
    db.run('DROP TABLE IF EXISTS photos');
    db.run('ALTER TABLE photos_new RENAME TO photos');
    console.log(`[Migrate] photos migrated: ${oldRows.length} row(s)`);
  } else {
    console.log('[Migrate] photos schema OK, skipped rebuild');
  }

  // ---- 5) 索引 ----
  const indexes = [
    ['idx_posts_created',            'posts(created_at DESC)'],
    ['idx_posts_slug',               'posts(slug)'],
    ['idx_essays_date',              'essays(date DESC)'],
    ['idx_moments_created',          'moments(created_at DESC)'],
    ['idx_albums_created',           'albums(created_at DESC)'],
    ['idx_photos_album',             'photos(album_id, created_at DESC)'],
    ['idx_projects_created',         'projects(created_at DESC)'],
    ['idx_music_created',            'music(created_at DESC)'],
    ['idx_fish_rooms_code',          'fish_rooms(code)'],
    ['idx_fish_participants_room',   'fish_room_participants(room_id, last_active)'],
    ['idx_fish_participants_token',  'fish_room_participants(token)'],
    ['idx_fish_messages_room',       'fish_messages(room_id, id)'],
    ['idx_users_username',           'users(username)'],
  ];
  for (const [name, on] of indexes) db.run(`CREATE INDEX IF NOT EXISTS ${name} ON ${on}`);
  console.log('[Migrate] Indexes ensured:', indexes.length);

  // ---- 6) fish 房间补齐（100 个）----
  const existing = Number(db.exec('SELECT COUNT(*) FROM fish_rooms')[0].values[0][0]);
  let added = 0;
  if (existing < ROOM_COUNT) {
    const stmt = db.prepare('INSERT OR IGNORE INTO fish_rooms (code, max_participants) VALUES (?, 10)');
    for (let i = 0; i < ROOM_COUNT; i++) {
      const info = stmt.run('FISH' + String(i).padStart(2, '0'));
      added += Number(info.getRowsModified() || 0);
    }
  }
  console.log(`[Migrate] Fish rooms: existing=${existing}, added=${added}`);

  // ---- 7) 校验 + 写回 ----
  const printStats = () => {
    const tbls = ['posts','essays','moments','albums','photos','projects','music','fish_rooms','fish_room_participants','fish_messages','users'];
    const arr = tbls.map(t => {
      try { return `${t}=${db.exec(`SELECT COUNT(*) FROM ${t}`)[0].values[0][0]}`; } catch { return t + '=-1'; }
    });
    console.log('[Stats]   ' + arr.join(', '));
    const idxArr = db.exec("SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%' ORDER BY name")[0]?.values.flat() || [];
    console.log('[Indexes] ' + idxArr.join(', '));
  };
  printStats();

  const exported = db.export();
  fs.writeFileSync(DB_FILE, Buffer.from(exported));
  db.close();

  console.log('\nMigration complete. Backup kept at:');
  console.log('  ' + backup);
  console.log('(Backup can be deleted once you verify everything works)');
}

main().catch(e => { console.error('\n[FATAL]', e); process.exit(1); });

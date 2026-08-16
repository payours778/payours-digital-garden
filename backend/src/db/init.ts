import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import getDb, { saveDb } from './index';

// 注意：实际表结构以 ./index.ts 中的 CREATE IF NOT EXISTS + ensureCol() 迁移为准
// 本脚本只负责：admin 账户初始化 + fish 房间补齐 + 索引一致性检查
async function initDatabase() {
  try {
    // 调用 getDb() 触发内部的 CREATE IF NOT EXISTS / 补列 / 建索引 / 补 fish 房间
    const db = await getDb();

    // 初始化 admin 账户（不存在才创建，存在则跳过，绝不覆盖）
    const adminCheck = db.exec("SELECT id FROM users WHERE username = 'admin'");
    if (!adminCheck[0]?.values?.length) {
      const randomPassword = crypto.randomBytes(8).toString('hex');
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      const now = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);
      db.run(
        "INSERT INTO users (username, password_hash, phone, role, created_at, updated_at) VALUES ('admin', ?, '13512333216', 'admin', ?, ?)",
        [passwordHash, now, now]
      );
      console.log('');
      console.log('============================================');
      console.log('  Admin account created:');
      console.log('    username : admin');
      console.log('    password : ' + randomPassword);
      console.log('    phone    : 13512333216');
      console.log('  >> Save this password! Only shown once.');
      console.log('============================================');
      console.log('');
    } else {
      console.log('Admin account already exists, skip.');
    }

    // 统计
    const counts: Record<string, number> = {};
    for (const t of ['posts','essays','moments','albums','photos','projects','music','fish_rooms','fish_room_participants','fish_messages','users']) {
      try {
        counts[t] = Number(db.exec(`SELECT COUNT(*) FROM ${t}`)[0].values[0][0]);
      } catch { counts[t] = -1; }
    }
    const idx = db.exec("SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%' ORDER BY name")[0]?.values.flat() || [];
    console.log('Row counts: ' + Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(', '));
    console.log('Indexes:    ' + idx.join(', '));

    await saveDb();
    console.log('\nDone. Database is in sync.');
    process.exitCode = 0;
  } catch (error) {
    console.error('Database init failed:', error);
    process.exitCode = 1;
  }
}

initDatabase();

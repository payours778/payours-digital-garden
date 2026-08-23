import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import getDb from './index';
import { initSchema } from './schema';

// 注意：表结构与索引的创建已由 ./schema.ts 的 initSchema() 负责。
// 本脚本只负责：确保 schema + admin 账户初始化 + 行数统计。
async function initDatabase() {
  try {
    const db = await getDb();

    // 建表 + 建索引（幂等）
    await initSchema();

    // 初始化 admin 账户（不存在才创建，存在则跳过，绝不覆盖）
    const adminCheck = await db.exec("SELECT id FROM users WHERE username = 'admin'");
    if (!adminCheck[0]?.values?.length) {
      const randomPassword = crypto.randomBytes(8).toString('hex');
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      const now = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);
      await db.run(
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
        const r = await db.exec(`SELECT COUNT(*) FROM ${t}`);
        counts[t] = Number(r[0].values[0][0]);
      } catch { counts[t] = -1; }
    }
    console.log('Row counts: ' + Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(', '));

    console.log('\nDone. MySQL schema is in sync.');
    process.exitCode = 0;
  } catch (error) {
    console.error('Database init failed:', error);
    process.exitCode = 1;
  }
}

initDatabase();
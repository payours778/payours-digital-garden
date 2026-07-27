const { getDb } = require('./dist/db/index.js');

async function check() {
  const db = await getDb();
  for (let i = 1; i <= 10; i++) {
    const p = db.exec(`SELECT COUNT(*) FROM fish_room_participants WHERE room_id = ${i}`);
    console.log(`FISH0${i}: ${p[0]?.values?.[0]?.[0] || 0} participants`);
  }
}

check();
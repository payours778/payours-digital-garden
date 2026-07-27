const { getDb } = require('./dist/db/index.js');

async function check() {
  const db = await getDb();
  const rooms = db.exec('SELECT * FROM fish_rooms ORDER BY id');
  console.log('Rooms from DB:', JSON.stringify(rooms, null, 2));
}

check();
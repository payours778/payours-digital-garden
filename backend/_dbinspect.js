const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

(async () => {
  const SQL = await initSqlJs({
    locateFile: f => path.join(__dirname, 'node_modules', 'sql.js', 'dist', f)
  });
  const dbPath = path.join(__dirname, '..', 'database', 'blog.db');
  const buf = fs.readFileSync(dbPath);
  const db = new SQL.Database(buf);

  // 1) tables
  const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")[0].values.flat();
  console.log('Tables:', tables.join(', '));

  for (const t of tables) {
    const cols = db.exec(`PRAGMA table_info(${t})`)[0].values.map(c => `${c[1]} ${c[2]}${c[3] ? ' NOT NULL' : ''}${c[4] ? ' DEFAULT '+c[4] : ''}`).join(', ');
    const count = db.exec(`SELECT COUNT(*) FROM ${t}`)[0].values[0][0];
    const idx = db.exec(`PRAGMA index_list(${t})`)[0]?.values || [];
    const idxNames = idx.map(x => x[1]).join(', ') || '(none)';
    console.log(`\n--- ${t}  rows=${count}  indexes=${idxNames}\n    cols: ${cols}`);
  }

  db.close();
})().catch(e => { console.error(e); process.exit(1); });

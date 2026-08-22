const fs = require('fs');
const initSqlJs = require('sql.js');
const path = require('path');

initSqlJs({ locateFile: () => path.join('node_modules/sql.js/dist/sql-wasm.wasm') }).then(SQL => {
  const db = new SQL.Database(new Uint8Array(fs.readFileSync('../database/blog.db')));
  // 取得所有用户表（排除系统表）
  const tblRes = db.exec(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
  );
  if (!tblRes.length) { console.log('NO TABLES'); return; }
  const tables = tblRes[0].values.map(r => r[0]);
  tables.forEach(tn => {
    console.log('\n=== TABLE: ' + tn + ' ===');
    const sql = db.exec("SELECT sql FROM sqlite_master WHERE name='" + tn + "'")[0].values[0][0];
    console.log(sql);
    const cnt = db.exec('SELECT COUNT(*) FROM ' + tn)[0].values[0][0];
    console.log('-- rows: ' + cnt);
  });
});

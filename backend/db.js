const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('./config/config');

const dbPath = path.resolve(__dirname, config.dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
  } else {
    console.log('已连接到 SQLite 数据库');
  }
});

// 启用外键约束
db.run('PRAGMA foreign_keys = ON');

module.exports = db;



/**
 * 修复数据库中的图片路径（本地路径）
 * 用法：cd backend && node scripts/fixImagePaths.js
 */
const fs = require('fs');
const path = require('path');
const db = require('../db');

const SQL_FILE = path.join(__dirname, '../update_image_path.sql');

function run() {
  const sql = fs.readFileSync(SQL_FILE, 'utf8');
  const statements = sql
    .split(';')
    .map((s) => s.replace(/^\s*--[^\n]*\n?/gm, '').trim())
    .filter((s) => s && !/^SELECT/i.test(s));

  console.log('开始修复图片路径...\n');

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    for (const statement of statements) {
      if (/^BEGIN|^COMMIT/i.test(statement)) {
        continue;
      }
      db.run(statement, function onRun(err) {
        if (err) {
          console.error('执行失败:', statement.slice(0, 80), '...');
          console.error(err.message);
        } else if (this.changes > 0) {
          console.log(`✓ 更新 ${this.changes} 条`);
        }
      });
    }

    db.run('COMMIT', (err) => {
      if (err) {
        console.error('提交失败:', err.message);
        process.exit(1);
      }

      db.all('SELECT name, avatar_url FROM masters ORDER BY id', [], (e1, masters) => {
        db.all('SELECT name, image_url FROM heritage_items ORDER BY id', [], (e2, heritage) => {
          db.all(
            `SELECT title, image_url FROM works
             WHERE image_url IS NOT NULL AND image_url != ''
             ORDER BY id`,
            [],
            (e3, works) => {
              console.log('\n── 传承人头像 ──');
              (masters || []).forEach((m) => console.log(`  ${m.name}: ${m.avatar_url}`));

              console.log('\n── 非遗项目 ──');
              (heritage || []).forEach((h) => console.log(`  ${h.name}: ${h.image_url}`));

              console.log('\n── 作品图片 ──');
              (works || []).forEach((w) => console.log(`  ${w.title}: ${w.image_url}`));

              console.log('\n完成！');
              process.exit(0);
            }
          );
        });
      });
    });
  });
}

run();

const db = require('../db');
const fs = require('fs');
const path = require('path');

// 复制图片文件
const sourcePath = path.join(__dirname, '../../Picture/3.jpg');
const targetPath = path.join(__dirname, '../../frontend/public/Picture/3.jpg');

try {
  // 确保目标目录存在
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // 复制文件
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
    console.log('✓ 图片文件已复制到:', targetPath);
  } else {
    console.log('⚠ 源文件不存在:', sourcePath);
  }
} catch (error) {
  console.error('复制文件失败:', error.message);
}

// 更新数据库中的图片路径
db.run(
  `UPDATE heritage_items 
   SET image_url = '/Picture/3.jpg' 
   WHERE image_url = '/images/heritage/lacquer_restore.jpg'`,
  function(err) {
    if (err) {
      console.error('更新数据库失败:', err);
      process.exit(1);
    } else {
      console.log(`✓ 已更新 ${this.changes} 条记录`);
      console.log('图片路径已更新为: /Picture/3.jpg');
      process.exit(0);
    }
  }
);




const db = require('../db');

// 更新非遗项目图片路径
db.run(
  `UPDATE heritage_items 
   SET image_url = '/Picture/0.jpg' 
   WHERE image_url = '/images/heritage/lacquer_main.jpg'`,
  function(err) {
    if (err) {
      console.error('更新失败:', err);
      process.exit(1);
    } else {
      console.log(`✓ 已更新 ${this.changes} 条记录`);
      console.log('图片路径已更新为: /Picture/0.jpg');
      process.exit(0);
    }
  }
);




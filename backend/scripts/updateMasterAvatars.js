const db = require('../db');
const path = require('path');

// 更新传承人头像路径
const updateMasterAvatars = () => {
  const updates = [
    { name: '李守漆', avatar: '/6.jpg' },
    { name: '张怀素', avatar: '/6.jpg' },
    { name: '陈在田', avatar: '/6.jpg' },
    { name: '周静闻', avatar: '/6.jpg' },
    { name: '林意舟', avatar: '/6.jpg' },
    { name: '何墨川', avatar: '/6.jpg' }
  ];

  updates.forEach(({ name, avatar }) => {
    db.run(
      'UPDATE masters SET avatar_url = ? WHERE name = ?',
      [avatar, name],
      function(err) {
        if (err) {
          console.error(`更新 ${name} 的头像失败:`, err);
        } else {
          console.log(`✓ 已更新 ${name} 的头像路径: ${avatar}`);
        }
      }
    );
  });

  // 等待所有更新完成
  setTimeout(() => {
    console.log('\n所有头像路径更新完成！');
    process.exit(0);
  }, 1000);
};

updateMasterAvatars();


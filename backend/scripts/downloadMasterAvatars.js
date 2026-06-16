/**
 * 下载传承人头像到 frontend/public/masters/
 * 图片来源：Unsplash（免费可商用）、公开新闻配图
 */
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const db = require('../db');

const OUTPUT_DIR = path.join(__dirname, '../../frontend/public/masters');

// 每位传承人对应一张风格化肖像/工艺场景图（Unsplash 免费授权）
const masters = [
  {
    name: '李守漆',
    file: 'lishouqi.jpg',
    url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop&crop=faces',
    source: 'Unsplash - artisan craft workshop'
  },
  {
    name: '张怀素',
    file: 'zhanghuaisu.jpg',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=faces',
    source: 'Unsplash - professional woman portrait'
  },
  {
    name: '陈在田',
    file: 'chenzaitian.jpg',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces',
    source: 'Unsplash - mature craftsman portrait'
  },
  {
    name: '周静闻',
    file: 'zhoujingwen.jpg',
    url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces',
    source: 'Unsplash - artist portrait'
  },
  {
    name: '林意舟',
    file: 'linyizhou.jpg',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=faces',
    source: 'Unsplash - designer portrait'
  },
  {
    name: '何墨川',
    file: 'hemochuan.jpg',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces',
    source: 'Unsplash - senior craftsman portrait'
  },
  {
    name: '李囡',
    file: 'linan.jpg',
    // 漆艺工作场景（公开图库），真实人物照片需新闻授权，此处用漆艺制作场景替代展示
    url: 'https://images.unsplash.com/photo-1452860606245-08befc0ff4ba?w=400&h=400&fit=crop',
    source: 'Unsplash - hands crafting lacquer-like artisan work'
  }
];

async function downloadImage(url, dest) {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 30000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) HeritageMuseumBot/1.0'
    }
  });
  fs.writeFileSync(dest, response.data);
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('开始下载传承人头像...\n');

  for (const master of masters) {
    const dest = path.join(OUTPUT_DIR, master.file);
    const avatarPath = `/masters/${master.file}`;

    try {
      console.log(`下载 ${master.name} ...`);
      await downloadImage(master.url, dest);
      console.log(`  ✓ 已保存 ${dest}`);

      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE masters SET avatar_url = ? WHERE name = ?',
          [avatarPath, master.name],
          function (err) {
            if (err) reject(err);
            else {
              console.log(`  ✓ 数据库已更新 (${this.changes} 条): ${avatarPath}`);
              resolve();
            }
          }
        );
      });
    } catch (err) {
      console.error(`  ✗ ${master.name} 失败:`, err.message);
    }
  }

  console.log('\n全部完成！');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

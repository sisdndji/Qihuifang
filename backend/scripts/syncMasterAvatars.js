/**
 * 将传承人头像同步到 frontend/public/masters/ 并更新数据库
 * 优先使用 assets/masters/ 中的本地图片
 */
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const db = require('../db');

const PUBLIC_DIR = path.join(__dirname, '../../frontend/public/masters');
const ASSETS_DIR = path.join(__dirname, '../../assets/masters');

const masters = [
  { name: '李守漆', file: 'lishouqi.jpg' },
  { name: '张怀素', file: 'zhanghuaisu.jpg' },
  { name: '陈在田', file: 'chenzaitian.jpg' },
  { name: '周静闻', file: 'zhoujingwen.jpg' },
  { name: '林意舟', file: 'linyizhou.jpg' },
  { name: '何墨川', file: 'hemochuan.jpg' },
  { name: '李囡', file: 'linan.jpg' }
];

const unsplashFallback = {
  lishouqi: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop&crop=faces',
  zhanghuaisu: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=faces',
  chenzaitian: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces',
  zhoujingwen: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces',
  linyizhou: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=faces',
  hemochuan: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces'
};

async function download(url, dest) {
  const res = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 30000,
    headers: { 'User-Agent': 'Mozilla/5.0 HeritageMuseum/1.0' }
  });
  fs.writeFileSync(dest, res.data);
}

function copyIfExists(src, dest) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    return true;
  }
  return false;
}

async function ensureAvatar(master) {
  const dest = path.join(PUBLIC_DIR, master.file);
  const key = master.file.replace('.jpg', '');
  const localAsset = path.join(ASSETS_DIR, master.file);
  const cursorAsset = path.join(__dirname, '../../assets', master.file);

  if (copyIfExists(localAsset, dest) || copyIfExists(cursorAsset, dest)) {
    return 'local';
  }

  const fallbackUrl = unsplashFallback[key];
  if (fallbackUrl) {
    await download(fallbackUrl, dest);
    return 'unsplash';
  }

  throw new Error(`${master.name} 缺少头像资源`);
}

async function main() {
  if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });

  console.log('同步传承人头像...\n');

  for (const master of masters) {
    try {
      const source = await ensureAvatar(master);
      const avatarPath = `/masters/${master.file}`;

      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE masters SET avatar_url = ? WHERE name = ?',
          [avatarPath, master.name],
          function (err) {
            if (err) reject(err);
            else {
              console.log(`✓ ${master.name} [${source}] -> ${avatarPath}`);
              resolve();
            }
          }
        );
      });
    } catch (err) {
      console.error(`✗ ${master.name}:`, err.message);
    }
  }

  console.log('\n完成！');
  process.exit(0);
}

main();

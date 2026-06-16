const fs = require('fs');
const path = require('path');
const axios = require('axios');
const db = require('../db');

const dest = path.join(__dirname, '../../frontend/public/masters/linan.jpg');
const newsImages = [
  'https://wlt.hlj.gov.cn/31851462/images/23.jpg',
  'https://wlt.hlj.gov.cn/31851462/images/24.jpg'
];

async function download(url) {
  const res = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 30000,
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  return res.data;
}

async function main() {
  if (!fs.existsSync(path.dirname(dest))) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
  }

  let saved = false;
  for (const url of newsImages) {
    try {
      const data = await download(url);
      if (data.length > 5000) {
        fs.writeFileSync(dest, data);
        console.log('✓ 已从黑龙江文旅厅报道下载:', url, `(${data.length} bytes)`);
        saved = true;
        break;
      }
    } catch (e) {
      console.log('× 失败:', url, e.response?.status || e.message);
    }
  }

  if (!saved) {
    const generated = path.join(__dirname, '../../assets/linan.jpg');
    if (fs.existsSync(generated)) {
      fs.copyFileSync(generated, dest);
      console.log('✓ 已使用本地生成头像');
      saved = true;
    }
  }

  if (!saved) {
    throw new Error('无法获取李囡头像');
  }

  db.run(
    "UPDATE masters SET avatar_url = '/masters/linan.jpg' WHERE name = '李囡'",
    function (err) {
      if (err) throw err;
      console.log(`✓ 数据库已更新 (${this.changes} 条)`);
      process.exit(0);
    }
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

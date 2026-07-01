/**
 * 李囡作品图片爬虫：从公开报道页抓取配图，下载到 uploads/linan-works/ 并回写数据库
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const db = require('../db');
const config = require('../config/config');

const CRAWL_SOURCES = [
  {
    name: '黑龙江文旅厅-李囡报道',
    url: 'https://wlt.hlj.gov.cn/wlt/c115580/202506/c00_31851462.shtml'
  }
];

/** 作品标题与正文关键词，用于匹配爬虫图片 */
const WORK_MATCH_RULES = [
  { title: '《尔滨的雪》', keywords: ['尔滨', '亚冬', '贝壳', '雪花'] },
  { title: '青铜盾牌复原', keywords: ['盾牌', '青铜', '秦俑'] },
  { title: '千层髹涂冰雕主题漆盘', keywords: ['冰雕', '漆盘', '千层'] },
  { title: '传统工艺传习作品', keywords: ['传习', '学校', '教学'] },
  { title: '叠彩技法创新作品', keywords: ['叠彩', '专利', '200'] },
  { title: '国漆髹涂技艺精品', keywords: ['精品', '45道', '工序'] }
];

const USER_AGENT = 'Mozilla/5.0 HeritageMuseumBot/1.0 (educational; non-commercial)';

function getLinanWorksDir() {
  const base = path.isAbsolute(config.uploadDir)
    ? config.uploadDir
    : path.resolve(__dirname, '..', config.uploadDir.replace(/^\.\//, ''));
  const dir = path.join(base, 'linan-works');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function resolveImageUrl(src, pageUrl) {
  if (!src || src.startsWith('data:')) return null;
  if (/^https?:\/\//i.test(src)) return src;
  try {
    return new URL(src, pageUrl).href;
  } catch {
    return null;
  }
}

function extractImagesFromHtml(html, pageUrl) {
  const results = [];
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const absolute = resolveImageUrl(match[1].trim(), pageUrl);
    if (!absolute) continue;
    if (/logo|icon|ewm|qrcode|blank\.gif|spacer/i.test(absolute)) continue;
    if (!/\.(jpe?g|png|webp|gif)(\?|$)/i.test(absolute) && !absolute.includes('/pic/')) continue;
    if (!results.includes(absolute)) results.push(absolute);
  }
  return results;
}

async function downloadImage(imageUrl, destPath) {
  const res = await axios.get(imageUrl, {
    timeout: 30000,
    responseType: 'arraybuffer',
    headers: { 'User-Agent': USER_AGENT }
  });
  fs.writeFileSync(destPath, res.data);
  return destPath;
}

function pickImageForWork(title, images, index) {
  const rule = WORK_MATCH_RULES.find((r) => r.title === title);
  if (rule) {
    const idx = WORK_MATCH_RULES.indexOf(rule);
    if (images[idx]) return images[idx];
  }
  return images[index % images.length] || null;
}

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows || [])));
  });
}

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function runCb(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

/**
 * 爬取公开报道配图并更新李囡作品 image_url
 * @returns {Promise<{ updated: number, images: string[], source: string }>}
 */
async function syncLinanWorkImages() {
  const allImages = [];

  for (const source of CRAWL_SOURCES) {
    try {
      const res = await axios.get(source.url, {
        timeout: 25000,
        headers: { 'User-Agent': USER_AGENT },
        responseType: 'text'
      });
      const found = extractImagesFromHtml(res.data, source.url);
      found.forEach((img) => {
        if (!allImages.includes(img)) allImages.push(img);
      });
      console.log(`✓ 爬虫 ${source.name}: 发现 ${found.length} 张图片`);
    } catch (err) {
      console.warn(`爬取 ${source.name} 失败:`, err.message);
    }
  }

  const linan = await dbGet("SELECT id FROM masters WHERE name = '李囡'");
  if (!linan) {
    return { updated: 0, images: [], source: 'none', error: '未找到李囡' };
  }

  const works = await dbAll(
    'SELECT id, title, image_url FROM works WHERE master_id = ? ORDER BY year DESC, id ASC',
    [linan.id]
  );

  if (works.length === 0) {
    return { updated: 0, images: allImages, source: CRAWL_SOURCES[0]?.name || '' };
  }

  const worksDir = getLinanWorksDir();
  let updated = 0;

  for (let i = 0; i < works.length; i++) {
    const work = works[i];
    const remoteUrl = pickImageForWork(work.title, allImages, i);

    let localPath = `/works/${path.basename(work.image_url || '')}`;
    if (remoteUrl) {
      try {
        const ext = path.extname(new URL(remoteUrl).pathname) || '.jpg';
        const filename = `crawl-${work.id}${ext.split('?')[0]}`;
        const dest = path.join(worksDir, filename);
        await downloadImage(remoteUrl, dest);
        localPath = `/uploads/linan-works/${filename}`;
      } catch (err) {
        console.warn(`下载作品图失败 [${work.title}]:`, err.message);
        if (work.image_url && !work.image_url.startsWith('http')) {
          localPath = work.image_url;
        }
      }
    } else if (work.image_url && !work.image_url.startsWith('http')) {
      localPath = work.image_url;
    }

    if (localPath !== work.image_url) {
      await dbRun('UPDATE works SET image_url = ? WHERE id = ?', [localPath, work.id]);
      updated += 1;
    }
  }

  return {
    updated,
    images: allImages,
    source: CRAWL_SOURCES.map((s) => s.name).join(', ')
  };
}

/**
 * 获取李囡作品列表（含爬虫映射后的图片路径）
 */
async function getLinanWorksGallery() {
  const linan = await dbGet("SELECT id, name, avatar_url FROM masters WHERE name = '李囡'");
  if (!linan) return { master: null, works: [], crawled: false };

  const works = await dbAll(
    `SELECT w.*, m.name as master_name
     FROM works w
     LEFT JOIN masters m ON w.master_id = m.id
     WHERE w.master_id = ?
     ORDER BY w.year DESC, w.id ASC`,
    [linan.id]
  );

  return {
    master: { ...linan, avatar_url: '/6.jpg' },
    works,
    crawled: works.some((w) => (w.image_url || '').includes('/uploads/linan-works/'))
  };
}

module.exports = {
  CRAWL_SOURCES,
  syncLinanWorkImages,
  getLinanWorksGallery
};

/**
 * 构建前将项目根目录的本地图片同步到 frontend/public/
 * 确保云服务器 build 时 dist 包含 Picture、masters、works 等静态资源
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const PUBLIC = path.resolve(__dirname, '../public');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyFile(src, dest) {
  if (!fs.existsSync(src)) return false;
  try {
    ensureDir(path.dirname(dest));
    if (fs.existsSync(dest)) {
      const srcStat = fs.statSync(src);
      const destStat = fs.statSync(dest);
      if (srcStat.size === destStat.size && srcStat.mtimeMs <= destStat.mtimeMs) {
        return true;
      }
    }
    fs.copyFileSync(src, dest);
    return true;
  } catch (err) {
    console.warn(`跳过复制 ${path.basename(src)}: ${err.message}`);
    return false;
  }
}

function copyDir(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return 0;
  ensureDir(destDir);
  let count = 0;
  for (const name of fs.readdirSync(srcDir)) {
    const src = path.join(srcDir, name);
    const dest = path.join(destDir, name);
    if (fs.statSync(src).isFile()) {
      if (copyFile(src, dest)) count += 1;
    }
  }
  return count;
}

/** 李囡作品图：数据库路径 -> Picture 源文件 */
const WORK_IMAGE_MAP = {
  'work-2.jpg': ['2.jpg', '2.webp'],
  'work-3.jpg': ['3.jpg', '4.jpg'],
  'work-4.jpg': ['4.jpg', '5.jpg'],
  'work-12.jpg': ['12.jpg', '12.png'],
  'work-39-3.jpg': ['39_3.jpg', '39-3.jpg'],
  'work-40.jpg': ['40.jpg']
};

/** 非遗项目图：同步到 public 并生成 webp 别名（Home 页使用 .webp） */
const HERITAGE_PUBLIC_MAP = [
  { src: '0.jpg', publicNames: ['0.jpg', '0.webp'] },
  { src: '1.jpg', publicNames: ['1.jpg', '1.webp'] },
  { src: '2.jpg', publicNames: ['2.jpg', '2.webp'] },
  { src: '3.jpg', publicNames: ['3.jpg'] },
  { src: '12.jpg', publicNames: ['12.png', '12.jpg'] },
  { src: '12.png', publicNames: ['12.png'] }
];

let copied = 0;
let missing = [];

console.log('同步本地静态图片到 frontend/public/ ...\n');

// 1. Picture/ -> public/Picture/（优先 frontend/Picture，兼容项目根 Picture/）
const pictureCandidates = [
  path.resolve(__dirname, '../Picture'),
  path.join(ROOT, 'Picture')
];
const pictureRoot = pictureCandidates.find((dir) => fs.existsSync(dir));
const picturePublic = path.join(PUBLIC, 'Picture');
if (pictureRoot) {
  copied += copyDir(pictureRoot, picturePublic);
  console.log(`✓ Picture/ 已同步 (${pictureRoot})`);
} else {
  missing.push('Picture/（frontend/Picture 或项目根 Picture）');
}

// 2. 确保 heritage 常用文件名存在（webp 与 jpg 共用同一文件）
if (pictureRoot) {
for (const item of HERITAGE_PUBLIC_MAP) {
  const src = path.join(pictureRoot, item.src);
  if (!fs.existsSync(src)) continue;
  for (const name of item.publicNames) {
    const dest = path.join(picturePublic, name);
    if (copyFile(src, dest)) copied += 1;
  }
}
}

// 3. assets/masters/ -> public/masters/
const mastersSrc = path.join(ROOT, 'assets/masters');
const mastersDest = path.join(PUBLIC, 'masters');
copied += copyDir(mastersSrc, mastersDest);
if (fs.existsSync(mastersSrc)) {
  console.log('✓ assets/masters/ -> public/masters/');
} else {
  missing.push('assets/masters/');
}

// 4. 同步到 public/images/masters/（部分页面引用此路径）
const imagesMastersDest = path.join(PUBLIC, 'images/masters');
copied += copyDir(mastersSrc, imagesMastersDest);

// 5. 李囡 linan.jpg
const linanCandidates = [
  path.join(ROOT, 'assets/masters/linan.jpg'),
  path.join(ROOT, 'assets/linan.jpg')
];
for (const src of linanCandidates) {
  if (copyFile(src, path.join(mastersDest, 'linan.jpg'))) {
    copyFile(src, path.join(imagesMastersDest, 'linan.jpg'));
    copied += 1;
    break;
  }
}

// 6. 作品图 public/works/
const worksDest = path.join(PUBLIC, 'works');
ensureDir(worksDest);
for (const [destName, srcCandidates] of Object.entries(WORK_IMAGE_MAP)) {
  let done = false;
  if (!pictureRoot) {
    missing.push(`works/${destName}`);
    continue;
  }
  for (const candidate of srcCandidates) {
    const src = path.join(pictureRoot, candidate);
    if (copyFile(src, path.join(worksDest, destName))) {
      copied += 1;
      done = true;
      break;
    }
  }
  if (!done) missing.push(`works/${destName}`);
}

// 7. 传承人统一头像 public/6.jpg（李囡及陈在田等旧路径均映射到此文件）
const avatarSixCandidates = [
  path.join(PUBLIC, 'images/masters/linan.jpg'),
  path.join(mastersDest, 'linan.jpg'),
  path.join(ROOT, 'assets/masters/linan.jpg'),
  pictureRoot && path.join(pictureRoot, '36.jpg'),
  pictureRoot && path.join(pictureRoot, '0.jpg'),
  path.join(PUBLIC, 'Picture/0.jpg')
].filter(Boolean);
for (const src of avatarSixCandidates) {
  if (copyFile(src, path.join(PUBLIC, '6.jpg'))) {
    copied += 1;
    console.log('✓ public/6.jpg（传承人统一头像）');
    break;
  }
}
if (!fs.existsSync(path.join(PUBLIC, '6.jpg'))) {
  missing.push('public/6.jpg（需 linan.jpg 或 Picture/ 源图）');
}

console.log(`\n共同步 ${copied} 个文件`);
if (missing.length) {
  console.warn('以下资源未找到（请确认已放入项目目录）：');
  missing.forEach((m) => console.warn(`  - ${m}`));
}

console.log('\n完成。');

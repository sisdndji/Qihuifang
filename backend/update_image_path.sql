-- ============================================================
-- 图片路径修复脚本（SQLite）
-- 用途：将外部 URL、旧路径统一改回本地静态资源路径
-- 执行：sqlite3 heritage.db < update_image_path.sql
--   或 Railway 后端 Shell 中运行上述命令
-- ============================================================

BEGIN TRANSACTION;

-- ── 1. 清除所有外部 http(s) 链接（Unsplash 等误写入） ──
UPDATE masters
SET avatar_url = NULL
WHERE avatar_url LIKE 'http://%' OR avatar_url LIKE 'https://%';

UPDATE heritage_items
SET image_url = NULL
WHERE image_url LIKE 'http://%' OR image_url LIKE 'https://%';

UPDATE works
SET image_url = NULL
WHERE image_url LIKE 'http://%' OR image_url LIKE 'https://%';

-- ── 2. 非遗项目 → /Picture/ ──
UPDATE heritage_items SET image_url = '/Picture/0.jpg'
WHERE name = '国漆髹涂技艺 · 器物制作';

UPDATE heritage_items SET image_url = '/Picture/3.jpg'
WHERE name = '国漆髹涂技艺 · 器物修复';

UPDATE heritage_items SET image_url = '/Picture/12.png'
WHERE name = '国漆髹涂技艺 · 漆画艺术创作';

-- 旧路径兼容
UPDATE heritage_items SET image_url = '/Picture/0.jpg'
WHERE image_url IN ('/images/heritage/lacquer_main.jpg', '/Picture/0.webp');

UPDATE heritage_items SET image_url = '/Picture/3.jpg'
WHERE image_url = '/images/heritage/lacquer_restore.jpg';

UPDATE heritage_items SET image_url = '/Picture/12.png'
WHERE image_url IN ('/images/heritage/lacquer_painting.jpg', '/Picture/12.jpg');

-- ── 3. 传承人头像 → /masters/ ──
UPDATE masters SET avatar_url = '/masters/lishouqi.jpg'   WHERE name = '李守漆';
UPDATE masters SET avatar_url = '/masters/zhanghuaisu.jpg' WHERE name = '张怀素';
UPDATE masters SET avatar_url = '/masters/chenzaitian.jpg' WHERE name = '陈在田';
UPDATE masters SET avatar_url = '/masters/zhoujingwen.jpg' WHERE name = '周静闻';
UPDATE masters SET avatar_url = '/masters/linyizhou.jpg'  WHERE name = '林意舟';
UPDATE masters SET avatar_url = '/masters/hemochuan.jpg'  WHERE name = '何墨川';
UPDATE masters SET avatar_url = '/masters/linan.jpg'      WHERE name = '李囡';

-- 旧路径兼容
UPDATE masters SET avatar_url = '/masters/chenzaitian.jpg'
WHERE avatar_url = '/images/masters/chenzaitian.jpg';

UPDATE masters SET avatar_url = '/masters/linan.jpg'
WHERE avatar_url IN ('/images/masters/chenzaitian.jpg', '/images/masters/linan.jpg')
  AND name = '李囡';

-- 误设为 /6.jpg 的头像
UPDATE masters SET avatar_url = '/masters/' ||
  CASE name
    WHEN '李守漆' THEN 'lishouqi.jpg'
    WHEN '张怀素' THEN 'zhanghuaisu.jpg'
    WHEN '陈在田' THEN 'chenzaitian.jpg'
    WHEN '周静闻' THEN 'zhoujingwen.jpg'
    WHEN '林意舟' THEN 'linyizhou.jpg'
    WHEN '何墨川' THEN 'hemochuan.jpg'
    WHEN '李囡'   THEN 'linan.jpg'
  END
WHERE avatar_url = '/6.jpg';

-- 头像为空时按姓名补全
UPDATE masters SET avatar_url = '/masters/lishouqi.jpg'
WHERE name = '李守漆' AND (avatar_url IS NULL OR avatar_url = '');

UPDATE masters SET avatar_url = '/masters/zhanghuaisu.jpg'
WHERE name = '张怀素' AND (avatar_url IS NULL OR avatar_url = '');

UPDATE masters SET avatar_url = '/masters/chenzaitian.jpg'
WHERE name = '陈在田' AND (avatar_url IS NULL OR avatar_url = '');

UPDATE masters SET avatar_url = '/masters/zhoujingwen.jpg'
WHERE name = '周静闻' AND (avatar_url IS NULL OR avatar_url = '');

UPDATE masters SET avatar_url = '/masters/linyizhou.jpg'
WHERE name = '林意舟' AND (avatar_url IS NULL OR avatar_url = '');

UPDATE masters SET avatar_url = '/masters/hemochuan.jpg'
WHERE name = '何墨川' AND (avatar_url IS NULL OR avatar_url = '');

UPDATE masters SET avatar_url = '/masters/linan.jpg'
WHERE name = '李囡' AND (avatar_url IS NULL OR avatar_url = '');

-- ── 4. 李囡作品 → /works/ ──
UPDATE works SET image_url = '/works/work-2.jpg'
WHERE title = '《尔滨的雪》';

UPDATE works SET image_url = '/works/work-3.jpg'
WHERE title = '青铜盾牌复原';

UPDATE works SET image_url = '/works/work-4.jpg'
WHERE title = '千层髹涂冰雕主题漆盘';

UPDATE works SET image_url = '/works/work-12.jpg'
WHERE title = '传统工艺传习作品';

UPDATE works SET image_url = '/works/work-39-3.jpg'
WHERE title = '叠彩技法创新作品';

UPDATE works SET image_url = '/works/work-40.jpg'
WHERE title = '国漆髹涂技艺精品';

-- 修复损坏的路径
UPDATE works SET image_url = '/works/work-2.jpg'
WHERE image_url LIKE '%Picture%0.webp%' OR image_url LIKE '%Picture\0.webp%';

COMMIT;

-- ── 5. 验证（可选，执行后查看结果） ──
-- SELECT name, avatar_url FROM masters ORDER BY id;
-- SELECT name, image_url FROM heritage_items ORDER BY id;
-- SELECT title, image_url FROM works WHERE image_url IS NOT NULL ORDER BY id;

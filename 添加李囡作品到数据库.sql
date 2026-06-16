-- 添加李囡作品到数据库的SQL脚本
-- 使用方法：需要先获取李囡的ID和heritage_id，然后执行这些INSERT语句

-- 注意：执行前需要先查询李囡的ID和heritage_id
-- SELECT id FROM masters WHERE name = '李囡';
-- SELECT id FROM heritage_items WHERE name LIKE '%国漆髹涂技艺%器物制作%';

-- 假设李囡的ID是7，heritage_id是1（请根据实际情况修改）

-- 插入作品1：《尔滨的雪》
INSERT INTO works (title, master_id, heritage_id, year, style, region, description, image_url, tags)
SELECT 
  '《尔滨的雪》',
  m.id,
  h.id,
  2024,
  '叠彩技法',
  '哈尔滨',
  '为2025年哈尔滨亚洲冬季运动会创作的特别礼物。作品用天然贝壳表现冰的晶莹剔透，用传统国漆髹涂技法在贝壳上描绘雪花形状，巧妙地将古老漆艺与哈尔滨独特的冰雪文化融为一体。',
  '/works/work-2.jpg',
  '叠彩技法,冰雪文化,贝壳工艺'
FROM masters m, heritage_items h
WHERE m.name = '李囡' AND h.name LIKE '%国漆髹涂技艺%器物制作%'
LIMIT 1;

-- 插入作品2：青铜盾牌复原
INSERT INTO works (title, master_id, heritage_id, year, style, region, description, image_url, tags)
SELECT 
  '青铜盾牌复原',
  m.id,
  h.id,
  2023,
  '复原作品',
  '哈尔滨',
  '采用传统髹涂技艺复原古代青铜盾牌，展现了传统工艺在文物复原领域的应用价值。',
  '/works/work-3.jpg',
  '复原,传统工艺,文物修复'
FROM masters m, heritage_items h
WHERE m.name = '李囡' AND h.name LIKE '%国漆髹涂技艺%器物制作%'
LIMIT 1;

-- 插入作品3：千层髹涂冰雕主题漆盘
INSERT INTO works (title, master_id, heritage_id, year, style, region, description, image_url, tags)
SELECT 
  '千层髹涂冰雕主题漆盘',
  m.id,
  h.id,
  2024,
  '叠彩技法',
  '哈尔滨',
  '运用"千层髹涂"技法制作的冰雕主题漆盘，将哈尔滨的冰雪文化融入传统漆艺，展现了传统与现代的完美结合。',
  'Picture\0.webpPicture\0.webp',
  '叠彩技法,千层髹涂,冰雪文化'
FROM masters m, heritage_items h
WHERE m.name = '李囡' AND h.name LIKE '%国漆髹涂技艺%器物制作%'
LIMIT 1;

-- 插入作品4：传统工艺传习作品
INSERT INTO works (title, master_id, heritage_id, year, style, region, description, image_url, tags)
SELECT 
  '传统工艺传习作品',
  m.id,
  h.id,
  2024,
  '教学作品',
  '哈尔滨',
  '在哈尔滨现代应用职业学校传统工艺传习馆中创作的教学作品，展现了传统漆艺的教育传承价值。',
  '/works/work-12.jpg',
  '漆艺教育,教学作品,传承'
FROM masters m, heritage_items h
WHERE m.name = '李囡' AND h.name LIKE '%国漆髹涂技艺%器物制作%'
LIMIT 1;

-- 插入作品5：叠彩技法创新作品
INSERT INTO works (title, master_id, heritage_id, year, style, region, description, image_url, tags)
SELECT 
  '叠彩技法创新作品',
  m.id,
  h.id,
  2024,
  '叠彩技法',
  '哈尔滨',
  '运用自主开创的"叠彩"技法创作的作品，将大漆工艺拓展到更多材质，追求多重感官体验。',
  '/works/work-39-3.jpg',
  '叠彩技法,创新,多重材质'
FROM masters m, heritage_items h
WHERE m.name = '李囡' AND h.name LIKE '%国漆髹涂技艺%器物制作%'
LIMIT 1;

-- 插入作品6：国漆髹涂技艺精品
INSERT INTO works (title, master_id, heritage_id, year, style, region, description, image_url, tags)
SELECT 
  '国漆髹涂技艺精品',
  m.id,
  h.id,
  2024,
  '精品制作',
  '哈尔滨',
  '采用45道繁复工序制作的精品漆器，展现了传统国漆髹涂技艺的精湛工艺和深厚文化底蕴。',
  '/works/work-40.jpg',
  '精品制作,传统工艺,45道工序'
FROM masters m, heritage_items h
WHERE m.name = '李囡' AND h.name LIKE '%国漆髹涂技艺%器物制作%'
LIMIT 1;


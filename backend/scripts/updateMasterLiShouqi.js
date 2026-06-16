const db = require('../db');

const masterBio =
  '李守漆，福州漆艺世家第四代传人，深耕福州脱胎漆器髹饰技艺四十余年。福州脱胎漆器与景泰蓝、景德镇瓷器并称中国传统工艺"三宝"，其髹饰技艺于2006年列入首批国家级非物质文化遗产名录。他幼承家学，系统修习脱胎制坯、夏布裱褙、上灰打磨与层层髹漆等数十道工序，尤擅嵌螺钿与黑推光、色推光装饰——以天然贝壳薄片贴于漆胎，再罩光漆磨推至"光亮如镜"；推光漆面温润如玉，呈现闽都漆艺"色彩瑰丽"的典型风韵。代表作品《螺钿花鸟纹圆盒》将传统花鸟纹样与推光工艺相融合，多次入选省内外工艺美术展览；累计带徒二十余人，致力于器物制作领域的活态传承。';

const skillTags = '螺钿,推光,器物制作,嵌螺钿,脱胎漆器';
const representativeWorks = '《螺钿花鸟纹圆盒》、《推光漆盘系列》、《嵌螺钿花鸟屏风》';

const workUpdates = [
  {
    title: '螺钿花鸟纹圆盒',
    description:
      '取材福州脱胎漆器传统嵌螺钿技法：以天然贝壳裁成薄片，逐片嵌贴于漆盒胎体，再髹覆光漆、反复磨推，使钿片与漆面齐平并透出斑斓光华。盒面饰以传统花鸟纹样，推光后漆面"光亮如镜"，体现闽都漆艺"千文万华"之装饰特色。'
  },
  {
    title: '推光漆盘系列',
    description:
      '系列作品运用福州脱胎漆器经典黑推光、色推光髹饰技法，经数十道工序层层髹漆、精细研磨，盘面光滑如镜、触手温润。部分作品以渐变漆色表现空间层次，兼具日用陈设与工艺欣赏价值，展现"东方黑宝石"之漆韵。'
  },
  {
    title: '嵌螺钿花鸟屏风',
    description:
      '屏风以脱胎漆器为胎，综合运用嵌螺钿与推光工艺：螺钿片在斜阳下折射出五彩光华，与推光漆面的深邃底色形成对比。花鸟构图取法闽地传统纹样，是福州漆艺由器物向陈设领域延伸的代表之作。'
  }
];

db.serialize(() => {
  db.run(
    `UPDATE masters
     SET bio = ?, skill_tags = ?, representative_works = ?
     WHERE name = ?`,
    [masterBio, skillTags, representativeWorks, '李守漆'],
    function onMasterUpdate(err) {
      if (err) {
        console.error('更新传承人资料失败:', err);
        process.exit(1);
      }
      console.log(`✓ 已更新传承人 李守漆（${this.changes} 条）`);
    }
  );

  workUpdates.forEach(({ title, description }) => {
    db.run(
      `UPDATE works
       SET description = ?
       WHERE title = ?
         AND master_id = (SELECT id FROM masters WHERE name = '李守漆')`,
      [description, title],
      function onWorkUpdate(err) {
        if (err) {
          console.error(`更新作品 ${title} 失败:`, err);
          return;
        }
        if (this.changes === 0) {
          console.log(`- 作品 ${title} 不存在，跳过更新`);
        } else {
          console.log(`✓ 已更新作品：${title}`);
        }
      }
    );
  });

  db.run(
    `INSERT INTO works (title, master_id, heritage_id, year, style, region, description)
     SELECT ?, m.id, m.main_heritage_id, 2022, '嵌螺钿', '福州', ?
     FROM masters m
     WHERE m.name = '李守漆'
       AND NOT EXISTS (
         SELECT 1 FROM works w WHERE w.title = ? AND w.master_id = m.id
       )`,
    ['嵌螺钿花鸟屏风', workUpdates[2].description, '嵌螺钿花鸟屏风'],
    function onWorkInsert(err) {
      if (err) {
        console.error('插入新作品失败:', err);
        process.exit(1);
      }
      if (this.changes > 0) {
        console.log('✓ 已新增作品：嵌螺钿花鸟屏风');
      }
      console.log('\n李守漆资料更新完成！');
      process.exit(0);
    }
  );
});

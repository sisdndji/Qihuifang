// 添加李囡作品到数据库的脚本
// 使用方法：node scripts/addLinanWorks.js

const db = require('../db');

const addLinanWorks = () => {
  return new Promise((resolve, reject) => {
    // 先获取李囡的ID和heritage_id
    db.get("SELECT id FROM masters WHERE name = '李囡'", (err, masterRow) => {
      if (err || !masterRow) {
        console.error('未找到李囡传承人信息');
        return reject(err || new Error('未找到李囡'));
      }

      db.get("SELECT id FROM heritage_items WHERE name LIKE '%国漆髹涂技艺%器物制作%'", (err, heritageRow) => {
        if (err || !heritageRow) {
          console.error('未找到非遗项目信息');
          return reject(err || new Error('未找到非遗项目'));
        }

        const masterId = masterRow.id;
        const heritageId = heritageRow.id;

        console.log(`李囡ID: ${masterId}, 项目ID: ${heritageId}`);

        const works = [
          {
            title: '《尔滨的雪》',
            master_id: masterId,
            heritage_id: heritageId,
            year: 2024,
            style: '叠彩技法',
            region: '哈尔滨',
            description: '为2025年哈尔滨亚洲冬季运动会创作的特别礼物。作品用天然贝壳表现冰的晶莹剔透，用传统国漆髹涂技法在贝壳上描绘雪花形状，巧妙地将古老漆艺与哈尔滨独特的冰雪文化融为一体。',
            image_url: '/works/work-2.jpg',
            tags: '叠彩技法,冰雪文化,贝壳工艺'
          },
          {
            title: '青铜盾牌复原',
            master_id: masterId,
            heritage_id: heritageId,
            year: 2023,
            style: '复原作品',
            region: '哈尔滨',
            description: '采用传统髹涂技艺复原古代青铜盾牌，展现了传统工艺在文物复原领域的应用价值。',
            image_url: '/works/work-3.jpg',
            tags: '复原,传统工艺,文物修复'
          },
          {
            title: '千层髹涂冰雕主题漆盘',
            master_id: masterId,
            heritage_id: heritageId,
            year: 2024,
            style: '叠彩技法',
            region: '哈尔滨',
            description: '运用"千层髹涂"技法制作的冰雕主题漆盘，将哈尔滨的冰雪文化融入传统漆艺，展现了传统与现代的完美结合。',
            image_url: '/works/work-4.jpg',
            tags: '叠彩技法,千层髹涂,冰雪文化'
          },
          {
            title: '传统工艺传习作品',
            master_id: masterId,
            heritage_id: heritageId,
            year: 2024,
            style: '教学作品',
            region: '哈尔滨',
            description: '在哈尔滨现代应用职业学校传统工艺传习馆中创作的教学作品，展现了传统漆艺的教育传承价值。',
            image_url: '/works/work-12.jpg',
            tags: '漆艺教育,教学作品,传承'
          },
          {
            title: '叠彩技法创新作品',
            master_id: masterId,
            heritage_id: heritageId,
            year: 2024,
            style: '叠彩技法',
            region: '哈尔滨',
            description: '运用自主开创的"叠彩"技法创作的作品，将大漆工艺拓展到更多材质，追求多重感官体验。',
            image_url: '/works/work-39-3.jpg',
            tags: '叠彩技法,创新,多重材质'
          },
          {
            title: '国漆髹涂技艺精品',
            master_id: masterId,
            heritage_id: heritageId,
            year: 2024,
            style: '精品制作',
            region: '哈尔滨',
            description: '采用45道繁复工序制作的精品漆器，展现了传统国漆髹涂技艺的精湛工艺和深厚文化底蕴。',
            image_url: '/works/work-40.jpg',
            tags: '精品制作,传统工艺,45道工序'
          }
        ];

        let completed = 0;
        let errors = 0;

        works.forEach((work) => {
          // 先检查作品是否已存在
          db.get(
            `SELECT id FROM works WHERE title = ? AND master_id = ?`,
            [work.title, work.master_id],
            (err, existing) => {
              if (err) {
                console.error(`检查作品 ${work.title} 失败:`, err);
                errors++;
                if (++completed === works.length) {
                  resolve();
                }
                return;
              }

              if (existing) {
                console.log(`作品 "${work.title}" 已存在，跳过`);
                if (++completed === works.length) {
                  resolve();
                }
                return;
              }

              // 插入作品
              db.run(
                `INSERT INTO works (title, master_id, heritage_id, year, style, region, description, image_url, tags) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [work.title, work.master_id, work.heritage_id, work.year, work.style, work.region, 
                 work.description, work.image_url, work.tags],
                function(insertErr) {
                  if (insertErr) {
                    console.error(`插入作品 "${work.title}" 失败:`, insertErr);
                    errors++;
                  } else {
                    console.log(`✓ 已插入作品: ${work.title} (ID: ${this.lastID})`);
                  }
                  
                  if (++completed === works.length) {
                    if (errors === 0) {
                      console.log('\n所有作品添加完成！');
                    } else {
                      console.log(`\n完成，但有 ${errors} 个错误`);
                    }
                    resolve();
                  }
                }
              );
            }
          );
        });
      });
    });
  });
};

// 执行
addLinanWorks()
  .then(() => {
    console.log('脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  });




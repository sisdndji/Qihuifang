const db = require('../db');
const bcrypt = require('bcrypt');
const { seedCrawledDataIfEmpty } = require('../services/masterDistribution');

// 创建所有表
const createTables = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // users 表
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin', 'editor', 'viewer')),
        display_name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) return reject(err);
      });

      // heritage_items 表
      db.run(`CREATE TABLE IF NOT EXISTS heritage_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        intro TEXT NOT NULL,
        region TEXT NOT NULL,
        level TEXT NOT NULL,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) return reject(err);
      });

      // process_steps 表
      db.run(`CREATE TABLE IF NOT EXISTS process_steps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        heritage_id INTEGER NOT NULL,
        step_order INTEGER NOT NULL,
        step_name TEXT NOT NULL,
        short_desc TEXT NOT NULL,
        est_duration_hours REAL NOT NULL,
        skill_level INTEGER NOT NULL CHECK(skill_level BETWEEN 1 AND 5),
        FOREIGN KEY (heritage_id) REFERENCES heritage_items(id) ON DELETE CASCADE,
        UNIQUE(heritage_id, step_order)
      )`, (err) => {
        if (err) return reject(err);
      });

      // masters 表
      db.run(`CREATE TABLE IF NOT EXISTS masters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        generation TEXT NOT NULL,
        region TEXT NOT NULL,
        bio TEXT NOT NULL,
        avatar_url TEXT,
        main_heritage_id INTEGER,
        skill_tags TEXT,
        representative_works TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (main_heritage_id) REFERENCES heritage_items(id)
      )`, (err) => {
        if (err) return reject(err);
      });

      // comments 表
      db.run(`CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        heritage_id INTEGER NOT NULL,
        nickname TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (heritage_id) REFERENCES heritage_items(id) ON DELETE CASCADE
      )`, (err) => {
        if (err) return reject(err);
      });

      // platform_stats 表（平台浏览量计数）
      db.run(`CREATE TABLE IF NOT EXISTS platform_stats (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        page_views INTEGER NOT NULL DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) return reject(err);
        db.run(`INSERT OR IGNORE INTO platform_stats (id, page_views) VALUES (1, 0)`);
      });

      // 传承人省级地域分布（爬虫/公开资料）
      db.run(`CREATE TABLE IF NOT EXISTS master_region_stats (
        province TEXT PRIMARY KEY,
        master_count INTEGER NOT NULL DEFAULT 0,
        representatives TEXT,
        source TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) return reject(err);
      });

      // works 表
      db.run(`CREATE TABLE IF NOT EXISTS works (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        master_id INTEGER,
        heritage_id INTEGER NOT NULL,
        year INTEGER NOT NULL,
        style TEXT NOT NULL,
        region TEXT NOT NULL,
        image_url TEXT,
        description TEXT,
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (master_id) REFERENCES masters(id) ON DELETE SET NULL,
        FOREIGN KEY (heritage_id) REFERENCES heritage_items(id) ON DELETE CASCADE
      )`, (err) => {
        if (err) return reject(err);
        
        // 如果表已存在，检查并添加tags字段
        db.run(`ALTER TABLE works ADD COLUMN tags TEXT`, (alterErr) => {
          // 忽略错误（字段可能已存在）
          resolve();
        });
      });
    });
  });
};

// 旧库兼容：注册功能依赖 display_name 字段
const migrateUsersTable = () => {
  return new Promise((resolve) => {
    db.run('ALTER TABLE users ADD COLUMN display_name TEXT', (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.warn('users 表迁移 display_name:', err.message);
      }
      db.run(
        "UPDATE users SET display_name = username WHERE display_name IS NULL OR display_name = ''",
        () => resolve()
      );
    });
  });
};

// 旧库兼容：传承人头像统一为 /6.jpg
const migrateMasterAvatars = () => {
  return new Promise((resolve) => {
    db.run(
      `UPDATE masters SET avatar_url = '/6.jpg'
       WHERE avatar_url IS NULL
          OR avatar_url LIKE '/masters/%'
          OR avatar_url LIKE '/images/masters/%'
          OR avatar_url LIKE 'http%'`,
      () => resolve()
    );
  });
};

// 检查表是否为空
const isTableEmpty = (tableName) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT COUNT(*) as count FROM ${tableName}`, (err, row) => {
      if (err) return reject(err);
      resolve(row.count === 0);
    });
  });
};

// 插入 seed 数据
const seedData = async () => {
  try {
    // 检查 users 表
    if (await isTableEmpty('users')) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      db.run(`INSERT INTO users (username, password, role, display_name) 
              VALUES (?, ?, ?, ?)`,
        ['admin', hashedPassword, 'admin', '管理员'],
        (err) => {
          if (err) console.error('插入管理员用户失败:', err);
          else console.log('✓ 已插入管理员用户');
        });
    }

    // 检查 heritage_items 表
    if (await isTableEmpty('heritage_items')) {
      const heritageItems = [
        {
          name: '国漆髹涂技艺 · 器物制作',
          category: '国漆髹涂技艺',
          intro: '国漆髹涂技艺是中华传统工艺的瑰宝，以天然大漆为原料，经过三十六道精细工序，将木胎转化为精美绝伦的漆器。器物制作是髹涂技艺的核心，涵盖从选材、制胎到髹涂、装饰的完整工艺流程。',
          region: '福州',
          level: '国家级',
          image_url: '/Picture/0.jpg'
        },
        {
          name: '国漆髹涂技艺 · 器物修复',
          category: '国漆髹涂技艺',
          intro: '漆器修复是传承髹涂技艺的重要分支，需要深厚的工艺功底和对传统技法的深刻理解。修复师需准确识别器物年代、工艺特点，采用传统材料与技法，恢复其历史风貌与艺术价值。',
          region: '扬州',
          level: '国家级',
          image_url: '/Picture/3.jpg'
        },
        {
          name: '国漆髹涂技艺 · 漆画艺术创作',
          category: '漆画创作',
          intro: '漆画艺术创作将传统髹涂技艺与现代艺术理念相结合，以漆为媒介，创作出具有独特东方美学韵味的艺术作品。漆画既保留了传统工艺的精髓，又拓展了艺术表现的可能性。',
          region: '成都',
          level: '国家级',
          image_url: '/Picture/12.png'
        }
      ];

      heritageItems.forEach((item, index) => {
        db.run(`INSERT INTO heritage_items (name, category, intro, region, level, image_url) 
                VALUES (?, ?, ?, ?, ?, ?)`,
          [item.name, item.category, item.intro, item.region, item.level, item.image_url],
          function(err) {
            if (err) {
              console.error(`插入非遗项目 ${index + 1} 失败:`, err);
            } else {
              console.log(`✓ 已插入非遗项目: ${item.name} (ID: ${this.lastID})`);
              
              // 如果是第一个项目（器物制作），插入36道工序
              if (index === 0) {
                insertProcessSteps(this.lastID);
              }
            }
          });
      });
    }

    // 检查 masters 表
    if (await isTableEmpty('masters')) {
      // 先获取heritage_id
      db.get("SELECT id FROM heritage_items WHERE name = '国漆髹涂技艺 · 器物制作'", async (err, heritageRow) => {
        if (err || !heritageRow) {
          console.error('无法获取heritage_id，跳过传承人数据');
          return;
        }

        const heritageId = heritageRow.id;
        const masters = [
          {
            name: '李守漆',
            generation: '第四代传承人',
            region: '福州',
            bio: '李守漆，福州漆艺世家第四代传人，深耕福州脱胎漆器髹饰技艺四十余年。福州脱胎漆器与景泰蓝、景德镇瓷器并称中国传统工艺"三宝"，其髹饰技艺于2006年列入首批国家级非物质文化遗产名录。他幼承家学，系统修习脱胎制坯、夏布裱褙、上灰打磨与层层髹漆等数十道工序，尤擅嵌螺钿与黑推光、色推光装饰——以天然贝壳薄片贴于漆胎，再罩光漆磨推至"光亮如镜"；推光漆面温润如玉，呈现闽都漆艺"色彩瑰丽"的典型风韵。代表作品《螺钿花鸟纹圆盒》将传统花鸟纹样与推光工艺相融合，多次入选省内外工艺美术展览；累计带徒二十余人，致力于器物制作领域的活态传承。',
            avatar_url: '/6.jpg',
            main_heritage_id: heritageId,
            skill_tags: '螺钿,推光,器物制作,嵌螺钿,脱胎漆器',
            representative_works: '《螺钿花鸟纹圆盒》、《推光漆盘系列》、《嵌螺钿花鸟屏风》'
          },
          {
            name: '张怀素',
            generation: '第五代传承人',
            region: '扬州',
            bio: '张怀素，扬州漆器修复大师，师承著名修复专家，擅长金箔贴饰与古漆器修复。在修复过程中，她严格遵循传统工艺，使用天然大漆和传统材料，成功修复了数百件明清漆器珍品。其修复作品既保持了历史原貌，又恢复了器物的实用功能，在文博界享有盛誉。',
            avatar_url: '/6.jpg',
            representative_works: '修复《明代剔红漆盒》、《清代描金漆柜》、《修复漆器系列》'
          },
          {
            name: '陈在田',
            generation: '第三代传承人',
            region: '成都',
            bio: '陈在田，成都漆器制作大师，以重器制作和漆层控制技艺见长。他精通多层髹涂工艺，能够精确控制每层漆的厚度和干燥时间，制作出厚重沉稳、漆层均匀的大型漆器。其作品《大漆方鼎》高逾一米，漆层达三十六层，展现了高超的工艺水平。',
            avatar_url: '/6.jpg',
            representative_works: '《大漆方鼎》、《多层髹涂漆罐》、《重器系列》'
          },
          {
            name: '周静闻',
            generation: '第四代传承人',
            region: '景德镇',
            bio: '周静闻，景德镇漆器艺术家，开创性地将漆器工艺与陶瓷艺术相结合，形成独特的跨界风格。她将陶瓷的温润质感与漆器的光泽效果完美融合，创作出一系列具有现代审美的新式漆器作品。其创新实践为传统工艺的现代转化提供了新思路。',
            avatar_url: '/6.jpg',
            representative_works: '《漆陶融合系列》、《现代漆器设计》、《跨界艺术作品集》'
          },
          {
            name: '林意舟',
            generation: '第五代传承人',
            region: '厦门',
            bio: '林意舟，厦门新中式漆器设计师，致力于将传统髹涂技艺与现代生活美学相结合。她设计的漆器作品既保留了传统工艺的精髓，又融入了现代简约的设计理念，深受年轻消费者喜爱。其作品多次参加国际设计展，为传统工艺的国际化传播做出贡献。',
            avatar_url: '/6.jpg',
            representative_works: '《新中式漆器系列》、《现代生活漆器》、《设计作品集》'
          },
          {
            name: '何墨川',
            generation: '第四代传承人',
            region: '重庆',
            bio: '何墨川，重庆老漆器修复专家，专注于明清及民国时期漆器的修复与保护。他精通各种传统髹涂技法，能够准确识别不同时期的工艺特点，采用传统材料进行修复。四十余年来，他修复的漆器文物超过五百件，为文物保护事业做出了重要贡献。',
            avatar_url: '/6.jpg',
            representative_works: '修复《清代漆器文物系列》、《明清漆器修复案例集》、《文物保护作品》'
          },
          {
            name: '李囡',
            generation: '省级非遗传承人',
            region: '哈尔滨',
            bio: '李囡，省级非遗国漆髹涂技艺传承人，在冰城黑土培育漆艺之花。从复原青铜盾牌到创作亚冬会礼物《尔滨的雪》，这位深谙传统漆艺的手艺人，正让这门古老工艺在冰城大放光彩。他熬过"漆咬"研发"叠彩"自主开创全新技法，将大漆工艺拓展到更多材质。2019年回到家乡哈尔滨，成为了省级非遗国漆髹涂技艺传承人，决心在冰城扎下根，播撒传统漆艺的种子。他在哈尔滨现代应用职业学校建立了传统工艺传习馆，用轻松活泼、新颖有趣的方式，展示着哈尔滨丰富的传统工艺项目。',
            avatar_url: '/6.jpg',
            representative_works: '《尔滨的雪》（亚冬会礼物）、《青铜盾牌复原》、《千层髹涂冰雕主题漆盘》'
          }
        ];

        masters.forEach((master) => {
          db.run(`INSERT INTO masters (name, generation, region, bio, avatar_url, main_heritage_id, skill_tags, representative_works) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [master.name, master.generation, master.region, master.bio, master.avatar_url, 
             master.main_heritage_id, master.skill_tags, master.representative_works],
            function(err) {
              if (err) {
                console.error(`插入传承人 ${master.name} 失败:`, err);
              } else {
                console.log(`✓ 已插入传承人: ${master.name} (ID: ${this.lastID})`);
              }
            });
        });
      });
    }

    // 检查 works 表
    if (await isTableEmpty('works')) {
      // 获取master和heritage的ID
      db.all("SELECT id, name FROM masters", (err, masters) => {
        if (err) {
          console.error('获取传承人列表失败:', err);
          return;
        }

        db.all("SELECT id, name FROM heritage_items", (err, heritages) => {
          if (err) {
            console.error('获取非遗项目列表失败:', err);
            return;
          }

          const works = [
            { title: '螺钿花鸟纹圆盒', master: '李守漆', heritage: '国漆髹涂技艺 · 器物制作', year: 2018, style: '螺钿重器', region: '福州', description: '取材福州脱胎漆器传统嵌螺钿技法：以天然贝壳裁成薄片，逐片嵌贴于漆盒胎体，再髹覆光漆、反复磨推，使钿片与漆面齐平并透出斑斓光华。盒面饰以传统花鸟纹样，推光后漆面"光亮如镜"，体现闽都漆艺"千文万华"之装饰特色。' },
            { title: '推光漆盘系列', master: '李守漆', heritage: '国漆髹涂技艺 · 器物制作', year: 2020, style: '推光工艺', region: '福州', description: '系列作品运用福州脱胎漆器经典黑推光、色推光髹饰技法，经数十道工序层层髹漆、精细研磨，盘面光滑如镜、触手温润。部分作品以渐变漆色表现空间层次，兼具日用陈设与工艺欣赏价值，展现"东方黑宝石"之漆韵。' },
            { title: '嵌螺钿花鸟屏风', master: '李守漆', heritage: '国漆髹涂技艺 · 器物制作', year: 2022, style: '嵌螺钿', region: '福州', description: '屏风以脱胎漆器为胎，综合运用嵌螺钿与推光工艺：螺钿片在斜阳下折射出五彩光华，与推光漆面的深邃底色形成对比。花鸟构图取法闽地传统纹样，是福州漆艺由器物向陈设领域延伸的代表之作。' },
            { title: '明代剔红漆盒修复', master: '张怀素', heritage: '国漆髹涂技艺 · 器物修复', year: 2019, style: '修复作品', region: '扬州', description: '成功修复明代剔红漆盒，恢复了其历史风貌和实用功能，展现了传统修复技艺的精湛。' },
            { title: '清代描金漆柜修复', master: '张怀素', heritage: '国漆髹涂技艺 · 器物修复', year: 2021, style: '修复作品', region: '扬州', description: '采用传统描金工艺修复清代漆柜，保持了历史原貌，恢复了器物的艺术价值。' },
            { title: '大漆方鼎', master: '陈在田', heritage: '国漆髹涂技艺 · 器物制作', year: 2017, style: '重器制作', region: '成都', description: '高逾一米的大型漆器，采用三十六层髹涂工艺，漆层均匀厚重，展现了高超的漆层控制技艺。' },
            { title: '多层髹涂漆罐', master: '陈在田', heritage: '国漆髹涂技艺 · 器物制作', year: 2019, style: '多层髹涂', region: '成都', description: '展现了多层髹涂工艺的精髓，每层漆都经过精心打磨，最终形成厚重沉稳的质感。' },
            { title: '漆陶融合系列', master: '周静闻', heritage: '国漆髹涂技艺 · 漆画艺术创作', year: 2020, style: '跨界创新', region: '景德镇', description: '将陶瓷的温润质感与漆器的光泽效果完美融合，开创了漆器与陶瓷跨界的新形式。' },
            { title: '现代漆器设计', master: '周静闻', heritage: '国漆髹涂技艺 · 器物制作', year: 2022, style: '现代设计', region: '景德镇', description: '融合现代设计理念的漆器作品，既保留了传统工艺的精髓，又具有现代审美特征。' },
            { title: '新中式漆器系列', master: '林意舟', heritage: '国漆髹涂技艺 · 器物制作', year: 2021, style: '新中式设计', region: '厦门', description: '将传统髹涂技艺与现代生活美学相结合，设计出符合现代人审美和使用习惯的漆器作品。' },
            { title: '现代生活漆器', master: '林意舟', heritage: '国漆髹涂技艺 · 器物制作', year: 2023, style: '设计创新', region: '厦门', description: '专为现代生活设计的漆器作品，简约而不失传统韵味，深受年轻消费者喜爱。' },
            { title: '清代漆器文物修复', master: '何墨川', heritage: '国漆髹涂技艺 · 器物修复', year: 2018, style: '修复作品', region: '重庆', description: '采用传统材料和技法修复清代漆器文物，恢复了其历史价值和艺术魅力。' },
            { title: '明清漆器修复案例', master: '何墨川', heritage: '国漆髹涂技艺 · 器物修复', year: 2020, style: '修复作品', region: '重庆', description: '成功修复多件明清时期漆器文物，展现了传统修复技艺的精湛和对历史文物的尊重。' },
            // 李囡的作品
            { title: '《尔滨的雪》', master: '李囡', heritage: '国漆髹涂技艺 · 器物制作', year: 2024, style: '叠彩技法', region: '哈尔滨', description: '为2025年哈尔滨亚洲冬季运动会创作的特别礼物。作品用天然贝壳表现冰的晶莹剔透，用传统国漆髹涂技法在贝壳上描绘雪花形状，巧妙地将古老漆艺与哈尔滨独特的冰雪文化融为一体。', image_url: '/works/work-2.jpg', tags: '叠彩技法,冰雪文化,贝壳工艺' },
            { title: '青铜盾牌复原', master: '李囡', heritage: '国漆髹涂技艺 · 器物制作', year: 2023, style: '复原作品', region: '哈尔滨', description: '采用传统髹涂技艺复原古代青铜盾牌，展现了传统工艺在文物复原领域的应用价值。', image_url: '/works/work-3.jpg', tags: '复原,传统工艺,文物修复' },
            { title: '千层髹涂冰雕主题漆盘', master: '李囡', heritage: '国漆髹涂技艺 · 器物制作', year: 2024, style: '叠彩技法', region: '哈尔滨', description: '运用"千层髹涂"技法制作的冰雕主题漆盘，将哈尔滨的冰雪文化融入传统漆艺，展现了传统与现代的完美结合。', image_url: '/works/work-4.jpg', tags: '叠彩技法,千层髹涂,冰雪文化' },
            { title: '传统工艺传习作品', master: '李囡', heritage: '国漆髹涂技艺 · 器物制作', year: 2024, style: '教学作品', region: '哈尔滨', description: '在哈尔滨现代应用职业学校传统工艺传习馆中创作的教学作品，展现了传统漆艺的教育传承价值。', image_url: '/works/work-12.jpg', tags: '漆艺教育,教学作品,传承' },
            { title: '叠彩技法创新作品', master: '李囡', heritage: '国漆髹涂技艺 · 器物制作', year: 2024, style: '叠彩技法', region: '哈尔滨', description: '运用自主开创的"叠彩"技法创作的作品，将大漆工艺拓展到更多材质，追求多重感官体验。', image_url: '/works/work-39-3.jpg', tags: '叠彩技法,创新,多重材质' },
            { title: '国漆髹涂技艺精品', master: '李囡', heritage: '国漆髹涂技艺 · 器物制作', year: 2024, style: '精品制作', region: '哈尔滨', description: '采用45道繁复工序制作的精品漆器，展现了传统国漆髹涂技艺的精湛工艺和深厚文化底蕴。', image_url: '/works/work-40.jpg', tags: '精品制作,传统工艺,45道工序' }
          ];

          works.forEach((work) => {
            const master = masters.find(m => m.name === work.master);
            const heritage = heritages.find(h => h.name === work.heritage);
            
            if (master && heritage) {
              db.run(`INSERT INTO works (title, master_id, heritage_id, year, style, region, description, image_url, tags) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [work.title, master.id, heritage.id, work.year, work.style, work.region, 
                 work.description, work.image_url || `/images/works/${work.title.replace(/\s+/g, '_')}.jpg`, work.tags || null],
                function(err) {
                  if (err) {
                    console.error(`插入作品 ${work.title} 失败:`, err);
                  } else {
                    console.log(`✓ 已插入作品: ${work.title}`);
                  }
                });
            }
          });
        });
      });
    }

  } catch (error) {
    console.error('Seed 数据插入失败:', error);
  }
};

// 插入36道工序
const insertProcessSteps = (heritageId) => {
  const steps = [
    { order: 1, name: '选漆树', desc: '选择生长良好、漆液质量高的漆树，通常选择树龄在8-15年的漆树。', duration: 2, level: 2 },
    { order: 2, name: '割漆', desc: '在漆树树干上割开V字形切口，收集流出的生漆液，需掌握割漆的深度和时机。', duration: 4, level: 3 },
    { order: 3, name: '滤杂', desc: '将收集的生漆通过细纱布过滤，去除树皮、杂质和悬浮物，得到纯净的漆液。', duration: 1, level: 1 },
    { order: 4, name: '熟漆调配', desc: '将生漆在特定温度下搅拌氧化，加入适量桐油或植物油，调配成适合髹涂的熟漆。', duration: 24, level: 4 },
    { order: 5, name: '选材', desc: '选择质地坚实、纹理美观的木材，如楠木、樟木、杉木等，作为漆器的胎体材料。', duration: 2, level: 2 },
    { order: 6, name: '开料', desc: '根据器物设计图纸，将木材锯切成所需尺寸和形状的坯料。', duration: 4, level: 2 },
    { order: 7, name: '木胎成型', desc: '通过刨、凿、雕等木工技法，将坯料加工成器物的基本形状，形成木胎。', duration: 8, level: 3 },
    { order: 8, name: '阴干养胎', desc: '将成型的木胎放置在阴凉通风处自然干燥，去除内部水分，防止后期变形开裂。', duration: 720, level: 1 },
    { order: 9, name: '刮磨找平', desc: '用刮刀和砂纸对木胎表面进行精细打磨，确保表面平整光滑，无毛刺和瑕疵。', duration: 6, level: 2 },
    { order: 10, name: '灰胎配制', desc: '将生漆、瓦灰、猪血等按比例混合，调配成用于打底的灰胎材料。', duration: 2, level: 3 },
    { order: 11, name: '打底布', desc: '在木胎表面粘贴麻布或夏布，增强胎体的强度和稳定性，防止开裂。', duration: 4, level: 3 },
    { order: 12, name: '批刮灰胎', desc: '将调配好的灰胎材料均匀批刮在木胎表面，形成一层平整的灰胎层。', duration: 8, level: 3 },
    { order: 13, name: '打磨灰胎', desc: '待灰胎干燥后，用砂纸打磨至表面光滑平整，为后续髹漆做准备。', duration: 6, level: 2 },
    { order: 14, name: '刷漆打底', desc: '在灰胎表面刷涂第一层底漆，要求均匀覆盖，无遗漏和气泡。', duration: 4, level: 2 },
    { order: 15, name: '晾置干燥', desc: '将刷好底漆的器物放置在阴凉处自然干燥，通常需要数天至数周时间。', duration: 168, level: 1 },
    { order: 16, name: '复髹上漆', desc: '在第一层底漆干燥后，继续刷涂第二层、第三层漆，层层叠加。', duration: 8, level: 3 },
    { order: 17, name: '磨漆找平', desc: '每层漆干燥后，用细砂纸或水砂纸打磨，去除漆面不平和气泡，确保平整。', duration: 6, level: 3 },
    { order: 18, name: '再髹罩漆', desc: '在打磨平整的漆面上继续刷涂罩面漆，形成最终的漆层表面。', duration: 6, level: 3 },
    { order: 19, name: '推光打磨', desc: '使用推光石或细砂纸对漆面进行精细打磨，使漆面光滑如镜，温润如玉。', duration: 12, level: 4 },
    { order: 20, name: '纹样设计', desc: '根据器物用途和审美要求，设计装饰纹样，可以是传统图案或现代设计。', duration: 8, level: 4 },
    { order: 21, name: '稿样转描', desc: '将设计好的纹样通过描摹或转印的方式，转移到漆器表面。', duration: 4, level: 3 },
    { order: 22, name: '描金勾线', desc: '使用金粉或金箔，按照纹样轮廓进行描金勾线，形成金色的装饰线条。', duration: 8, level: 4 },
    { order: 23, name: '贴金箔', desc: '将金箔小心地贴在需要装饰的部位，要求平整无皱，边缘整齐。', duration: 6, level: 5 },
    { order: 24, name: '罩金护漆', desc: '在贴好的金箔表面刷涂透明保护漆，防止金箔氧化和脱落。', duration: 4, level: 3 },
    { order: 25, name: '刻填装饰', desc: '使用刻刀在漆面上刻出纹样，然后填入彩漆或金粉，形成精美的装饰效果。', duration: 12, level: 5 },
    { order: 26, name: '螺钿镶嵌', desc: '将贝壳、螺片等材料加工成所需形状，镶嵌在漆器表面，形成精美的装饰图案。', duration: 16, level: 5 },
    { order: 27, name: '嵌贝打磨', desc: '对镶嵌好的螺钿进行精细打磨，使其与漆面平齐，表面光滑。', duration: 8, level: 4 },
    { order: 28, name: '罩漆封护', desc: '在完成装饰的漆器表面刷涂最后一层保护漆，封护装饰层。', duration: 4, level: 2 },
    { order: 29, name: '终磨抛光', desc: '对完成所有工序的漆器进行最后的精细打磨和抛光，达到最佳的光泽效果。', duration: 10, level: 4 },
    { order: 30, name: '检视修补', desc: '仔细检查漆器表面，发现瑕疵及时修补，确保作品完美无缺。', duration: 4, level: 3 },
    { order: 31, name: '题款落章', desc: '在器物适当位置题写款识或加盖印章，标明制作者、年代等信息。', duration: 2, level: 3 },
    { order: 32, name: '内外清理', desc: '清理器物内外表面的灰尘和残留物，保持器物的整洁美观。', duration: 2, level: 1 },
    { order: 33, name: '最终养护', desc: '对完成的漆器进行最后的养护处理，涂抹养护油，确保长期保存。', duration: 2, level: 2 },
    { order: 34, name: '封存入库', desc: '将完成的漆器妥善包装，放置在适宜的环境中保存，防止受潮和损坏。', duration: 1, level: 1 },
    { order: 35, name: '展陈布置', desc: '根据展示需求，将漆器放置在合适的展台上，配以说明文字和灯光。', duration: 2, level: 2 },
    { order: 36, name: '日常保养', desc: '定期对漆器进行清洁和养护，保持其光泽和美观，延长使用寿命。', duration: 1, level: 2 }
  ];

  steps.forEach((step) => {
    db.run(`INSERT INTO process_steps (heritage_id, step_order, step_name, short_desc, est_duration_hours, skill_level) 
            VALUES (?, ?, ?, ?, ?, ?)`,
      [heritageId, step.order, step.name, step.desc, step.duration, step.level],
      function(err) {
        if (err) {
          console.error(`插入工序 ${step.name} 失败:`, err);
        } else {
          console.log(`✓ 已插入工序: ${step.name} (第${step.order}步)`);
        }
      });
  });
};

// 初始化数据库
const initDb = async () => {
  try {
    console.log('开始初始化数据库...');
    await createTables();
    console.log('✓ 数据表创建完成');
    await migrateUsersTable();
    await migrateMasterAvatars();
    await seedData();
    await seedCrawledDataIfEmpty();

    if (process.env.CRAWL_LINAN_WORKS !== 'false') {
      const { syncLinanWorkImages } = require('../services/linanWorksCrawler');
      syncLinanWorkImages()
        .then((r) => console.log(`✓ 李囡作品爬虫: 更新 ${r.updated} 条`, r.source || ''))
        .catch((err) => console.warn('李囡作品爬虫跳过:', err.message));
    }

    console.log('✓ 数据库初始化完成');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
};

module.exports = { initDb };



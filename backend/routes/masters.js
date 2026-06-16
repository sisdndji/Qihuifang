const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  mergeDistribution,
  crawlAndUpdate,
  toProvinceName
} = require('../services/masterDistribution');

// 获取所有传承人（支持筛选）
router.get('/', (req, res) => {
  try {
    let query = 'SELECT * FROM masters WHERE 1=1';
    const params = [];

    if (req.query.region) {
      query += ' AND region = ?';
      params.push(req.query.region);
    }
    if (req.query.heritage_id) {
      query += ' AND main_heritage_id = ?';
      params.push(req.query.heritage_id);
    }
    if (req.query.skill_tag) {
      query += ' AND skill_tags LIKE ?';
      params.push(`%${req.query.skill_tag}%`);
    }

    query += ' ORDER BY id ASC';

    db.all(query, params, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: '查询失败' });
      }
      res.json(rows);
    });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 全国传承人地域分布（爬虫数据 + 本站数据库合并）
router.get('/distribution', async (req, res) => {
  try {
    const data = await mergeDistribution();
    res.json(data);
  } catch (error) {
    console.error('获取地域分布失败:', error);
    res.status(500).json({ error: '获取地域分布失败' });
  }
});

// 管理员：刷新地域分布爬虫数据
router.post('/distribution/refresh', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await crawlAndUpdate();
    const data = await mergeDistribution();
    res.json({ message: '地域分布数据已更新', ...data });
  } catch (error) {
    console.error('刷新地域分布失败:', error);
    res.status(500).json({ error: '刷新地域分布失败', message: error.message });
  }
});

// 获取传承人统计
router.get('/stats', (req, res) => {
  try {
    db.all(`SELECT region, COUNT(*) as count 
            FROM masters 
            GROUP BY region 
            ORDER BY count DESC`, (err, regionStats) => {
      if (err) {
        return res.status(500).json({ error: '地区统计失败' });
      }

      db.all(`SELECT skill_tags FROM masters WHERE skill_tags IS NOT NULL`, (err, skillRows) => {
        if (err) {
          return res.status(500).json({ error: '技能标签查询失败' });
        }

        const skillCounts = {};
        skillRows.forEach(row => {
          if (row.skill_tags) {
            const tags = row.skill_tags.split(',').map(t => t.trim());
            tags.forEach(tag => {
              skillCounts[tag] = (skillCounts[tag] || 0) + 1;
            });
          }
        });

        const skillDistribution = Object.entries(skillCounts).map(([tag, count]) => ({
          tag,
          count
        })).sort((a, b) => b.count - a.count);

        db.all(`SELECT 
                  w.year,
                  COUNT(DISTINCT w.master_id) as master_count
                FROM works w
                WHERE w.master_id IS NOT NULL
                GROUP BY w.year
                ORDER BY w.year ASC`, (err, yearStats) => {
          if (err) {
            return res.status(500).json({ error: '年份统计失败' });
          }

          mergeDistribution()
            .then((distributionData) => {
              res.json({
                regionDistribution: regionStats.map(item => ({
                  region: item.region,
                  count: item.count
                })),
                mapDistribution: distributionData.mapData.filter((item) => item.value > 0),
                provinceDistribution: distributionData.distribution.filter((item) => item.value > 0),
                distributionSummary: distributionData.summary,
                skillDistribution,
                yearTrend: yearStats.map(item => ({
                  year: item.year,
                  masterCount: item.master_count
                }))
              });
            })
            .catch(() => {
              const provinceMap = {};
              regionStats.forEach((item) => {
                const province = toProvinceName(item.region) || item.region;
                provinceMap[province] = (provinceMap[province] || 0) + item.count;
              });

              res.json({
                regionDistribution: regionStats.map(item => ({
                  region: item.region,
                  count: item.count
                })),
                mapDistribution: Object.entries(provinceMap).map(([name, value]) => ({ name, value })),
                skillDistribution,
                yearTrend: yearStats.map(item => ({
                  year: item.year,
                  masterCount: item.master_count
                }))
              });
            });
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 传承谱系关系（用于力导向图）
router.get('/lineage', (req, res) => {
  try {
    db.all(`SELECT id, name, generation, region, skill_tags FROM masters`, (err, masters) => {
      if (err) {
        return res.status(500).json({ error: '查询失败' });
      }

      const nodes = [];
      const links = [];

      const schools = ['福州派', '扬州派', '成都派', '景德镇派', '厦门派', '重庆派'];
      schools.forEach((school, index) => {
        nodes.push({
          id: `school_${index}`,
          name: school,
          type: 'school',
          value: 1
        });
      });

      masters.forEach((master, index) => {
        nodes.push({
          id: `master_${master.id}`,
          name: master.name,
          type: 'master',
          generation: master.generation,
          region: master.region,
          value: 2
        });

        const schoolIndex = schools.findIndex(s => master.region.includes(s.replace('派', '')));
        if (schoolIndex >= 0) {
          links.push({
            source: `school_${schoolIndex}`,
            target: `master_${master.id}`,
            value: 1
          });
        }

        if (index > 0 && masters[index - 1].region === master.region) {
          links.push({
            source: `master_${masters[index - 1].id}`,
            target: `master_${master.id}`,
            value: 0.5,
            type: 'lineage'
          });
        }
      });

      res.json({ nodes, links });
    });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取单个传承人详情（放在动态路由最后）
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;

    db.get('SELECT * FROM masters WHERE id = ?', [id], (err, master) => {
      if (err) {
        return res.status(500).json({ error: '查询失败' });
      }
      if (!master) {
        return res.status(404).json({ error: '传承人不存在' });
      }
      res.json(master);
    });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 创建传承人（需要管理员权限）
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { name, generation, region, bio, avatar_url, main_heritage_id, skill_tags, representative_works } = req.body;

    if (!name || !generation || !region || !bio) {
      return res.status(400).json({ error: '必填字段不能为空' });
    }

    db.run(`INSERT INTO masters (name, generation, region, bio, avatar_url, main_heritage_id, skill_tags, representative_works) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, generation, region, bio, avatar_url || null, main_heritage_id || null, skill_tags || null, representative_works || null],
      function(err) {
        if (err) {
          return res.status(500).json({ error: '创建失败' });
        }
        res.status(201).json({ id: this.lastID, message: '创建成功' });
      });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 更新传承人（需要管理员权限）
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { name, generation, region, bio, avatar_url, main_heritage_id, skill_tags, representative_works } = req.body;

    db.run(`UPDATE masters 
            SET name = ?, generation = ?, region = ?, bio = ?, avatar_url = ?, 
                main_heritage_id = ?, skill_tags = ?, representative_works = ?
            WHERE id = ?`,
      [name, generation, region, bio, avatar_url || null, main_heritage_id || null, 
       skill_tags || null, representative_works || null, id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: '更新失败' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: '传承人不存在' });
        }
        res.json({ message: '更新成功' });
      });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 删除传承人（需要管理员权限）
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;

    db.run('DELETE FROM masters WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: '删除失败' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: '传承人不存在' });
      }
      res.json({ message: '删除成功' });
    });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;

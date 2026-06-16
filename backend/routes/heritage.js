const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// 获取所有非遗项目（支持筛选）
router.get('/', (req, res) => {
  try {
    let query = 'SELECT * FROM heritage_items WHERE 1=1';
    const params = [];

    if (req.query.category) {
      query += ' AND category = ?';
      params.push(req.query.category);
    }
    if (req.query.region) {
      query += ' AND region = ?';
      params.push(req.query.region);
    }
    if (req.query.level) {
      query += ' AND level = ?';
      params.push(req.query.level);
    }

    query += ' ORDER BY created_at DESC';

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

// 获取单个非遗项目详情
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;

    db.get('SELECT * FROM heritage_items WHERE id = ?', [id], (err, heritage) => {
      if (err) {
        return res.status(500).json({ error: '查询失败' });
      }
      if (!heritage) {
        return res.status(404).json({ error: '项目不存在' });
      }

      // 获取相关工序统计
      db.get(`SELECT 
                COUNT(*) as step_count,
                AVG(skill_level) as avg_skill_level,
                SUM(est_duration_hours) as total_duration
              FROM process_steps 
              WHERE heritage_id = ?`, [id], (err, stats) => {
        if (err) {
          return res.status(500).json({ error: '统计查询失败' });
        }

        res.json({
          ...heritage,
          stats: {
            stepCount: stats.step_count || 0,
            avgSkillLevel: stats.avg_skill_level ? parseFloat(stats.avg_skill_level.toFixed(2)) : 0,
            totalDuration: stats.total_duration || 0
          }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 创建非遗项目（需要管理员权限）
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { name, category, intro, region, level, image_url } = req.body;

    if (!name || !category || !intro || !region || !level) {
      return res.status(400).json({ error: '必填字段不能为空' });
    }

    db.run(`INSERT INTO heritage_items (name, category, intro, region, level, image_url, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      [name, category, intro, region, level, image_url || null],
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

// 更新非遗项目（需要管理员权限）
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, intro, region, level, image_url } = req.body;

    db.run(`UPDATE heritage_items 
            SET name = ?, category = ?, intro = ?, region = ?, level = ?, 
                image_url = ?, updated_at = datetime('now')
            WHERE id = ?`,
      [name, category, intro, region, level, image_url || null, id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: '更新失败' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: '项目不存在' });
        }
        res.json({ message: '更新成功' });
      });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 删除非遗项目（需要管理员权限）
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;

    db.run('DELETE FROM heritage_items WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: '删除失败' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: '项目不存在' });
      }
      res.json({ message: '删除成功' });
    });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取技艺风险指标
router.get('/risk', (req, res) => {
  try {
    // 计算各种风险指标
    db.all(`SELECT 
              COUNT(*) as total_masters,
              AVG(CASE WHEN generation LIKE '%第四代%' OR generation LIKE '%第三代%' THEN 1 ELSE 0 END) * 100 as aging_index,
              AVG(CASE WHEN generation LIKE '%第五代%' OR generation LIKE '%第六代%' THEN 1 ELSE 0 END) * 100 as apprentice_index
            FROM masters`, (err, masterStats) => {
      if (err) {
        return res.status(500).json({ error: '查询失败' });
      }

      db.all(`SELECT COUNT(DISTINCT region) as region_count, COUNT(*) as total FROM masters`, (err, regionStats) => {
        if (err) {
          return res.status(500).json({ error: '查询失败' });
        }

        db.all(`SELECT COUNT(DISTINCT skill_tags) as skill_count FROM masters`, (err, skillStats) => {
          if (err) {
            return res.status(500).json({ error: '查询失败' });
          }

          db.all(`SELECT 
                    COUNT(DISTINCT year) as year_count,
                    COUNT(*) as total_works,
                    AVG(COUNT(*)) OVER() as avg_per_year
                  FROM works
                  GROUP BY year`, (err, workStats) => {
            if (err) {
              return res.status(500).json({ error: '查询失败' });
            }

            const stats = masterStats[0];
            const region = regionStats[0];
            const skill = skillStats[0];
            
            // 计算产出稳定性（基于年份分布）
            const yearCount = workStats.length;
            const avgPerYear = workStats.reduce((sum, w) => sum + (w.total_works || 0), 0) / (yearCount || 1);
            const variance = workStats.reduce((sum, w) => {
              const diff = (w.total_works || 0) - avgPerYear;
              return sum + diff * diff;
            }, 0) / (yearCount || 1);
            const stability = Math.max(0, 100 - Math.min(100, variance * 10));

            // 计算地区集中度（地区数量越少，集中度越高）
            const regionConcentration = region.region_count > 0 
              ? Math.max(0, 100 - (region.region_count / region.total) * 100)
              : 50;

            // 计算技能多样性（技能种类越多，多样性越高）
            const skillDiversity = skill.skill_count > 0 
              ? Math.min(100, skill.skill_count * 15)
              : 30;

            res.json({
              aging_index: Math.round(stats.aging_index || 60),
              apprentice_index: Math.round(stats.apprentice_index || 40),
              region_concentration: Math.round(regionConcentration),
              skill_diversity: Math.round(skillDiversity),
              output_stability: Math.round(stability)
            });
          });
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;



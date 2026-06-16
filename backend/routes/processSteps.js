const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取所有工序（支持筛选）
router.get('/', (req, res) => {
  try {
    let query = 'SELECT * FROM process_steps WHERE 1=1';
    const params = [];

    if (req.query.heritage_id) {
      query += ' AND heritage_id = ?';
      params.push(req.query.heritage_id);
    }

    query += ' ORDER BY step_order ASC';

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

// 获取工序统计
router.get('/stats', (req, res) => {
  try {
    db.all(`SELECT 
              COUNT(*) as total_steps,
              SUM(est_duration_hours) as total_duration,
              AVG(skill_level) as avg_skill_level
            FROM process_steps`, (err, totalStats) => {
      if (err) {
        return res.status(500).json({ error: '统计查询失败' });
      }

      // 按难度等级分布
      db.all(`SELECT skill_level, COUNT(*) as count 
              FROM process_steps 
              GROUP BY skill_level 
              ORDER BY skill_level`, (err, levelDistribution) => {
        if (err) {
          return res.status(500).json({ error: '分布查询失败' });
        }

        // 累积耗时数组（用于折线图）
        db.all(`SELECT 
                  step_order,
                  step_name,
                  est_duration_hours,
                  SUM(est_duration_hours) OVER (ORDER BY step_order) as cumulative_duration
                FROM process_steps 
                ORDER BY step_order`, (err, cumulativeData) => {
          if (err) {
            return res.status(500).json({ error: '累积数据查询失败' });
          }

          res.json({
            totalSteps: totalStats[0].total_steps || 0,
            totalDuration: totalStats[0].total_duration || 0,
            avgSkillLevel: totalStats[0].avg_skill_level ? parseFloat(totalStats[0].avg_skill_level.toFixed(2)) : 0,
            levelDistribution: levelDistribution.map(item => ({
              level: item.skill_level,
              count: item.count
            })),
            cumulativeDuration: cumulativeData.map(item => ({
              stepOrder: item.step_order,
              stepName: item.step_name,
              duration: item.est_duration_hours,
              cumulative: item.cumulative_duration
            }))
          });
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 工序路径模拟
router.post('/simulate', (req, res) => {
  try {
    const { start_step_order, end_step_order, heritage_id } = req.body;

    if (!start_step_order || !end_step_order) {
      return res.status(400).json({ error: '起始和结束步骤序号不能为空' });
    }

    const start = Math.min(start_step_order, end_step_order);
    const end = Math.max(start_step_order, end_step_order);

    let query = `SELECT * FROM process_steps 
                 WHERE step_order >= ? AND step_order <= ?`;
    const params = [start, end];

    if (heritage_id) {
      query += ' AND heritage_id = ?';
      params.push(heritage_id);
    }

    query += ' ORDER BY step_order ASC';

    db.all(query, params, (err, steps) => {
      if (err) {
        return res.status(500).json({ error: '查询失败' });
      }

      const totalDuration = steps.reduce((sum, step) => sum + step.est_duration_hours, 0);
      const avgSkillLevel = steps.length > 0
        ? steps.reduce((sum, step) => sum + step.skill_level, 0) / steps.length
        : 0;
      const complexityIndex = avgSkillLevel * (totalDuration / 100);

      res.json({
        steps: steps,
        totalDuration: totalDuration,
        avgSkillLevel: parseFloat(avgSkillLevel.toFixed(2)),
        complexityIndex: parseFloat(complexityIndex.toFixed(2)),
        stepCount: steps.length
      });
    });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;



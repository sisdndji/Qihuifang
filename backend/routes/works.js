const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  syncLinanWorkImages,
  getLinanWorksGallery
} = require('../services/linanWorksCrawler');

// 李囡作品图库（含爬虫映射后的图片）
router.get('/linan/gallery', async (req, res) => {
  try {
    const gallery = await getLinanWorksGallery();
    res.json(gallery);
  } catch (error) {
    console.error('[works/linan/gallery]', error);
    res.status(500).json({ error: '获取李囡作品失败' });
  }
});

// 触发李囡作品图片爬虫（管理员）
router.post('/linan/crawl', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await syncLinanWorkImages();
    const gallery = await getLinanWorksGallery();
    res.json({ ...result, gallery });
  } catch (error) {
    console.error('[works/linan/crawl]', error);
    res.status(500).json({ error: '爬虫同步失败' });
  }
});

// 获取所有作品（支持筛选）
router.get('/', (req, res) => {
  try {
    let query = 'SELECT * FROM works WHERE 1=1';
    const params = [];

    if (req.query.master_id) {
      query += ' AND master_id = ?';
      params.push(req.query.master_id);
    }
    if (req.query.heritage_id) {
      query += ' AND heritage_id = ?';
      params.push(req.query.heritage_id);
    }
    if (req.query.region) {
      query += ' AND region = ?';
      params.push(req.query.region);
    }
    if (req.query.year) {
      query += ' AND year = ?';
      params.push(req.query.year);
    }

    query += ' ORDER BY year DESC, id DESC';

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

// 获取作品统计
router.get('/stats', (req, res) => {
  try {
    // 每年的作品数量
    db.all(`SELECT year, COUNT(*) as count 
            FROM works 
            GROUP BY year 
            ORDER BY year ASC`, (err, yearStats) => {
      if (err) {
        return res.status(500).json({ error: '年份统计失败' });
      }

      // 不同地域作品数量
      db.all(`SELECT region, COUNT(*) as count 
              FROM works 
              GROUP BY region 
              ORDER BY count DESC`, (err, regionStats) => {
        if (err) {
          return res.status(500).json({ error: '地域统计失败' });
        }

        res.json({
          yearDistribution: yearStats.map(item => ({
            year: item.year,
            count: item.count
          })),
          regionDistribution: regionStats.map(item => ({
            region: item.region,
            count: item.count
          }))
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 创建作品（需要管理员权限）
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { title, master_id, heritage_id, year, style, region, image_url, description, tags } = req.body;

    if (!title || !heritage_id || !year || !style || !region) {
      return res.status(400).json({ error: '必填字段不能为空' });
    }

    db.run(`INSERT INTO works (title, master_id, heritage_id, year, style, region, image_url, description, tags) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, master_id || null, heritage_id, year, style, region, image_url || null, description || null, tags || null],
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

// 更新作品（需要管理员权限）
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { title, master_id, heritage_id, year, style, region, image_url, description, tags } = req.body;

    db.run(`UPDATE works 
            SET title = ?, master_id = ?, heritage_id = ?, year = ?, style = ?, 
                region = ?, image_url = ?, description = ?, tags = ?
            WHERE id = ?`,
      [title, master_id || null, heritage_id, year, style, region, image_url || null, description || null, tags || null, id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: '更新失败' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: '作品不存在' });
        }
        res.json({ message: '更新成功' });
      });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 删除作品（需要管理员权限）
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;

    db.run('DELETE FROM works WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: '删除失败' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: '作品不存在' });
      }
      res.json({ message: '删除成功' });
    });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;



const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// 获取所有留言（支持筛选和分页）
router.get('/', (req, res) => {
  try {
    const { heritage_id, page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;
    
    let query = 'SELECT * FROM comments WHERE 1=1';
    const params = [];
    let countQuery = 'SELECT COUNT(*) as total FROM comments WHERE 1=1';
    const countParams = [];

    if (heritage_id) {
      query += ' AND heritage_id = ?';
      countQuery += ' AND heritage_id = ?';
      params.push(heritage_id);
      countParams.push(heritage_id);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), offset);

    db.get(countQuery, countParams, (err, countRow) => {
      if (err) {
        return res.status(500).json({ error: '查询失败' });
      }

      db.all(query, params, (err, rows) => {
        if (err) {
          return res.status(500).json({ error: '查询失败' });
        }
        res.json({
          comments: rows,
          total: countRow.total,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 创建留言
router.post('/', (req, res) => {
  try {
    const { heritage_id, nickname, content } = req.body;

    if (!heritage_id || !nickname || !content) {
      return res.status(400).json({ error: '必填字段不能为空' });
    }

    if (nickname.length > 20) {
      return res.status(400).json({ error: '昵称长度不能超过20个字符' });
    }

    if (content.length > 500) {
      return res.status(400).json({ error: '留言内容不能超过500个字符' });
    }

    db.run(`INSERT INTO comments (heritage_id, nickname, content) 
            VALUES (?, ?, ?)`,
      [heritage_id, nickname.trim(), content.trim()],
      function(err) {
        if (err) {
          return res.status(500).json({ error: '创建失败' });
        }
        res.status(201).json({ id: this.lastID, message: '留言成功' });
      });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 删除留言（需要管理员权限）
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;

    db.run('DELETE FROM comments WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: '删除失败' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: '留言不存在' });
      }
      res.json({ message: '删除成功' });
    });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;


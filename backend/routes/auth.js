const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;

const createAuthResponse = (user) => {
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      displayName: user.display_name
    }
  };
};

// 注册
router.post('/register', async (req, res) => {
  try {
    const { username, password, displayName } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    if (!USERNAME_PATTERN.test(username)) {
      return res.status(400).json({ error: '用户名须为 3-20 位字母、数字或下划线' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: '密码长度不能少于 6 位' });
    }

    const name = (displayName || username).trim();
    if (!name) {
      return res.status(400).json({ error: '显示名称不能为空' });
    }

    db.get('SELECT id FROM users WHERE username = ?', [username], async (err, existing) => {
      if (err) {
        return res.status(500).json({ error: '数据库查询失败' });
      }

      if (existing) {
        return res.status(409).json({ error: '用户名已被占用' });
      }

      try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.run(
          'INSERT INTO users (username, password, role, display_name) VALUES (?, ?, ?, ?)',
          [username, hashedPassword, 'viewer', name],
          function (insertErr) {
            if (insertErr) {
              if (insertErr.message.includes('UNIQUE')) {
                return res.status(409).json({ error: '用户名已被占用' });
              }
              return res.status(500).json({ error: '注册失败' });
            }

            res.status(201).json(createAuthResponse({
              id: this.lastID,
              username,
              role: 'viewer',
              display_name: name
            }));
          }
        );
      } catch {
        res.status(500).json({ error: '注册失败' });
      }
    });
  } catch {
    res.status(500).json({ error: '注册失败' });
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: '数据库查询失败' });
      }

      if (!user) {
        return res.status(401).json({ error: '用户名或密码错误' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: '用户名或密码错误' });
      }

      res.json(createAuthResponse(user));
    });
  } catch (error) {
    res.status(500).json({ error: '登录失败' });
  }
});

module.exports = router;



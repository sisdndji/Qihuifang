const express = require('express');
const router = express.Router();
const db = require('../db');
const config = require('../config/config');

const { userBase, pageViewBase } = config.platformStats;

function formatPageViews(count) {
  if (count >= 10000) {
    const wan = count / 10000;
    return Number.isInteger(wan) ? `${wan}万` : `${parseFloat(wan.toFixed(1))}万`;
  }
  return count.toLocaleString('zh-CN');
}

function buildStats(userCount, pageViews, breakdown = {}) {
  return {
    userCount,
    pageViews,
    userCountDisplay: userCount.toLocaleString('zh-CN'),
    pageViewsDisplay: formatPageViews(pageViews),
    breakdown
  };
}

function getPlatformStats(callback) {
  db.get("SELECT COUNT(*) AS userCount FROM users WHERE role != 'admin'", (userErr, userRow) => {
    if (userErr) {
      return callback(userErr);
    }

    db.get('SELECT page_views, updated_at FROM platform_stats WHERE id = 1', (viewErr, viewRow) => {
      if (viewErr) {
        return callback(viewErr);
      }

      const registeredUsers = userRow?.userCount || 0;
      const trackedPageViews = viewRow?.page_views || 0;
      const totalUsers = userBase + registeredUsers;
      const totalPageViews = pageViewBase + trackedPageViews;

      callback(null, buildStats(totalUsers, totalPageViews, {
        userBase,
        registeredUsers,
        pageViewBase,
        trackedPageViews,
        lastUpdated: viewRow?.updated_at || null
      }));
    });
  });
}

// 获取平台统计数据
router.get('/stats', (req, res) => {
  getPlatformStats((err, stats) => {
    if (err) {
      return res.status(500).json({ error: '获取平台统计失败' });
    }
    res.json(stats);
  });
});

// 记录一次页面访问并返回最新统计
router.post('/visit', (req, res) => {
  db.run(
    `UPDATE platform_stats
     SET page_views = page_views + 1, updated_at = CURRENT_TIMESTAMP
     WHERE id = 1`,
    (err) => {
      if (err) {
        return res.status(500).json({ error: '记录访问量失败' });
      }

      getPlatformStats((statsErr, stats) => {
        if (statsErr) {
          return res.status(500).json({ error: '获取平台统计失败' });
        }
        res.json(stats);
      });
    }
  );
});

module.exports = router;

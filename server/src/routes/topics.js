const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { collect } = require('../services/collector');

// GET /api/topics - 获取热点列表
router.get('/', async (req, res) => {
  try {
    const {
      source,
      tag,
      page = '1',
      limit = '20',
      sort = 'collected_at',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;

    // 验证 sort 字段白名单
    const allowedSort = ['collected_at', 'heat_score', 'published_at'];
    const sortField = allowedSort.includes(sort) ? sort : 'collected_at';

    let sql = 'SELECT * FROM topics WHERE 1=1';
    const args = [];

    if (source && ['twitter', 'hackernews', 'rss', 'github'].includes(source)) {
      sql += ' AND source = ?';
      args.push(source);
    }

    if (tag && typeof tag === 'string') {
      sql += " AND tags LIKE ?";
      args.push(`%${tag.replace(/[%_]/g, '\\$&')}%`);
    }

    // 总数
    const countRes = await db.execute({ sql: `SELECT COUNT(*) as total FROM (${sql})`, args });
    const total = Number(countRes.rows[0]?.total || 0);

    sql += ` ORDER BY ${sortField} DESC LIMIT ? OFFSET ?`;
    args.push(limitNum, offset);

    const result = await db.execute({ sql, args });

    res.json({
      data: result.rows.map(row => ({
        ...row,
        tags: parseJsonSafe(row.tags, []),
      })),
      pagination: { page: pageNum, limit: limitNum, total },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/topics/stats - 统计数据
router.get('/stats', async (req, res) => {
  try {
    const [totalRes, todayRes, kwRes, notifyRes] = await Promise.all([
      db.execute('SELECT COUNT(*) as count FROM topics'),
      db.execute("SELECT COUNT(*) as count FROM topics WHERE date(collected_at) = date('now')"),
      db.execute('SELECT COUNT(*) as count FROM keywords WHERE is_active = 1'),
      db.execute("SELECT COUNT(*) as count FROM notifications WHERE date(sent_at) = date('now')"),
    ]);

    res.json({
      data: {
        total_topics: Number(totalRes.rows[0]?.count || 0),
        today_topics: Number(todayRes.rows[0]?.count || 0),
        active_keywords: Number(kwRes.rows[0]?.count || 0),
        today_notifications: Number(notifyRes.rows[0]?.count || 0),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/topics/collect - 手动触发采集
router.post('/collect', async (req, res) => {
  try {
    // 异步执行，立即返回
    collect().catch(err => console.error('[Route] collect error:', err));
    res.json({ message: '采集任务已触发' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function parseJsonSafe(str, fallback) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

module.exports = router;

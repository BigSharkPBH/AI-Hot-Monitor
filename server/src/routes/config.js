const express = require('express');
const router = express.Router();
const { db } = require('../db');

const ALLOWED_KEYS = ['collect_interval_minutes', 'topics_domain', 'max_topics_per_collect'];

// GET /api/config - 获取所有配置
router.get('/', async (req, res) => {
  try {
    const result = await db.execute('SELECT key, value FROM config');
    const config = {};
    for (const row of result.rows) {
      config[row.key] = row.value;
    }
    res.json({ data: config });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/config - 更新配置
router.put('/', async (req, res) => {
  try {
    const updates = req.body;
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ error: '无效的配置格式' });
    }

    for (const [key, value] of Object.entries(updates)) {
      if (!ALLOWED_KEYS.includes(key)) continue;
      await db.execute({
        sql: 'INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)',
        args: [key, String(value)],
      });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

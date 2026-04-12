const express = require('express');
const router = express.Router();
const { db } = require('../db');

// POST /api/push/subscribe - 注册浏览器 Push 订阅
router.post('/subscribe', async (req, res) => {
  try {
    const sub = req.body;
    if (!sub || !sub.endpoint) {
      return res.status(400).json({ error: '无效的订阅对象' });
    }

    await db.execute({
      sql: `INSERT OR REPLACE INTO push_subscriptions (endpoint, subscription)
            VALUES (?, ?)`,
      args: [sub.endpoint, JSON.stringify(sub)],
    });

    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/push/unsubscribe - 取消订阅
router.delete('/unsubscribe', async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) return res.status(400).json({ error: '缺少 endpoint' });

    await db.execute({
      sql: 'DELETE FROM push_subscriptions WHERE endpoint = ?',
      args: [endpoint],
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/push/vapid-public-key - 返回 VAPID 公钥供前端使用
router.get('/vapid-public-key', (req, res) => {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) {
    return res.status(503).json({ error: 'VAPID 未配置' });
  }
  res.json({ publicKey: key });
});

module.exports = router;

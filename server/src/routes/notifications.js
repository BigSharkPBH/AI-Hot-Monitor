const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/notifications - 获取通知列表
router.get('/', async (req, res) => {
  try {
    const { page = '1', limit = '30', unread } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 30));
    const offset = (pageNum - 1) * limitNum;

    let sql = `
      SELECT n.*, k.word as keyword_word, t.title as topic_title, t.url as topic_url
      FROM notifications n
      LEFT JOIN keywords k ON n.keyword_id = k.id
      LEFT JOIN topics t ON n.topic_id = t.id
      WHERE 1=1
    `;
    const args = [];

    if (unread === '1') {
      sql += ' AND n.is_read = 0';
    }

    const countRes = await db.execute({ sql: `SELECT COUNT(*) as total FROM (${sql})`, args: [...args] });
    const total = Number(countRes.rows[0]?.total || 0);

    sql += ' ORDER BY n.sent_at DESC LIMIT ? OFFSET ?';
    args.push(limitNum, offset);

    const result = await db.execute({ sql, args });
    res.json({
      data: result.rows,
      pagination: { page: pageNum, limit: limitNum, total },
      unread_count: total,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/notifications/:id - 标记已读
router.patch('/:id', async (req, res) => {
  const id = req.params.id === 'all' ? 'all' : parseInt(req.params.id);

  try {
    if (id === 'all') {
      await db.execute('UPDATE notifications SET is_read = 1');
    } else {
      if (!Number.isInteger(id)) return res.status(400).json({ error: '无效 ID' });
      await db.execute({ sql: 'UPDATE notifications SET is_read = 1 WHERE id = ?', args: [id] });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notifications/unread-count
router.get('/unread-count', async (req, res) => {
  try {
    const result = await db.execute('SELECT COUNT(*) as count FROM notifications WHERE is_read = 0');
    res.json({ count: Number(result.rows[0]?.count || 0) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

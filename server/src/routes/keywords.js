const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/keywords - 获取所有关键词
router.get('/', async (req, res) => {
  try {
    const result = await db.execute(
      'SELECT * FROM keywords ORDER BY created_at DESC'
    );
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/keywords - 添加关键词
router.post('/', async (req, res) => {
  const { word } = req.body;
  if (!word || typeof word !== 'string' || word.trim().length === 0) {
    return res.status(400).json({ error: '关键词不能为空' });
  }
  const trimmed = word.trim().substring(0, 100);
  try {
    const result = await db.execute({
      sql: 'INSERT INTO keywords (word) VALUES (?)',
      args: [trimmed],
    });
    const newRow = await db.execute({
      sql: 'SELECT * FROM keywords WHERE id = ?',
      args: [result.lastInsertRowid],
    });
    res.status(201).json({ data: newRow.rows[0] });
  } catch (err) {
    if (err.message?.includes('UNIQUE')) {
      return res.status(409).json({ error: '关键词已存在' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/keywords/:id - 切换启用状态
router.patch('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: '无效 ID' });

  try {
    await db.execute({
      sql: 'UPDATE keywords SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = ?',
      args: [id],
    });
    const updated = await db.execute({
      sql: 'SELECT * FROM keywords WHERE id = ?',
      args: [id],
    });
    if (updated.rows.length === 0) return res.status(404).json({ error: '未找到' });
    res.json({ data: updated.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/keywords/:id - 删除关键词
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: '无效 ID' });

  try {
    await db.execute({ sql: 'DELETE FROM keywords WHERE id = ?', args: [id] });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

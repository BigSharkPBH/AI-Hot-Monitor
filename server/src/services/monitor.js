/**
 * 关键词监控服务
 * 每次采集后，检查新入库的热点是否命中用户关键词
 * 命中则写通知记录 + 触发推送
 */

const { db } = require('../db');
const { analyzeContent } = require('../lib/openrouter');
const { notify } = require('../lib/notifier');

/**
 * 扫描最新热点，检查关键词命中
 * @param {number} sinceMinutes - 检查最近 N 分钟内入库的内容
 */
async function monitorKeywords(sinceMinutes = 35) {
  // 获取所有启用的关键词
  const kwRes = await db.execute("SELECT * FROM keywords WHERE is_active = 1");
  const keywords = kwRes.rows;

  if (keywords.length === 0) return;

  // 获取最近入库的热点
  const since = new Date(Date.now() - sinceMinutes * 60 * 1000).toISOString();
  const topicsRes = await db.execute({
    sql: "SELECT * FROM topics WHERE collected_at > ? ORDER BY collected_at DESC LIMIT 100",
    args: [since],
  });
  const topics = topicsRes.rows;

  if (topics.length === 0) return;

  // 获取 Push 订阅列表
  const subsRes = await db.execute("SELECT * FROM push_subscriptions");
  const subscriptions = subsRes.rows;

  for (const topic of topics) {
    for (const kw of keywords) {
      // 文本匹配（大小写不敏感）
      const searchText = `${topic.title} ${topic.content} ${topic.summary}`.toLowerCase();
      const word = kw.word.toLowerCase();

      if (!searchText.includes(word)) continue;

      // 检查是否已经通知过（避免重复通知）
      const existsRes = await db.execute({
        sql: "SELECT id FROM notifications WHERE keyword_id = ? AND topic_id = ?",
        args: [kw.id, topic.id],
      });
      if (existsRes.rows.length > 0) continue;

      // AI 核验：确认命中是否真实
      const verification = await analyzeContent(
        topic.title,
        topic.content,
        [kw.word]
      );

      if (!verification.is_relevant || verification.matched_keywords.length === 0) {
        continue;
      }

      // 写入通知记录
      const message = `关键词「${kw.word}」命中：${topic.summary || topic.title}`;
      await db.execute({
        sql: "INSERT INTO notifications (keyword_id, topic_id, message) VALUES (?, ?, ?)",
        args: [kw.id, topic.id, message],
      });

      // 更新关键词命中次数
      await db.execute({
        sql: "UPDATE keywords SET hit_count = hit_count + 1 WHERE id = ?",
        args: [kw.id],
      });

      // 发送推送通知
      await notify(
        `🔥 关键词命中：${kw.word}`,
        topic.summary || topic.title,
        topic.url,
        subscriptions
      );

      console.log(`[Monitor] 关键词「${kw.word}」命中：${topic.title}`);
    }
  }
}

module.exports = { monitorKeywords };

/**
 * 数据源：Hacker News
 * 使用官方 Firebase REST API（免费，无需 Key）
 * https://hacker-news.firebaseio.com/v0/
 */

const HN_BASE = 'https://hacker-news.firebaseio.com/v0';

async function fetchHackerNews(limit = 20) {
  try {
    // 同时抓取最热和最新，去重后合并，确保捕获高热度内容
    const [topRes, newRes] = await Promise.all([
      fetch(`${HN_BASE}/topstories.json`),
      fetch(`${HN_BASE}/newstories.json`),
    ]);

    if (!topRes.ok && !newRes.ok) throw new Error('HN API both failed');

    const topIds = topRes.ok ? (await topRes.json()).slice(0, limit) : [];
    const newIds = newRes.ok ? (await newRes.json()).slice(0, Math.floor(limit / 2)) : [];

    // 合并去重，topstories 优先
    const seenIds = new Set();
    const mergedIds = [];
    for (const id of [...topIds, ...newIds]) {
      if (!seenIds.has(id)) {
        seenIds.add(id);
        mergedIds.push(id);
      }
    }
    const finalIds = mergedIds.slice(0, limit);

    // 并发获取每篇文章详情
    const items = await Promise.allSettled(
      finalIds.map(id =>
        fetch(`${HN_BASE}/item/${id}.json`).then(r => r.json())
      )
    );

    const results = [];
    for (const item of items) {
      if (item.status === 'fulfilled' && item.value && item.value.title) {
        const v = item.value;
        results.push({
          source: 'hackernews',
          source_id: String(v.id),
          title: v.title,
          content: v.text || '',
          url: v.url || `https://news.ycombinator.com/item?id=${v.id}`,
          author: v.by || '',
          published_at: v.time ? new Date(v.time * 1000).toISOString() : null,
        });
      }
    }

    return results;
  } catch (err) {
    console.error('[HackerNews] fetch error:', err.message);
    return [];
  }
}

module.exports = { fetchHackerNews };

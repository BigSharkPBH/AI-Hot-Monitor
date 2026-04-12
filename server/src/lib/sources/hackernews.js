/**
 * 数据源：Hacker News
 * 使用官方 Firebase REST API（免费，无需 Key）
 * https://hacker-news.firebaseio.com/v0/
 */

const HN_BASE = 'https://hacker-news.firebaseio.com/v0';

async function fetchHackerNews(limit = 20) {
  try {
    // 获取最新故事 ID 列表
    const res = await fetch(`${HN_BASE}/newstories.json`);
    if (!res.ok) throw new Error(`HN API status: ${res.status}`);

    const ids = await res.json();
    const topIds = ids.slice(0, limit);

    // 并发获取每篇文章详情
    const items = await Promise.allSettled(
      topIds.map(id =>
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

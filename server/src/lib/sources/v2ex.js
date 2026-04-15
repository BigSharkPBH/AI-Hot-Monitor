/**
 * 数据源：V2EX
 * 中文开发者社区，使用官方公共 API，免费无需 Key
 * https://www.v2ex.com/api/
 */

async function fetchV2EX(limit = 20) {
  try {
    const res = await fetch('https://www.v2ex.com/api/topics/hot.json', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HotMonitor/1.0)',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) throw new Error(`V2EX API HTTP ${res.status}`);

    const topics = await res.json();
    console.log(`[V2EX] 获取 ${topics.length} 条热门话题`);

    return topics.slice(0, limit).map(t => ({
      source: 'v2ex',
      source_id: String(t.id),
      title: t.title || '',
      content: (t.content || t.content_rendered || '')
        .replace(/<[^>]+>/g, '')
        .substring(0, 1000),
      url: t.url || `https://www.v2ex.com/t/${t.id}`,
      author: t.member?.username || '',
      published_at: t.created
        ? new Date(t.created * 1000).toISOString()
        : new Date().toISOString(),
    }));
  } catch (err) {
    console.error('[V2EX] fetch error:', err.message);
    return [];
  }
}

module.exports = { fetchV2EX };

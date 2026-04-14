/**
 * 数据源：SearXNG 元搜索引擎
 * 聚合 Google/Bing/DuckDuckGo 等多个搜索引擎结果
 * 使用公共实例 REST API，免费无需 Key
 */

// 多个公共实例，失败时自动 fallback
const SEARXNG_INSTANCES = [
  'https://search.sapti.me',
  'https://searx.tiekoetter.com',
  'https://search.bus-hit.me',
];

/**
 * 通过 SearXNG 搜索 AI/编程相关新闻
 * @param {string} query - 搜索关键词
 * @param {number} limit - 最多返回数量
 * @returns {Array}
 */
async function fetchSearXNG(query, limit = 15) {
  for (const instance of SEARXNG_INSTANCES) {
    try {
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        categories: 'news,it',
        language: 'auto',
        time_range: 'day',
        safesearch: '0',
      });

      const res = await fetch(`${instance}/search?${params}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; HotMonitor/1.0)',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        console.warn(`[SearXNG] ${instance} HTTP ${res.status}, trying next...`);
        continue;
      }

      const data = await res.json();
      const results = data.results || [];

      console.log(`[SearXNG] ${instance} returned ${results.length} results`);

      return results.slice(0, limit).map((r, i) => ({
        source: 'searxng',
        source_id: r.url || `searxng-${Date.now()}-${i}`,
        title: r.title || '',
        content: (r.content || r.description || '').substring(0, 1000),
        url: r.url || '',
        author: r.engine || r.source || 'SearXNG',
        published_at: r.publishedDate
          ? new Date(r.publishedDate).toISOString()
          : new Date().toISOString(),
      }));
    } catch (err) {
      console.warn(`[SearXNG] ${instance} error: ${err.message}, trying next...`);
      continue;
    }
  }

  console.error('[SearXNG] All instances failed');
  return [];
}

module.exports = { fetchSearXNG };

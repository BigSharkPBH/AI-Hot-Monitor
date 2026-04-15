/**
 * 数据源：微博（Weibo）
 * 使用微博公开 Web/移动端 API 获取热搜和实时内容
 * 免费无需 Key
 */

const UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

/**
 * 获取微博热搜 + 关键词相关内容
 * @param {string} query - 搜索关键词
 * @param {number} limit - 最多返回数量
 * @returns {Array}
 */
async function fetchWeibo(query, limit = 15) {
  try {
    const [hotResults, searchResults] = await Promise.all([
      fetchWeiboHotSearch(Math.floor(limit / 2)),
      searchWeibo(query, Math.ceil(limit / 2)),
    ]);

    // 合并去重
    const seen = new Set();
    const merged = [];
    for (const item of [...searchResults, ...hotResults]) {
      if (!seen.has(item.source_id)) {
        seen.add(item.source_id);
        merged.push(item);
      }
    }

    return merged.slice(0, limit);
  } catch (err) {
    console.error('[Weibo] error:', err.message);
    return [];
  }
}

/**
 * 微博热搜榜
 */
async function fetchWeiboHotSearch(limit) {
  try {
    const res = await fetch('https://weibo.com/ajax/side/hotSearch', {
      headers: {
        'User-Agent': UA,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.warn(`[Weibo] hotSearch HTTP ${res.status}`);
      return [];
    }

    const data = await res.json();
    const items = data?.data?.realtime || [];

    console.log(`[Weibo] 热搜获取 ${items.length} 条`);

    return items.slice(0, limit).map((item, i) => ({
      source: 'weibo',
      source_id: `weibo-hot-${item.mid || item.word || i}-${new Date().toISOString().slice(0, 10)}`,
      title: `[微博热搜] ${item.word || ''}`,
      content: item.word || '',
      url: `https://s.weibo.com/weibo?q=${encodeURIComponent(item.word || '')}`,
      author: '微博热搜',
      published_at: new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('[Weibo] hotSearch error:', err.message);
    return [];
  }
}

/**
 * 微博关键词搜索（移动端 API）
 */
async function searchWeibo(query, limit) {
  try {
    const params = new URLSearchParams({
      containerid: `100103type=1&q=${query}`,
      page_type: 'searchall',
    });

    const res = await fetch(
      `https://m.weibo.cn/api/container/getIndex?${params}`,
      {
        headers: {
          'User-Agent': UA,
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!res.ok) {
      console.warn(`[Weibo] search HTTP ${res.status}`);
      return [];
    }

    const data = await res.json();
    const cards = data?.data?.cards || [];

    const results = [];
    for (const card of cards) {
      // card_type 9 是微博内容卡片
      if (card.card_type === 9 && card.mblog) {
        const mb = card.mblog;
        const text = (mb.text || '').replace(/<[^>]+>/g, '').trim();
        if (!text) continue;

        results.push({
          source: 'weibo',
          source_id: mb.id || mb.mid,
          title: text.substring(0, 200),
          content: text.substring(0, 1000),
          url: mb.id ? `https://m.weibo.cn/detail/${mb.id}` : '',
          author: mb.user?.screen_name || '',
          published_at: mb.created_at
            ? parseWeiboDate(mb.created_at)
            : new Date().toISOString(),
        });
      }
    }

    console.log(`[Weibo] 搜索 "${query}" 获取 ${results.length} 条`);
    return results.slice(0, limit);
  } catch (err) {
    console.warn('[Weibo] search error:', err.message);
    return [];
  }
}

/**
 * 解析微博日期格式（如 "2小时前"、"今天 15:30"、"04-10"）
 */
function parseWeiboDate(dateStr) {
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d.toISOString();

    const minMatch = dateStr.match(/(\d+)\s*分钟前/);
    if (minMatch)
      return new Date(Date.now() - parseInt(minMatch[1]) * 60000).toISOString();

    const hourMatch = dateStr.match(/(\d+)\s*小时前/);
    if (hourMatch)
      return new Date(
        Date.now() - parseInt(hourMatch[1]) * 3600000
      ).toISOString();

    return new Date().toISOString();
  } catch {
    return new Date().toISOString();
  }
}

module.exports = { fetchWeibo };

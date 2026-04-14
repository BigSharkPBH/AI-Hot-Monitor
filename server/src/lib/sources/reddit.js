/**
 * 数据源：Reddit
 * 使用 Reddit 公共 JSON API，免费无需 Key
 * 搜索 AI/编程相关的热门 subreddit
 */

const SUBREDDITS = [
  'artificial',
  'MachineLearning',
  'programming',
  'LocalLLaMA',
  'ChatGPT',
];

const REDDIT_USER_AGENT = 'Mozilla/5.0 (compatible; HotMonitor/1.0)';

/**
 * 从 Reddit 获取热门帖子
 * @param {string} query - 搜索关键词
 * @param {number} limit - 最多返回数量
 * @returns {Array}
 */
async function fetchReddit(query, limit = 15) {
  try {
    // 策略：搜索 + subreddit 热帖并行，取并集
    const [searchResults, subResults] = await Promise.all([
      searchReddit(query, limit),
      fetchSubredditsHot(Math.floor(limit / 2)),
    ]);

    // 合并去重（按 URL）
    const seen = new Set();
    const merged = [];
    for (const item of [...searchResults, ...subResults]) {
      if (!seen.has(item.url)) {
        seen.add(item.url);
        merged.push(item);
      }
    }

    return merged.slice(0, limit);
  } catch (err) {
    console.error('[Reddit] error:', err.message);
    return [];
  }
}

/**
 * Reddit 搜索
 */
async function searchReddit(query, limit) {
  try {
    const params = new URLSearchParams({
      q: query,
      sort: 'relevance',
      t: 'day',
      limit: String(limit),
      type: 'link',
    });

    const res = await fetch(`https://www.reddit.com/search.json?${params}`, {
      headers: { 'User-Agent': REDDIT_USER_AGENT },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.warn(`[Reddit] search HTTP ${res.status}`);
      return [];
    }

    const data = await res.json();
    const posts = data?.data?.children || [];

    return posts
      .filter(p => p.data && p.data.score >= 10) // 过滤低分帖子
      .map(p => mapRedditPost(p.data));
  } catch (err) {
    console.warn('[Reddit] search error:', err.message);
    return [];
  }
}

/**
 * 从多个 subreddit 获取热帖
 */
async function fetchSubredditsHot(limitPerSub = 5) {
  const allItems = [];

  await Promise.allSettled(
    SUBREDDITS.map(async sub => {
      try {
        const res = await fetch(
          `https://www.reddit.com/r/${sub}/hot.json?limit=${limitPerSub}&t=day`,
          {
            headers: { 'User-Agent': REDDIT_USER_AGENT },
            signal: AbortSignal.timeout(10000),
          }
        );

        if (!res.ok) return;

        const data = await res.json();
        const posts = data?.data?.children || [];

        for (const p of posts) {
          if (p.data && !p.data.stickied && p.data.score >= 10) {
            allItems.push(mapRedditPost(p.data));
          }
        }
      } catch (err) {
        console.warn(`[Reddit] r/${sub} error:`, err.message);
      }
    })
  );

  return allItems;
}

/**
 * 将 Reddit 帖子映射为统一格式
 */
function mapRedditPost(post) {
  return {
    source: 'reddit',
    source_id: post.id || post.name,
    title: post.title || '',
    content: (post.selftext || '').substring(0, 1000),
    url: post.url && !post.url.startsWith('/r/')
      ? post.url
      : `https://www.reddit.com${post.permalink}`,
    author: post.author || '',
    published_at: post.created_utc
      ? new Date(post.created_utc * 1000).toISOString()
      : new Date().toISOString(),
  };
}

module.exports = { fetchReddit };

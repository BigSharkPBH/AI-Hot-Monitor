/**
 * 数据源：Twitter/X
 * 使用 twitterapi.io REST API
 * 认证方式（来自官方文档）：Header x-api-key: YOUR_KEY
 * 端点：GET https://api.twitterapi.io/twitter/tweet/advanced_search
 */

const TWITTER_API_BASE = 'https://api.twitterapi.io';

// 质量过滤阈值：只保留有足够互动的原创推文
const MIN_LIKES = 50;
const MIN_RETWEETS = 20;
const MIN_VIEWS = 2000;

/**
 * 搜索推文
 * @param {string} query    - 搜索关键词
 * @param {number} maxItems - 最多返回数量
 * @returns {Array}
 */
async function searchTweets(query, maxItems = 20, { relaxedFilters = false } = {}) {
  const apiKey = process.env.TWITTER_API_KEY;
  if (!apiKey || apiKey === 'your_twitterapi_io_key_here') {
    console.warn('[Twitter] API Key 未配置，跳过 Twitter 数据源');
    return [];
  }

  try {
    // 使用 Top 排序获取更高质量的推文，加 -filter:replies 过滤回复
    const params = new URLSearchParams({
      query: `${query} -filter:replies -filter:quote`,
      queryType: 'Top',
    });

    const res = await fetch(
      `${TWITTER_API_BASE}/twitter/tweet/advanced_search?${params}`,
      {
        headers: {
          'x-api-key': apiKey,
        },
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error('[Twitter] API error:', res.status, errText);
      return [];
    }

    const data = await res.json();

    // twitterapi.io 返回格式：{ tweets: [...] }
    const tweets = data.tweets || data.data?.tweets || [];

    // 质量过滤：只保留原创推文，且互动量达标
    // relaxedFilters=true 用于博主追踪模式，仅过滤回复不检查互动量
    const filtered = tweets.filter(t => {
      // 过滤回复和引用
      if (t.isReply === true) return false;
      if (t.inReplyToId) return false;

      // 博主追踪模式跳过互动量检查
      if (relaxedFilters) return true;

      // 互动量门槛
      const likes = Number(t.likeCount) || 0;
      const retweets = Number(t.retweetCount) || 0;
      const views = Number(t.viewCount) || 0;

      if (likes < MIN_LIKES) return false;
      if (retweets < MIN_RETWEETS) return false;
      if (views < MIN_VIEWS) return false;

      return true;
    });

    console.log(`[Twitter] 原始 ${tweets.length} 条，质量过滤后 ${filtered.length} 条`);

    return filtered.slice(0, maxItems).map(t => ({
      source: 'twitter',
      source_id: t.id || t.tweet_id || String(t.id_str),
      title: (t.text || t.full_text || '').substring(0, 200),
      content: t.text || t.full_text || '',
      url: t.url || (t.author ? `https://x.com/${t.author.username}/status/${t.id}` : ''),
      author: t.author?.username || t.user?.screen_name || '',
      published_at: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
    }));
  } catch (err) {
    console.error('[Twitter] network error:', err.message);
    return [];
  }
}

module.exports = { searchTweets };

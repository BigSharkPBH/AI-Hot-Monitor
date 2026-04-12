/**
 * 数据源：Twitter/X
 * 使用 twitterapi.io REST API
 * 认证方式（来自官方文档）：Header x-api-key: YOUR_KEY
 * 端点：GET https://api.twitterapi.io/twitter/tweet/advanced_search
 */

const TWITTER_API_BASE = 'https://api.twitterapi.io';

/**
 * 搜索推文
 * @param {string} query    - 搜索关键词
 * @param {number} maxItems - 最多返回数量
 * @returns {Array}
 */
async function searchTweets(query, maxItems = 20) {
  const apiKey = process.env.TWITTER_API_KEY;
  if (!apiKey || apiKey === 'your_twitterapi_io_key_here') {
    console.warn('[Twitter] API Key 未配置，跳过 Twitter 数据源');
    return [];
  }

  try {
    const params = new URLSearchParams({
      query,
      queryType: 'Latest',
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

    // twitterapi.io 返回格式：{ tweets: [...] } 或 { data: { tweets: [...] } }
    const tweets = data.tweets || data.data?.tweets || [];

    return tweets.slice(0, maxItems).map(t => ({
      source: 'twitter',
      source_id: t.id || t.tweet_id || String(t.id_str),
      title: (t.text || t.full_text || '').substring(0, 200),
      content: t.text || t.full_text || '',
      url: t.url || (t.user ? `https://x.com/${t.user.screen_name}/status/${t.id_str || t.id}` : ''),
      author: t.user?.screen_name || t.author?.screen_name || '',
      published_at: t.created_at ? new Date(t.created_at).toISOString() : new Date().toISOString(),
    }));
  } catch (err) {
    console.error('[Twitter] network error:', err.message);
    return [];
  }
}

module.exports = { searchTweets };

/**
 * 采集服务：聚合所有数据源，AI 分析，存入数据库
 */

const { db } = require('../db');
const { analyzeContent } = require('../lib/openrouter');
const { fetchHackerNews } = require('../lib/sources/hackernews');
const { fetchRSS } = require('../lib/sources/rss');
const { fetchGithubTrending } = require('../lib/sources/github');
const { searchTweets } = require('../lib/sources/twitter');
const { fetchSearXNG } = require('../lib/sources/searxng');
const { fetchReddit } = require('../lib/sources/reddit');
const { fetchV2EX } = require('../lib/sources/v2ex');
const { fetchBilibili } = require('../lib/sources/bilibili');
const { fetchWeibo } = require('../lib/sources/weibo');

let isCollecting = false;

/**
 * 执行一次完整采集
 * @returns {{ inserted: number, skipped: number }}
 */
async function collect() {
  if (isCollecting) {
    console.log('[Collector] 上次采集仍在进行，跳过');
    return { inserted: 0, skipped: 0 };
  }

  isCollecting = true;
  console.log('[Collector] 开始采集...');

  try {
    // 读取用户配置的关注领域
    const domainRow = await db.execute("SELECT value FROM config WHERE key = 'topics_domain'");
    const domain = domainRow.rows[0]?.value || 'AI 编程';

    // 获取用户关键词（用于 AI 分析 + 博主追踪）
    const kwRes = await db.execute("SELECT word FROM keywords WHERE is_active = 1");
    const keywords = kwRes.rows.map(r => r.word);

    // 分离博主关键词（@开头的视为 Twitter 博主账号）
    const bloggerHandles = keywords.filter(kw => kw.startsWith('@'));

    // 并发拉取所有数据源
    const [hnItems, rssItems, githubItems, twitterItems, searxngItems, redditItems, v2exItems, bilibiliItems, weiboItems] = await Promise.all([
      fetchHackerNews(20),
      fetchRSS(8),
      fetchGithubTrending('', 'daily', 15),
      searchTweets(`${domain} lang:zh OR lang:en`, 20),
      fetchSearXNG(`${domain} latest news`, 15),
      fetchReddit(domain, 15),
      fetchV2EX(20),
      fetchBilibili(domain, 15),
      fetchWeibo(domain, 15),
    ]);

    // 博主追踪：通过 from:username 获取指定博主最近推文（放宽质量过滤）
    let bloggerItems = [];
    if (bloggerHandles.length > 0) {
      const bloggerResults = await Promise.allSettled(
        bloggerHandles.map(kw => {
          const username = kw.slice(1); // 去掉 @
          return searchTweets(`from:${username}`, 10, { relaxedFilters: true });
        })
      );
      bloggerItems = bloggerResults
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => r.value);
      console.log(`[Collector] 博主追踪 ${bloggerHandles.length} 个账号，获取 ${bloggerItems.length} 条`);
    }

    const allItems = [
      ...hnItems, ...rssItems, ...githubItems, ...twitterItems,
      ...searxngItems, ...redditItems, ...v2exItems, ...bilibiliItems,
      ...weiboItems, ...bloggerItems,
    ];
    console.log(`[Collector] 采集到 ${allItems.length} 条原始数据 (HN:${hnItems.length} RSS:${rssItems.length} GitHub:${githubItems.length} Twitter:${twitterItems.length} SearXNG:${searxngItems.length} Reddit:${redditItems.length} V2EX:${v2exItems.length} Bilibili:${bilibiliItems.length} Weibo:${weiboItems.length} 博主:${bloggerItems.length})`);

    let inserted = 0;
    let skipped = 0;

    // 逐条 AI 分析并入库（分批避免并发过多）
    const BATCH_SIZE = 5;
    for (let i = 0; i < allItems.length; i += BATCH_SIZE) {
      const batch = allItems.slice(i, i + BATCH_SIZE);

      await Promise.allSettled(
        batch.map(async item => {
          try {
            // AI 分析
            const analysis = await analyzeContent(item.title, item.content, keywords);

            if (!analysis.is_relevant) {
              skipped++;
              return;
            }

            // 入库（source + source_id 唯一约束，重复自动跳过）
            await db.execute({
              sql: `INSERT OR IGNORE INTO topics
                      (source, source_id, title, content, url, author,
                       heat_score, summary, tags, published_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [
                item.source,
                item.source_id || null,
                item.title,
                item.content || '',
                item.url || '',
                item.author || '',
                analysis.heat_score,
                analysis.summary,
                JSON.stringify(analysis.tags),
                item.published_at || new Date().toISOString(),
              ],
            });

            inserted++;
          } catch (err) {
            console.error('[Collector] 入库失败:', err.message, item.title);
          }
        })
      );
    }

    console.log(`[Collector] 完成：新增 ${inserted} 条，过滤 ${skipped} 条`);
    return { inserted, skipped };
  } finally {
    isCollecting = false;
  }
}

module.exports = { collect };

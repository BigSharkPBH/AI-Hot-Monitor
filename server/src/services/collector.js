/**
 * 采集服务：聚合所有数据源，AI 分析，存入数据库
 */

const { db } = require('../db');
const { analyzeContent } = require('../lib/openrouter');
const { fetchHackerNews } = require('../lib/sources/hackernews');
const { fetchRSS } = require('../lib/sources/rss');
const { fetchGithubTrending } = require('../lib/sources/github');
const { searchTweets } = require('../lib/sources/twitter');

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

    // 并发拉取所有数据源
    const [hnItems, rssItems, githubItems, twitterItems] = await Promise.all([
      fetchHackerNews(20),
      fetchRSS(8),
      fetchGithubTrending('', 'daily', 15),
      searchTweets(`${domain} lang:zh OR lang:en`, 20),
    ]);

    const allItems = [...hnItems, ...rssItems, ...githubItems, ...twitterItems];
    console.log(`[Collector] 采集到 ${allItems.length} 条原始数据`);

    // 获取用户关键词（用于 AI 分析）
    const kwRes = await db.execute("SELECT word FROM keywords WHERE is_active = 1");
    const keywords = kwRes.rows.map(r => r.word);

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

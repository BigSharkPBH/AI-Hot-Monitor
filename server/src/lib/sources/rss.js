/**
 * 数据源：RSS 聚合
 * 使用 rss-parser 库解析 XML RSS
 * 数据源：TechCrunch AI、The Verge、MIT Tech Review
 */

const Parser = require('rss-parser');
const parser = new Parser({ timeout: 10000 });

const RSS_FEEDS = [
  {
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
  },
  {
    name: 'The Verge AI',
    url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml',
  },
  {
    name: 'MIT Tech Review',
    url: 'https://www.technologyreview.com/feed/',
  },
  {
    name: 'ArXiv CS.AI',
    url: 'https://rss.arxiv.org/rss/cs.AI',
  },
  // 中文科技源
  {
    name: '36氪',
    url: 'https://36kr.com/feed',
  },
  {
    name: '少数派',
    url: 'https://sspai.com/feed',
  },
  {
    name: '开源中国',
    url: 'https://www.oschina.net/news/rss',
  },
];

async function fetchRSS(limit = 10) {
  const allItems = [];

  await Promise.allSettled(
    RSS_FEEDS.map(async feed => {
      try {
        const parsed = await parser.parseURL(feed.url);
        const items = (parsed.items || []).slice(0, limit);
        for (const item of items) {
          allItems.push({
            source: 'rss',
            source_id: item.guid || item.link || item.title,
            title: item.title || '',
            content: (item.contentSnippet || item.content || '').substring(0, 1000),
            url: item.link || '',
            author: item.creator || item.author || feed.name,
            published_at: item.isoDate || item.pubDate
              ? new Date(item.isoDate || item.pubDate).toISOString()
              : null,
          });
        }
      } catch (err) {
        console.warn(`[RSS] ${feed.name} error:`, err.message);
      }
    })
  );

  return allItems;
}

module.exports = { fetchRSS };

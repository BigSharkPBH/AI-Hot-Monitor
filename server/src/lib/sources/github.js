/**
 * 数据源：GitHub Trending
 * 爬取 https://github.com/trending 页面
 */

async function fetchGithubTrending(language = '', since = 'daily', limit = 15) {
  try {
    const url = `https://github.com/trending${language ? `/${language}` : ''}?since=${since}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HotMonitor/1.0)',
        'Accept': 'text/html',
      },
    });

    if (!res.ok) throw new Error(`GitHub Trending HTTP ${res.status}`);

    const html = await res.text();
    const items = [];

    // 解析仓库列表（正则抓取关键信息，不依赖 DOM 解析库）
    const repoPattern = /<article[^>]*class="Box-row"[^>]*>([\s\S]*?)<\/article>/g;
    const namePattern = /href="\/([^/"]+\/[^/"]+)"/;
    const descPattern = /<p[^>]*class="[^"]*col-9[^"]*"[^>]*>\s*([\s\S]*?)\s*<\/p>/;
    const langPattern = /itemprop="programmingLanguage"[^>]*>\s*([^<]+)\s*</;
    const starsPattern = /href="[^"]*\/stargazers"[^>]*>\s*([\d,]+)\s*</;

    let match;
    while ((match = repoPattern.exec(html)) !== null && items.length < limit) {
      const block = match[1];

      const nameM = namePattern.exec(block);
      if (!nameM) continue;
      const repoPath = nameM[1];

      const descM = descPattern.exec(block);
      const description = descM
        ? descM[1].replace(/<[^>]+>/g, '').trim()
        : '';

      const langM = langPattern.exec(block);
      const language = langM ? langM[1].trim() : '';

      const starsM = starsPattern.exec(block);
      const stars = starsM ? starsM[1].replace(/,/g, '') : '0';

      items.push({
        source: 'github',
        source_id: repoPath,
        title: `[GitHub Trending] ${repoPath} ⭐${stars}`,
        content: description + (language ? ` | Language: ${language}` : ''),
        url: `https://github.com/${repoPath}`,
        author: repoPath.split('/')[0],
        published_at: new Date().toISOString(),
      });
    }

    return items;
  } catch (err) {
    console.error('[GitHub Trending] fetch error:', err.message);
    return [];
  }
}

module.exports = { fetchGithubTrending };

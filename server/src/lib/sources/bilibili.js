/**
 * 数据源：Bilibili（哔哩哔哩）
 * 使用 Bilibili 公开 Web API 获取知识/科技分区热门视频
 * 免费无需 Key
 */

const BILIBILI_RANKING_API =
  'https://api.bilibili.com/x/web-interface/ranking/v2';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

// 知识(36)、科技(188) 分区
const PARTITIONS = [
  { rid: 36, name: '知识' },
  { rid: 188, name: '科技' },
];

/**
 * 获取 B 站知识/科技分区热门视频
 * @param {string} _query - 保留参数（与其他数据源签名一致）
 * @param {number} limit  - 最多返回数量
 * @returns {Array}
 */
async function fetchBilibili(_query, limit = 15) {
  try {
    const results = await Promise.allSettled(
      PARTITIONS.map(p =>
        fetchPartitionRanking(
          p.rid,
          p.name,
          Math.ceil(limit / PARTITIONS.length)
        )
      )
    );

    const allItems = [];
    const seen = new Set();

    for (const r of results) {
      if (r.status === 'fulfilled') {
        for (const item of r.value) {
          if (!seen.has(item.source_id)) {
            seen.add(item.source_id);
            allItems.push(item);
          }
        }
      }
    }

    console.log(`[Bilibili] 获取 ${allItems.length} 条热门视频`);
    return allItems.slice(0, limit);
  } catch (err) {
    console.error('[Bilibili] error:', err.message);
    return [];
  }
}

/**
 * 获取指定分区排行榜
 */
async function fetchPartitionRanking(rid, name, limit) {
  try {
    const params = new URLSearchParams({
      rid: String(rid),
      type: 'all',
    });

    const res = await fetch(`${BILIBILI_RANKING_API}?${params}`, {
      headers: {
        'User-Agent': UA,
        Referer: 'https://www.bilibili.com',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.warn(`[Bilibili] ${name}区 HTTP ${res.status}`);
      return [];
    }

    const data = await res.json();
    if (data.code !== 0) {
      console.warn(`[Bilibili] ${name}区 API code: ${data.code}`);
      return [];
    }

    const list = data.data?.list || [];
    return list.slice(0, limit).map(v => ({
      source: 'bilibili',
      source_id: v.bvid || String(v.aid),
      title: v.title || '',
      content: (v.desc || '').substring(0, 1000),
      url: v.bvid
        ? `https://www.bilibili.com/video/${v.bvid}`
        : `https://www.bilibili.com/video/av${v.aid}`,
      author: v.owner?.name || '',
      published_at: v.pubdate
        ? new Date(v.pubdate * 1000).toISOString()
        : new Date().toISOString(),
    }));
  } catch (err) {
    console.warn(`[Bilibili] ${name}区 error:`, err.message);
    return [];
  }
}

module.exports = { fetchBilibili };

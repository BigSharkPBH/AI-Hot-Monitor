/**
 * OpenRouter AI 客户端
 * 基于 MCP 文档：POST https://openrouter.ai/api/v1/chat/completions
 * Auth: Authorization: Bearer <token>
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * 调用 OpenRouter 分析热点内容
 * @param {string} title  - 文章标题
 * @param {string} content - 文章内容摘要
 * @param {string[]} keywords - 用户关键词列表
 * @returns {{ is_relevant, relevance_reason, heat_score, summary, tags, matched_keywords }}
 */
async function analyzeContent(title, content, keywords = []) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat';

  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    // 未配置 API Key，返回默认值
    return {
      is_relevant: true,
      relevance_reason: '未配置 OpenRouter API Key，跳过 AI 分析',
      heat_score: 5,
      summary: title,
      tags: [],
      matched_keywords: [],
    };
  }

  const keywordsText = keywords.length > 0
    ? `\n用户关注的关键词：${keywords.join('、')}`
    : '';

  const prompt = `你是一个 AI 技术热点分析助手。请分析以下内容，并严格返回 JSON 格式结果。

标题：${title}
内容：${(content || '').substring(0, 800)}${keywordsText}

判断标准（必须严格执行）：
1. 以下内容必须标记为 is_relevant: false：
   - 低质量随意发言、无实质信息的闲聊
   - 广告、营销推广、垃圾信息
   - 未经证实的假新闻、谣言
   - 与 AI/编程/技术领域无关的内容
   - 纯转发无原创观点的内容
2. heat_score 评分参考：
   - 9-10：重大产品发布/更新、行业里程碑事件
   - 7-8：有价值的技术突破、重要开源项目
   - 5-6：一般性技术讨论、有参考价值的内容
   - 3-4：边缘相关、信息量较少
   - 1-2：几乎无价值

请返回如下 JSON（不要包含代码块标记）：
{
  "is_relevant": true或false,
  "relevance_reason": "简短说明判断理由",
  "heat_score": 1-10的整数（热度：10最热，1最冷），
  "summary": "一句话中文摘要（30字以内）",
  "tags": ["标签1", "标签2", "标签3"],
  "matched_keywords": ["命中的关键词列表，从用户关键词中选"]
}`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://hot-monitor.local',
        'X-Title': 'Hot-Monitor',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 512,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[OpenRouter] API error:', response.status, err);
      return defaultAnalysis(title);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    try {
      const result = JSON.parse(text);
      return {
        is_relevant: result.is_relevant !== false,
        relevance_reason: result.relevance_reason || '',
        heat_score: Math.min(10, Math.max(1, Number(result.heat_score) || 5)),
        summary: result.summary || title,
        tags: Array.isArray(result.tags) ? result.tags.slice(0, 5) : [],
        matched_keywords: Array.isArray(result.matched_keywords) ? result.matched_keywords : [],
      };
    } catch {
      console.warn('[OpenRouter] JSON parse failed:', text);
      return defaultAnalysis(title);
    }
  } catch (err) {
    console.error('[OpenRouter] Network error:', err.message);
    return defaultAnalysis(title);
  }
}

function defaultAnalysis(title) {
  return {
    is_relevant: true,
    relevance_reason: 'AI 分析失败，默认通过',
    heat_score: 5,
    summary: title,
    tags: [],
    matched_keywords: [],
  };
}

module.exports = { analyzeContent };

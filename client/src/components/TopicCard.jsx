import HeatBadge, { getHeatBorderClass } from './HeatBadge'
import SourceBadge from './SourceBadge'

// 时间格式化
function timeAgo(isoStr) {
  if (!isoStr) return ''
  const diff = Date.now() - new Date(isoStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}小时前`
  return `${Math.floor(hours / 24)}天前`
}

export default function TopicCard({ topic, highlight = false }) {
  const heatClass = getHeatBorderClass(topic.heat_score)
  const tags = Array.isArray(topic.tags) ? topic.tags : []

  return (
    <article
      className={`glass-card p-4 flex flex-col gap-3 ${heatClass} ${highlight ? 'signal-pulse' : ''}`}
      aria-label={topic.title}
    >
      {/* 头部：来源 + 热度 + 时间 */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <SourceBadge source={topic.source} />
          <HeatBadge score={topic.heat_score} />
        </div>
        <time
          className="text-xs text-gray-dim font-mono"
          dateTime={topic.collected_at}
          title={topic.collected_at}
        >
          {timeAgo(topic.collected_at)}
        </time>
      </div>

      {/* 标题 */}
      <h3 className="font-display font-semibold text-sm leading-snug text-slate-100 line-clamp-2">
        {topic.url ? (
          <a
            href={topic.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-neon transition-colors"
          >
            {topic.title}
          </a>
        ) : (
          topic.title
        )}
      </h3>

      {/* AI 摘要 */}
      {topic.summary && topic.summary !== topic.title && (
        <p className="text-xs text-gray-dim leading-relaxed line-clamp-2">
          {topic.summary}
        </p>
      )}

      {/* 标签 */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1" role="list" aria-label="标签">
          {tags.slice(0, 4).map(tag => (
            <span
              key={tag}
              role="listitem"
              className="px-2 py-0.5 rounded text-xs bg-purple-neon/10 text-purple-neon border border-purple-neon/20"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 作者 */}
      {topic.author && (
        <p className="text-xs text-gray-dim/70 mt-auto font-mono truncate">
          @{topic.author}
        </p>
      )}
    </article>
  )
}

import HeatBadge, { getHeatLevel } from './HeatBadge'
import SourceBadge from './SourceBadge'
import { SpotlightCard, MovingBorderCard } from './Aceternity'

function timeAgo(isoStr) {
  if (!isoStr) return ''
  const diff = Date.now() - new Date(isoStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

export default function TopicCard({ topic }) {
  const heat = getHeatLevel(topic.heat_score)
  const tags = Array.isArray(topic.tags) ? topic.tags : []
  const isUltra = heat === 'ultra'

  const inner = (
    <SpotlightCard
      className="card p-4 flex flex-col gap-3"
      data-heat={heat === 'high' || heat === 'ultra' ? heat : undefined}
      aria-label={topic.title}
    >
      {/* 头部 */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <SourceBadge source={topic.source} />
          <HeatBadge score={topic.heat_score} />
        </div>
        <time
          className="text-[11px] font-mono flex-shrink-0"
          style={{ color: 'var(--text-3)' }}
          dateTime={topic.collected_at}
          title={topic.collected_at}
        >
          {timeAgo(topic.collected_at)}
        </time>
      </div>

      {/* 标题 */}
      <h3 className="font-semibold text-sm leading-snug line-clamp-2" style={{ color: 'var(--text-1)' }}>
        {topic.url ? (
          <a
            href={topic.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#22d3ee] transition-colors duration-150"
          >
            {topic.title}
          </a>
        ) : (
          topic.title
        )}
      </h3>

      {/* AI 摘要 */}
      {topic.summary && topic.summary !== topic.title && (
        <p className="text-[12px] leading-relaxed line-clamp-2" style={{ color: 'var(--text-2)' }}>
          {topic.summary}
        </p>
      )}

      {/* 底部：标签 + 作者 */}
      <div className="flex items-center justify-between gap-2 mt-auto pt-1">
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-1" role="list" aria-label="标签">
            {tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                role="listitem"
                className="px-1.5 py-0.5 rounded text-[10px] font-mono"
                style={{ background: 'rgba(168,85,247,0.08)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.18)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        ) : <span />}
        {topic.author && (
          <span className="text-[11px] font-mono truncate flex-shrink-0 max-w-[100px]" style={{ color: 'var(--text-3)' }}>
            @{topic.author}
          </span>
        )}
      </div>
    </SpotlightCard>
  )

  // Ultra 热度：加旋转彩色边框
  if (isUltra) {
    return (
      <article>
        <MovingBorderCard className="rounded-[10px]">
          {inner}
        </MovingBorderCard>
      </article>
    )
  }

  return <article>{inner}</article>
}

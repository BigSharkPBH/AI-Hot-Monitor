// 数据来源徽章
const SOURCE_CONFIG = {
  twitter:    { label: 'Twitter/X', icon: '𝕏',  cls: 'badge-twitter' },
  hackernews: { label: 'HN',        icon: '▲',  cls: 'badge-hackernews' },
  rss:        { label: 'RSS',        icon: '⊕',  cls: 'badge-rss' },
  github:     { label: 'GitHub',     icon: '⌬',  cls: 'badge-github' },
}

export default function SourceBadge({ source }) {
  const cfg = SOURCE_CONFIG[source] || { label: source, icon: '●', cls: 'badge-github' }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-mono font-medium ${cfg.cls}`}>
      <span aria-hidden="true">{cfg.icon}</span>
      {cfg.label}
    </span>
  )
}

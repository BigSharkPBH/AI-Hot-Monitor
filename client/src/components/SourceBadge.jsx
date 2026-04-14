const SOURCE_CONFIG = {
  twitter:    { label: 'X',      cls: 'badge-twitter' },
  hackernews: { label: 'HN',     cls: 'badge-hackernews' },
  rss:        { label: 'RSS',    cls: 'badge-rss' },
  github:     { label: 'GitHub', cls: 'badge-github' },
}

const SourceIcons = {
  twitter: (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.836L1.254 2.25H8.08l4.261 5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  hackernews: (
    <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 1L10 6H15L11 9.5L13 15L8 11.5L3 15L5 9.5L1 6H6L8 1Z"/>
    </svg>
  ),
  rss: (
    <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <circle cx="3" cy="13" r="1.5"/>
      <path d="M3 7a6 6 0 016 6M3 3a10 10 0 0110 10" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  github: (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  ),
}

export default function SourceBadge({ source }) {
  const cfg = SOURCE_CONFIG[source] || { label: source, cls: 'badge-github' }
  const icon = SourceIcons[source] || null
  return (
    <span className={`badge ${cfg.cls}`}>
      {icon}
      {cfg.label}
    </span>
  )
}

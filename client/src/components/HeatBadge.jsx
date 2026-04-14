const HEAT_LEVELS = [
  { min: 9, label: 'ULTRA',  color: '#ef4444', bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.35)' },
  { min: 7, label: 'HOT',    color: '#f97316', bg: 'rgba(249,115,22,0.1)',   border: 'rgba(249,115,22,0.3)' },
  { min: 5, label: 'RISING', color: '#22d3ee', bg: 'rgba(34,211,238,0.08)', border: 'rgba(34,211,238,0.25)' },
  { min: 0, label: 'WARM',   color: '#6b7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.2)' },
]

export default function HeatBadge({ score }) {
  const s = Number(score) || 0
  const level = HEAT_LEVELS.find(l => s >= l.min)

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] font-semibold tracking-wider"
      style={{ color: level.color, background: level.bg, border: `1px solid ${level.border}` }}
      aria-label={`热度评分 ${s} 分`}
    >
      {level.label}
      <span className="opacity-60">{s}</span>
    </span>
  )
}

export function getHeatLevel(score) {
  const s = Number(score) || 0
  if (s >= 9) return 'ultra'
  if (s >= 7) return 'high'
  if (s >= 5) return 'mid'
  return 'low'
}

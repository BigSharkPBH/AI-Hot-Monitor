// 热度徽章：1-10 分对应不同颜色和标签
export default function HeatBadge({ score }) {
  const s = Number(score) || 0

  let label, colorClass, heatBorder
  if (s >= 9) {
    label = '🔥 极热'
    colorClass = 'text-red-alert bg-red-alert/10 border-red-alert/40'
    heatBorder = 'heat-border-ultra'
  } else if (s >= 7) {
    label = '🌶 热门'
    colorClass = 'text-orange-hot bg-orange-hot/10 border-orange-hot/30'
    heatBorder = 'heat-border-high'
  } else if (s >= 5) {
    label = '⚡ 上升'
    colorClass = 'text-cyan-neon bg-cyan-neon/10 border-cyan-neon/25'
    heatBorder = 'heat-border-mid'
  } else {
    label = '…'
    colorClass = 'text-gray-dim bg-white/5 border-white/10'
    heatBorder = 'heat-border-low'
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-mono font-medium ${colorClass}`}
      aria-label={`热度评分 ${s} 分`}
    >
      {label} <span className="opacity-70">{s}</span>
    </span>
  )
}

export { }
// 导出 heatBorder 工具函数供卡片使用
export function getHeatBorderClass(score) {
  const s = Number(score) || 0
  if (s >= 9) return 'heat-border-ultra'
  if (s >= 7) return 'heat-border-high'
  if (s >= 5) return 'heat-border-mid'
  return 'heat-border-low'
}

/**
 * Aceternity UI 风格特效组件集合
 * 全部自实现，无需 Next.js 依赖，兼容 Vite + React
 */
import { useRef, useEffect } from 'react'

// ── SpotlightCard ─────────────────────────────────────────────
// 鼠标移动时跟踪高光，Aceternity Card Spotlight 效果
export function SpotlightCard({ children, className = '', ...props }) {
  const ref = useRef(null)

  const handleMouseMove = e => {
    const el = ref.current
    if (!el) return
    const { left, top } = el.getBoundingClientRect()
    const x = ((e.clientX - left) / el.offsetWidth) * 100
    const y = ((e.clientY - top) / el.offsetHeight) * 100
    el.style.setProperty('--mouse-x', `${x}%`)
    el.style.setProperty('--mouse-y', `${y}%`)
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`spotlight-card ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

// ── MovingBorderCard ──────────────────────────────────────────
// Aceternity Moving Border：极热卡片旋转渐变边框
export function MovingBorderCard({ children, className = '', ...props }) {
  return (
    <div className={`moving-border ${className}`} {...props}>
      {children}
    </div>
  )
}

// ── BeamButton ────────────────────────────────────────────────
// Aceternity Beam Button：hover 时扫光特效
export function BeamButton({ children, className = '', as: Tag = 'button', ...props }) {
  return (
    <Tag className={`btn beam-btn ${className}`} {...props}>
      {children}
    </Tag>
  )
}

// ── BackgroundBeams ───────────────────────────────────────────
// Aceternity Background Beams：页面背景流光效果（轻量 CSS 版）
export function BackgroundBeams({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {/* 顶部发散光晕 */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(ellipse, rgba(232,255,71,0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      {/* 右侧流光线条 */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="beam1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#e8ff47" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="beam2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <line x1="-10%" y1="20%" x2="110%" y2="80%" stroke="url(#beam1)" strokeWidth="1" />
        <line x1="-10%" y1="60%" x2="110%" y2="30%" stroke="url(#beam2)" strokeWidth="1" />
        <line x1="20%" y1="-10%" x2="80%" y2="110%" stroke="url(#beam1)" strokeWidth="0.5" />
      </svg>
    </div>
  )
}

// ── LiveDot ───────────────────────────────────────────────────
// 实时在线指示点（绿色脉冲）
export function LiveDot({ color = 'var(--emerald)' }) {
  return (
    <span className="relative inline-flex h-2 w-2">
      <span
        className="absolute inline-flex h-full w-full rounded-full animate-ping opacity-60"
        style={{ background: color }}
        aria-hidden="true"
      />
      <span
        className="relative inline-flex h-2 w-2 rounded-full"
        style={{ background: color }}
        aria-hidden="true"
      />
    </span>
  )
}

// ── TickNumber ────────────────────────────────────────────────
// 数字入场动效
export function TickNumber({ value, className = '' }) {
  return (
    <span
      key={value}
      className={`inline-block animate-number-tick ${className}`}
    >
      {value}
    </span>
  )
}

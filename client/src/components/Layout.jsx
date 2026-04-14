import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { api } from '../api'
import { BackgroundBeams, LiveDot } from './Aceternity'

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Dashboard',
    aria: '控制台',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    to: '/keywords',
    label: '关键词',
    aria: '关键词管理',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="13" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M15 13l1.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    to: '/explorer',
    label: '热点探索',
    aria: '热点探索',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 2L9.5 6H14L10.5 8.5L12 13L8 10.5L4 13L5.5 8.5L2 6H6.5L8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    to: '/notifications',
    label: '通知',
    aria: '通知中心',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 1.5A4.5 4.5 0 013.5 6v3l-1 1.5h11L12.5 9V6A4.5 4.5 0 018 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M6.5 13.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export default function Layout({ children }) {
  const [unread, setUnread]       = useState(0)
  const [collecting, setCollecting] = useState(false)

  useEffect(() => {
    const fetchUnread = () =>
      api.getUnreadCount().then(r => setUnread(r.count)).catch(() => {})
    fetchUnread()
    const timer = setInterval(fetchUnread, 30000)
    return () => clearInterval(timer)
  }, [])

  const handleCollect = async () => {
    setCollecting(true)
    try { await api.triggerCollect() }
    finally { setTimeout(() => setCollecting(false), 3000) }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--ink)' }}>

      {/* ───────── 侧边栏 ───────── */}
      <aside
        className="w-52 flex-shrink-0 flex flex-col border-r relative"
        style={{ borderColor: 'var(--border)', background: 'var(--ink-1)' }}
        aria-label="主导航"
      >
        {/* Logo */}
        <div className="px-4 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            {/* 图标 */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#e8ff47 0%,#22d3ee 100%)' }}
              aria-hidden="true"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L10 6H15L11 9.5L13 15L8 11.5L3 15L5 9.5L1 6H6L8 1Z" fill="#080808"/>
              </svg>
            </div>
            <div>
              <div className="font-bold text-sm leading-tight" style={{ color: 'var(--text-1)' }}>Hot-Monitor</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <LiveDot />
                <span className="text-xs" style={{ color: 'var(--text-3)' }}>AI 热点雷达</span>
              </div>
            </div>
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 p-2.5 flex flex-col gap-0.5" role="navigation">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              aria-label={item.aria}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative
                 ${isActive
                   ? 'bg-white/[0.07] text-[#f5f5f5] border border-white/10'
                   : 'text-[#a3a3a3] hover:text-[#e5e5e5] hover:bg-white/[0.04]'
                 }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active 指示条 */}
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full"
                      style={{ background: 'var(--signal)' }}
                      aria-hidden="true"
                    />
                  )}
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.label === '通知' && unread > 0 && (
                    <span
                      className="ml-auto text-xs rounded-full px-1.5 py-0.5 font-mono min-w-[18px] text-center leading-none"
                      style={{ background: 'var(--alert)', color: '#fff', fontSize: '10px' }}
                      aria-label={`${unread} 条未读`}
                    >
                      {unread > 99 ? '99+' : unread}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* 底部：立即采集，BeamButton 扫光效果 */}
        <div className="p-2.5 pb-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={handleCollect}
            disabled={collecting}
            className="btn btn-signal beam-btn w-full text-xs"
            aria-label="手动触发数据采集"
          >
            {collecting ? (
              <>
                <span
                  className="inline-block w-3 h-3 border-2 border-t-transparent rounded-full border-current animate-spin"
                  aria-hidden="true"
                />
                采集中…
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                  <path d="M6.5 1v2M6.5 10v2M1 6.5h2M10 6.5h2M2.93 2.93l1.42 1.42M8.65 8.65l1.42 1.42M2.93 10.07l1.42-1.42M8.65 4.35l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                立即采集
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ───────── 主内容区 ───────── */}
      <main className="flex-1 min-w-0 relative overflow-hidden" role="main">
        <BackgroundBeams />
        <div className="relative z-10 h-full overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  )
}


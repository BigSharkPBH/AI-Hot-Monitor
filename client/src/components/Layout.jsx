import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { api } from '../api'

const NAV_ITEMS = [
  { to: '/',              icon: '⬡', label: 'Dashboard',  aria: '控制台' },
  { to: '/keywords',      icon: '⌖', label: '关键词',      aria: '关键词管理' },
  { to: '/explorer',      icon: '⊞', label: '热点探索',    aria: '热点探索' },
  { to: '/notifications', icon: '⚑', label: '通知',        aria: '通知中心' },
]

export default function Layout({ children }) {
  const [unread, setUnread] = useState(0)
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
    try {
      await api.triggerCollect()
    } finally {
      setTimeout(() => setCollecting(false), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-grid flex" style={{ background: 'var(--bg)' }}>
      {/* ===== 侧边栏 ===== */}
      <aside
        className="w-56 flex-shrink-0 flex flex-col border-r"
        style={{ borderColor: 'var(--glass-border)', background: 'rgba(10,12,26,0.95)' }}
        aria-label="主导航"
      >
        {/* Logo */}
        <div className="p-5 border-b" style={{ borderColor: 'var(--glass-border)' }}>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, var(--cyan), var(--purple))' }}
              aria-hidden="true"
            >
              ◉
            </div>
            <div>
              <div className="font-display font-bold text-sm gradient-text leading-tight">Hot-Monitor</div>
              <div className="text-xs text-gray-dim mt-0.5">AI 热点雷达</div>
            </div>
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 p-3 flex flex-col gap-1" role="navigation">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              aria-label={item.aria}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative
                 ${isActive
                   ? 'text-cyan-neon bg-cyan-neon/10 border border-cyan-neon/20'
                   : 'text-gray-dim hover:text-slate-200 hover:bg-white/5'
                 }`
              }
            >
              <span className="font-mono text-base w-5 text-center" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
              {item.label === '通知' && unread > 0 && (
                <span
                  className="ml-auto text-xs bg-red-alert text-white rounded-full px-1.5 py-0.5 font-mono min-w-[18px] text-center"
                  aria-label={`${unread} 条未读`}
                >
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* 底部：手动采集按钮 */}
        <div className="p-3 border-t" style={{ borderColor: 'var(--glass-border)' }}>
          <button
            onClick={handleCollect}
            disabled={collecting}
            className="btn-primary w-full text-xs py-2"
            aria-label="手动触发数据采集"
          >
            {collecting ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-t-transparent rounded-full border-current animate-spin" aria-hidden="true" />
                采集中…
              </>
            ) : (
              <>⟳ 立即采集</>
            )}
          </button>
        </div>
      </aside>

      {/* ===== 主内容区 ===== */}
      <main className="flex-1 flex flex-col min-w-0" role="main">
        {children}
      </main>
    </div>
  )
}

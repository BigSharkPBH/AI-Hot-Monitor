import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import TopicCard from '../components/TopicCard'
import { SpotlightCard, TickNumber } from '../components/Aceternity'

const STAT_CONFIGS = [
  {
    key: 'total_topics',
    label: '热点总数',
    sub: 'topics',
    color: '#22d3ee',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="10" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="1" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="10" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    key: 'today_topics',
    label: '今日新增',
    sub: 'today',
    color: '#10b981',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M9 2v5l3 3M16 9A7 7 0 112 9a7 7 0 0114 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'active_keywords',
    label: '监控关键词',
    sub: 'keywords',
    color: '#a855f7',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M2 4h14M2 9h9M2 14h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="15" cy="13" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M17 15l1.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'today_notifications',
    label: '今日触发',
    sub: 'alerts',
    color: '#f97316',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M9 1.5A5 5 0 014 6.5v3.5l-1 1.5h12L14 10V6.5A5 5 0 019 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M7.5 15a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
]

function StatCard({ label, value, sub, color, icon, loading }) {
  if (loading) return <div className="skeleton h-24 rounded-[10px]" />
  return (
    <SpotlightCard
      className="card p-4 flex flex-col justify-between h-24"
      aria-label={`${label}: ${value ?? 0}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: 'var(--text-3)' }}>{label}</span>
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="font-bold text-2xl font-mono" style={{ color }}>
          <TickNumber value={value ?? 0} />
        </span>
        <span className="text-[10px] font-mono uppercase" style={{ color: 'var(--text-3)' }}>{sub}</span>
      </div>
    </SpotlightCard>
  )
}

export default function Dashboard() {
  const [stats,        setStats]        = useState(null)
  const [topics,       setTopics]       = useState([])
  const [recentNotifs, setRecentNotifs] = useState([])
  const [loading,      setLoading]      = useState(true)

  const load = useCallback(async () => {
    try {
      const [statsRes, topicsRes, notifsRes] = await Promise.all([
        api.getStats(),
        api.getTopics({ limit: 12, sort: 'collected_at' }),
        api.getNotifications({ limit: 6 }),
      ])
      setStats(statsRes.data)
      setTopics(topicsRes.data || [])
      setRecentNotifs(notifsRes.data || [])
    } catch (err) {
      console.error('[Dashboard] load error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const timer = setInterval(load, 60000)
    return () => clearInterval(timer)
  }, [load])

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* ── 页头 ── */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-bold text-xl gradient-text leading-tight">热点雷达</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>AI 实时采集 · 关键词对齐 · 即时推送</p>
        </div>
        <Link
          to="/explorer"
          className="btn btn-ghost text-xs flex-shrink-0"
          aria-label="前往热点探索页"
        >
          探索全部
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 6h8M7 4l3 2-3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </header>

      {/* ── 统计卡片 ── */}
      <section aria-label="数据概览" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STAT_CONFIGS.map(cfg => (
          <StatCard
            key={cfg.key}
            label={cfg.label}
            sub={cfg.sub}
            color={cfg.color}
            icon={cfg.icon}
            value={stats?.[cfg.key]}
            loading={loading}
          />
        ))}
      </section>

      {/* ── 主体：热点流 + 通知侧边 ── */}
      <div className="flex gap-5 min-h-0">

        {/* 热点流 */}
        <section className="flex-1 flex flex-col gap-3 min-w-0" aria-label="最新热点">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-2)' }}>最新热点</h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton h-40 rounded-[10px]" />
              ))}
            </div>
          ) : topics.length === 0 ? (
            <div className="card p-10 text-center flex flex-col items-center gap-3">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ color: 'var(--text-3)' }} aria-hidden="true">
                <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4"/>
                <path d="M20 14v6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p className="text-sm" style={{ color: 'var(--text-2)' }}>暂无热点数据</p>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>点击左下角「立即采集」获取最新热点</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {topics.map(t => (
                <TopicCard key={t.id} topic={t} />
              ))}
            </div>
          )}
        </section>

        {/* 通知侧边栏 */}
        <aside className="w-64 flex-shrink-0 flex flex-col gap-3" aria-label="最近通知">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-2)' }}>最近通知</h2>
            <Link to="/notifications" className="text-[11px] hover:underline" style={{ color: 'var(--flux)' }}>
              全部 →
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="skeleton h-16 rounded-[10px]" />
              ))
            ) : recentNotifs.length === 0 ? (
              <div className="card p-5 text-center">
                <p className="text-xs" style={{ color: 'var(--text-3)' }}>暂无通知</p>
              </div>
            ) : (
              recentNotifs.map(n => (
                <div
                  key={n.id}
                  className="card p-3 flex flex-col gap-1.5"
                  style={n.is_read === 0 ? { borderColor: 'rgba(249,115,22,0.3)' } : {}}
                >
                  {n.is_read === 0 && (
                    <span className="flex items-center gap-1 text-[10px] font-mono" style={{ color: 'var(--fire)' }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] animate-pulse-dot inline-block" aria-hidden="true"/>
                      NEW
                    </span>
                  )}
                  <p className="text-xs line-clamp-2" style={{ color: 'var(--text-1)' }}>{n.message}</p>
                  {n.topic_url && (
                    <a
                      href={n.topic_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] hover:underline"
                      style={{ color: 'var(--flux)' }}
                    >
                      查看原文 →
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}


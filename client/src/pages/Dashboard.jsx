import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import TopicCard from '../components/TopicCard'

// 统计卡片
function StatCard({ label, value, icon, color, sub }) {
  const colors = {
    cyan:   'var(--cyan)',
    purple: 'var(--purple)',
    orange: 'var(--orange)',
    red:    'var(--red)',
  }
  const c = colors[color] || colors.cyan

  return (
    <div className="glass-card p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-gray-dim text-sm">{label}</span>
        <span className="text-xl" aria-hidden="true" style={{ color: c }}>{icon}</span>
      </div>
      <div
        className="font-display font-bold text-3xl font-mono animate-number-tick"
        style={{ color: c }}
        aria-label={`${label}: ${value}`}
      >
        {value}
      </div>
      {sub && <p className="text-xs text-gray-dim">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [topics, setTopics] = useState([])
  const [recentNotifs, setRecentNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const [statsRes, topicsRes, notifsRes] = await Promise.all([
        api.getStats(),
        api.getTopics({ limit: 12, sort: 'collected_at' }),
        api.getNotifications({ limit: 5 }),
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
    const timer = setInterval(load, 60000) // 每分钟自动刷新
    return () => clearInterval(timer)
  }, [load])

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
      {/* 页头 */}
      <header>
        <h1 className="font-display font-bold text-2xl gradient-text">实时热点雷达</h1>
        <p className="text-gray-dim text-sm mt-1">
          AI 自动采集 · 关键词监控 · 即时推送
        </p>
      </header>

      {/* 统计卡片 Bento Grid */}
      <section aria-label="数据概览">
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card p-4 h-24 skeleton" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="总热点数"
              value={stats?.total_topics ?? 0}
              icon="◈"
              color="cyan"
              sub="数据库全量"
            />
            <StatCard
              label="今日新增"
              value={stats?.today_topics ?? 0}
              icon="⊕"
              color="green"
              sub="24小时内"
            />
            <StatCard
              label="活跃关键词"
              value={stats?.active_keywords ?? 0}
              icon="⌖"
              color="purple"
              sub="正在监控"
            />
            <StatCard
              label="今日命中"
              value={stats?.today_notifications ?? 0}
              icon="⚑"
              color="orange"
              sub="触发通知"
            />
          </div>
        )}
      </section>

      {/* 主内容：热点流 + 最近通知 */}
      <div className="flex gap-6 flex-1 min-h-0">
        {/* 热点流（左侧大区域）*/}
        <section className="flex-1 flex flex-col gap-3 min-w-0" aria-label="最新热点">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-base text-slate-200">
              最新热点
            </h2>
            <Link to="/explorer" className="text-xs text-cyan-neon hover:underline">
              查看全部 →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card h-36 skeleton" />
              ))}
            </div>
          ) : topics.length === 0 ? (
            <div className="glass-card p-8 text-center text-gray-dim flex flex-col items-center gap-3">
              <span className="text-4xl opacity-30" aria-hidden="true">◌</span>
              <p className="text-sm">暂无热点数据</p>
              <p className="text-xs opacity-70">点击左下角「立即采集」获取最新热点</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {topics.map(t => (
                <TopicCard key={t.id} topic={t} />
              ))}
            </div>
          )}
        </section>

        {/* 最近通知（右侧）*/}
        <aside
          className="w-72 flex-shrink-0 flex flex-col gap-3"
          aria-label="最近通知"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-base text-slate-200">
              最近通知
            </h2>
            <Link to="/notifications" className="text-xs text-cyan-neon hover:underline">
              全部 →
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="glass-card h-16 skeleton" />
              ))
            ) : recentNotifs.length === 0 ? (
              <div className="glass-card p-4 text-center text-gray-dim text-sm">
                <span className="text-2xl opacity-30 block mb-2" aria-hidden="true">⚑</span>
                暂无通知
              </div>
            ) : (
              recentNotifs.map(n => (
                <div
                  key={n.id}
                  className={`glass-card p-3 flex flex-col gap-1 ${n.is_read === 0 ? 'border-orange-hot/30' : ''}`}
                >
                  {n.is_read === 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-orange-hot font-mono mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-hot inline-block" aria-hidden="true" />
                      未读
                    </span>
                  )}
                  <p className="text-xs text-slate-200 line-clamp-2">{n.message}</p>
                  {n.topic_url && (
                    <a
                      href={n.topic_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-cyan-neon hover:underline truncate"
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

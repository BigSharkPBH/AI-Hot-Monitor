import { useState, useEffect, useCallback } from 'react'
import { api } from '../api'
import { usePushNotify } from '../hooks/usePushNotify'

function timeStr(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  const now = new Date()
  const mins = Math.floor((now - d) / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  return d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
}

export default function Notifications() {
  const [notifs,    setNotifs]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [unreadOnly,setUnreadOnly]= useState(false)
  const { isPushEnabled, isPushSupported, togglePush, pushLoading } = usePushNotify()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.getNotifications({ limit: 50, unread: unreadOnly ? 1 : undefined })
      setNotifs(res.data || [])
    } catch {}
    setLoading(false)
  }, [unreadOnly])

  useEffect(() => { load() }, [load])

  const handleMarkRead    = async id => { await api.markRead(id).catch(() => {}); load() }
  const handleMarkAllRead = async ()  => { await api.markAllRead().catch(() => {}); load() }

  const unreadCount = notifs.filter(n => n.is_read === 0).length

  return (
    <div className="p-6 flex flex-col gap-5 max-w-3xl">
      <header>
        <h1 className="font-bold text-xl gradient-text">通知中心</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>关键词命中时自动生成通知</p>
      </header>

      {/* Push 开关 */}
      {isPushSupported && (
        <section aria-label="Push 推送设置">
          <div className="card p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>浏览器推送通知</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                {isPushEnabled ? '已开启 — 关键词命中时将实时推送' : '开启后即使不在页面也能收到通知'}
              </p>
            </div>
            <button
              onClick={togglePush}
              disabled={pushLoading}
              className={`btn ${isPushEnabled ? 'btn-ghost' : 'btn-signal'} text-xs`}
              aria-pressed={isPushEnabled}
            >
              {pushLoading
                ? <span className="inline-block w-3.5 h-3.5 border-2 border-t-transparent rounded-full border-current animate-spin" />
                : isPushEnabled ? '关闭推送' : '开启推送'}
            </button>
          </div>
        </section>
      )}

      {/* 工具栏 */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setUnreadOnly(v => !v)}
          className="btn btn-ghost text-xs"
          style={unreadOnly ? { color: 'var(--flux)', borderColor: 'rgba(34,211,238,0.3)', background: 'rgba(34,211,238,0.06)' } : {}}
          aria-pressed={unreadOnly}
        >
          {unreadOnly ? '仅未读' : '全部'}
          {unreadCount > 0 && !unreadOnly && (
            <span className="ml-1.5 text-[10px] rounded-full px-1.5 py-0.5 font-mono" style={{ background: 'var(--fire)', color: '#fff' }}>
              {unreadCount}
            </span>
          )}
        </button>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn btn-ghost text-xs ml-auto" aria-label="全部标记已读">
            全部已读
          </button>
        )}
      </div>

      {/* 列表 */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 rounded-[10px]" />)}
        </div>
      ) : notifs.length === 0 ? (
        <div className="card p-12 text-center flex flex-col items-center gap-3">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ color: 'var(--text-3)' }} aria-hidden="true">
            <path d="M20 5A12 12 0 008 17v9l-2 3h28l-2-3v-9A12 12 0 0020 5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeDasharray="4 3"/>
            <path d="M16 32a4 4 0 008 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>{unreadOnly ? '没有未读通知' : '暂无通知记录'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2" role="list" aria-label="通知列表">
          {notifs.map(n => (
            <div
              key={n.id}
              role="listitem"
              className="card p-4 flex gap-3 items-start"
              style={n.is_read ? { opacity: 0.5 } : { borderColor: 'rgba(249,115,22,0.2)' }}
            >
              {/* 未读点 */}
              <div className="flex-shrink-0 mt-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full block"
                  style={{ background: n.is_read === 0 ? 'var(--fire)' : 'var(--text-3)' }}
                  aria-hidden="true"
                />
              </div>

              {/* 内容 */}
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-snug" style={{ color: n.is_read === 0 ? 'var(--text-1)' : 'var(--text-2)' }}>
                  {n.message}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {n.keyword_word && (
                    <span className="text-[11px] px-2 py-0.5 rounded font-mono" style={{ background: 'rgba(168,85,247,0.1)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.2)' }}>
                      {n.keyword_word}
                    </span>
                  )}
                  {n.topic_url && (
                    <a href={n.topic_url} target="_blank" rel="noopener noreferrer" className="text-[11px] hover:underline truncate" style={{ color: 'var(--flux)' }}>
                      查看来源 →
                    </a>
                  )}
                  <time className="text-[11px] font-mono ml-auto" style={{ color: 'var(--text-3)' }} dateTime={n.created_at}>
                    {timeStr(n.created_at)}
                  </time>
                </div>
              </div>

              {n.is_read === 0 && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="btn btn-ghost text-[11px] py-0.5 px-2 flex-shrink-0"
                  aria-label="标记已读"
                >
                  ✓
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

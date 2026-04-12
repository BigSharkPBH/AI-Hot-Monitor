import { useState, useEffect, useCallback } from 'react'
import { api } from '../api'
import { usePushNotify } from '../hooks/usePushNotify'

function timeStr(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  const now = new Date()
  const diff = now - d
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins} 分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} 小时前`
  return d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function Notifications() {
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)
  const [unreadOnly, setUnreadOnly] = useState(false)
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

  const handleMarkRead = async id => {
    await api.markRead(id).catch(() => {})
    load()
  }

  const handleMarkAllRead = async () => {
    await api.markAllRead().catch(() => {})
    load()
  }

  const unreadCount = notifs.filter(n => n.is_read === 0).length

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
      <header>
        <h1 className="font-display font-bold text-2xl gradient-text">通知中心</h1>
        <p className="text-gray-dim text-sm mt-1">关键词命中时自动生成通知</p>
      </header>

      {/* 浏览器 Push 推送开关 */}
      {isPushSupported && (
        <section aria-label="Push 推送设置">
          <div className="glass-card p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-200">浏览器推送通知</p>
              <p className="text-xs text-gray-dim mt-0.5">
                {isPushEnabled ? '已开启 — 关键词命中时将实时推送' : '开启后即使不在页面也能收到通知'}
              </p>
            </div>
            <button
              onClick={togglePush}
              disabled={pushLoading}
              className={isPushEnabled ? 'btn-ghost text-sm' : 'btn-primary text-sm'}
              aria-pressed={isPushEnabled}
            >
              {pushLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-t-transparent rounded-full border-current animate-spin" />
              ) : isPushEnabled ? '关闭推送' : '开启推送'}
            </button>
          </div>
        </section>
      )}

      {/* 工具栏 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setUnreadOnly(v => !v)}
          className={`btn-ghost text-xs py-1.5 px-3 ${unreadOnly ? 'text-cyan-neon border-cyan-neon/30' : ''}`}
          aria-pressed={unreadOnly}
        >
          {unreadOnly ? '● 仅未读' : '○ 全部'}
        </button>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-ghost text-xs py-1.5 px-3 ml-auto">
            全部已读
          </button>
        )}
      </div>

      {/* 通知列表 */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-card h-20 skeleton" />
          ))}
        </div>
      ) : notifs.length === 0 ? (
        <div className="glass-card p-12 text-center text-gray-dim flex flex-col items-center gap-3">
          <span className="text-5xl opacity-20" aria-hidden="true">⚑</span>
          <p>{unreadOnly ? '没有未读通知' : '暂无通知记录'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2" role="list" aria-label="通知列表">
          {notifs.map(n => (
            <div
              key={n.id}
              role="listitem"
              className={`glass-card p-4 flex gap-4 items-start transition-opacity ${n.is_read ? 'opacity-60' : ''}`}
            >
              {/* 未读点 */}
              <div className="flex-shrink-0 mt-1">
                {n.is_read === 0
                  ? <span className="w-2 h-2 rounded-full bg-orange-hot inline-block shadow-[0_0_6px_var(--orange)]" aria-hidden="true" />
                  : <span className="w-2 h-2 rounded-full bg-gray-600 inline-block" aria-hidden="true" />
                }
              </div>

              {/* 内容 */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug ${n.is_read === 0 ? 'text-slate-100 font-medium' : 'text-slate-400'}`}>
                  {n.message}
                </p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {n.keyword_word && (
                    <span className="text-xs px-2 py-0.5 rounded bg-purple-neon/10 text-purple-neon border border-purple-neon/20 font-mono">
                      {n.keyword_word}
                    </span>
                  )}
                  {n.topic_url && (
                    <a
                      href={n.topic_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyan-neon hover:underline truncate max-w-xs"
                    >
                      查看来源 →
                    </a>
                  )}
                  <time className="text-xs text-gray-dim ml-auto font-mono" dateTime={n.created_at}>
                    {timeStr(n.created_at)}
                  </time>
                </div>
              </div>

              {/* 已读按钮 */}
              {n.is_read === 0 && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="btn-ghost text-xs py-1 px-2 flex-shrink-0"
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

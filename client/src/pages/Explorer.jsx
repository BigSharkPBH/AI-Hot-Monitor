import { useState, useEffect, useCallback } from 'react'
import { api } from '../api'
import TopicCard from '../components/TopicCard'

const SOURCES = ['全部', 'twitter', 'hackernews', 'rss', 'github', 'searxng', 'reddit', 'v2ex', 'bilibili', 'weibo']
const PAGE_SIZE = 20

export default function Explorer() {
  const [topics,   setTopics]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [source,   setSource]   = useState('全部')
  const [tag,      setTag]      = useState('')
  const [tagInput, setTagInput] = useState('')
  const [page,     setPage]     = useState(1)
  const [total,    setTotal]    = useState(0)

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const params = { limit: PAGE_SIZE, offset: (p - 1) * PAGE_SIZE }
      if (source !== '全部') params.source = source
      if (tag) params.tag = tag
      const res = await api.getTopics(params)
      setTopics(res.data || [])
      setTotal(res.total || 0)
    } catch {}
    setLoading(false)
  }, [source, tag])

  useEffect(() => { setPage(1); load(1) }, [source, tag, load])

  const handlePageChange = p => {
    setPage(p); load(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleTagSearch = e => { e.preventDefault(); setTag(tagInput.trim()) }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="p-6 flex flex-col gap-5">
      <header>
        <h1 className="font-bold text-xl gradient-text">热点探索</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>浏览全部采集到的热点内容</p>
      </header>

      {/* 过滤工具栏 */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 flex-wrap" role="group" aria-label="按来源过滤">
          {SOURCES.map(s => (
            <button
              key={s}
              onClick={() => setSource(s)}
              className="btn btn-ghost text-xs py-1 px-3 font-mono"
              style={source === s ? { color: 'var(--flux)', borderColor: 'rgba(34,211,238,0.3)', background: 'rgba(34,211,238,0.06)' } : {}}
              aria-pressed={source === s}
            >
              {s === '全部' ? 'ALL' : s.toUpperCase()}
            </button>
          ))}
        </div>

        <form onSubmit={handleTagSearch} className="flex gap-2 ml-auto">
          <input
            className="input-field py-1 w-36 text-xs"
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            placeholder="标签搜索…"
            aria-label="按标签过滤"
          />
          <button type="submit" className="btn btn-ghost text-xs">搜索</button>
          {tag && (
            <button type="button" onClick={() => { setTag(''); setTagInput('') }} className="btn btn-danger text-xs">
              清除
            </button>
          )}
        </form>
      </div>

      {tag && (
        <p className="text-xs -mt-2" style={{ color: 'var(--flux)' }}>
          标签: <span className="font-mono px-2 py-0.5 rounded" style={{ background: 'rgba(34,211,238,0.1)' }}>{tag}</span>
        </p>
      )}

      {/* 热点网格 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
          {[...Array(12)].map((_, i) => <div key={i} className="skeleton h-40 rounded-[10px]" />)}
        </div>
      ) : topics.length === 0 ? (
        <div className="card p-12 text-center flex flex-col items-center gap-3">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ color: 'var(--text-3)' }} aria-hidden="true">
            <rect x="4" y="4" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3"/>
            <rect x="22" y="4" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3"/>
            <rect x="4" y="22" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3"/>
            <rect x="22" y="22" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3"/>
          </svg>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>暂无匹配热点</p>
          {(source !== '全部' || tag) && (
            <button onClick={() => { setSource('全部'); setTag(''); setTagInput('') }} className="btn btn-ghost text-xs">
              清除筛选
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-[11px] font-mono -mt-2" style={{ color: 'var(--text-3)' }}>
            {total} 条 · 第 {page}/{totalPages} 页
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
            {topics.map(t => <TopicCard key={t.id} topic={t} />)}
          </div>
          {totalPages > 1 && (
            <nav className="flex justify-center items-center gap-3 pt-2" aria-label="分页导航">
              <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1} className="btn btn-ghost text-xs">
                ← 上一页
              </button>
              <span className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>{page} / {totalPages}</span>
              <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages} className="btn btn-ghost text-xs">
                下一页 →
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  )
}

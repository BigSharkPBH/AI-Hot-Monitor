import { useState, useEffect, useCallback } from 'react'
import { api } from '../api'
import TopicCard from '../components/TopicCard'

const SOURCES = ['全部', 'twitter', 'hackernews', 'rss', 'github']
const PAGE_SIZE = 20

export default function Explorer() {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState('全部')
  const [tag, setTag] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

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

  useEffect(() => {
    setPage(1)
    load(1)
  }, [source, tag, load])

  const handlePageChange = p => {
    setPage(p)
    load(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleTagSearch = e => {
    e.preventDefault()
    setTag(tagInput.trim())
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
      <header>
        <h1 className="font-display font-bold text-2xl gradient-text">热点探索</h1>
        <p className="text-gray-dim text-sm mt-1">浏览所有采集到的热点内容</p>
      </header>

      {/* 过滤工具栏 */}
      <div className="flex flex-wrap items-center gap-3">
        {/* 来源过滤 */}
        <div className="flex gap-1 flex-wrap" role="group" aria-label="按来源过滤">
          {SOURCES.map(s => (
            <button
              key={s}
              onClick={() => setSource(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                source === s
                  ? 'bg-cyan-neon/10 text-cyan-neon border border-cyan-neon/30'
                  : 'text-gray-dim border border-white/10 hover:border-white/25 hover:text-slate-200'
              }`}
              aria-pressed={source === s}
            >
              {s === '全部' ? '全部来源' : s}
            </button>
          ))}
        </div>

        {/* 标签搜索 */}
        <form onSubmit={handleTagSearch} className="flex gap-2 ml-auto">
          <input
            className="input-field py-1.5 w-40 text-sm"
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            placeholder="标签过滤…"
            aria-label="按标签过滤"
          />
          <button type="submit" className="btn-ghost text-xs px-3 py-1.5">搜索</button>
          {tag && (
            <button
              type="button"
              onClick={() => { setTag(''); setTagInput('') }}
              className="btn-ghost text-xs px-3 py-1.5 text-red-alert border-red-alert/20"
            >
              清除
            </button>
          )}
        </form>
      </div>

      {/* 当前标签提示 */}
      {tag && (
        <p className="text-sm text-cyan-neon -mt-2">
          已过滤标签: <span className="font-mono bg-cyan-neon/10 px-2 py-0.5 rounded">{tag}</span>
        </p>
      )}

      {/* 热点网格 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="glass-card h-36 skeleton" />
          ))}
        </div>
      ) : topics.length === 0 ? (
        <div className="glass-card p-12 text-center text-gray-dim flex flex-col items-center gap-3">
          <span className="text-5xl opacity-20" aria-hidden="true">⊞</span>
          <p>暂无匹配热点</p>
          {(source !== '全部' || tag) && (
            <button
              onClick={() => { setSource('全部'); setTag(''); setTagInput('') }}
              className="btn-ghost text-xs"
            >
              清除筛选
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-dim -mt-3">共 {total} 条，第 {page} / {totalPages} 页</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
            {topics.map(t => <TopicCard key={t.id} topic={t} />)}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <nav className="flex justify-center gap-2 pt-2" aria-label="分页导航">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="btn-ghost text-sm px-4"
                aria-label="上一页"
              >
                ← 上一页
              </button>
              <span className="flex items-center text-sm text-gray-dim font-mono px-3">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="btn-ghost text-sm px-4"
                aria-label="下一页"
              >
                下一页 →
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  )
}

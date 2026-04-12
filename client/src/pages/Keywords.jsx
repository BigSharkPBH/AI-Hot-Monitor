import { useState, useEffect, useCallback } from 'react'
import { api } from '../api'

export default function Keywords() {
  const [keywords, setKeywords] = useState([])
  const [inputVal, setInputVal] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    api.getKeywords()
      .then(res => setKeywords(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleAdd = async e => {
    e.preventDefault()
    const word = inputVal.trim()
    if (!word) return
    setAdding(true)
    setError('')
    try {
      await api.addKeyword(word)
      setInputVal('')
      load()
    } catch (err) {
      setError(err.message || '添加失败')
    } finally {
      setAdding(false)
    }
  }

  const handleToggle = async id => {
    try {
      await api.toggleKeyword(id)
      load()
    } catch {}
  }

  const handleDelete = async id => {
    if (!window.confirm('确认删除该关键词？')) return
    try {
      await api.deleteKeyword(id)
      load()
    } catch {}
  }

  const active = keywords.filter(k => k.is_active)
  const inactive = keywords.filter(k => !k.is_active)

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
      <header>
        <h1 className="font-display font-bold text-2xl gradient-text">关键词管理</h1>
        <p className="text-gray-dim text-sm mt-1">
          添加AI领域关键词，系统每次采集后自动命中匹配
        </p>
      </header>

      {/* 添加关键词 */}
      <section aria-label="添加关键词">
        <form onSubmit={handleAdd} className="flex gap-3 max-w-xl">
          <div className="flex-1">
            <input
              className="input-field"
              type="text"
              value={inputVal}
              onChange={e => { setInputVal(e.target.value); setError('') }}
              placeholder="输入关键词，如: GPT-4o、Claude、AI Agent…"
              maxLength={80}
              aria-label="关键词"
              disabled={adding}
            />
            {error && (
              <p className="text-red-alert text-xs mt-1" role="alert">{error}</p>
            )}
          </div>
          <button type="submit" className="btn-primary" disabled={adding || !inputVal.trim()}>
            {adding ? (
              <span className="inline-block w-4 h-4 border-2 border-t-transparent rounded-full border-current animate-spin" aria-label="添加中" />
            ) : '+ 添加'}
          </button>
        </form>
      </section>

      {/* 关键词列表 */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-card h-12 skeleton" />
          ))}
        </div>
      ) : keywords.length === 0 ? (
        <div className="glass-card p-10 text-center text-gray-dim flex flex-col items-center gap-3">
          <span className="text-4xl opacity-30" aria-hidden="true">⌖</span>
          <p>暂无关键词，添加后开始监控</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* 监控中 */}
          {active.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-cyan-neon animate-pulse" aria-hidden="true" />
                <h2 className="text-sm font-semibold text-cyan-neon font-mono">监控中 ({active.length})</h2>
              </div>
              <div className="flex flex-col gap-1.5">
                {active.map(kw => (
                  <KeywordRow key={kw.id} kw={kw} onToggle={handleToggle} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}

          {/* 已暂停 */}
          {inactive.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-dim font-mono mb-2">已暂停 ({inactive.length})</h2>
              <div className="flex flex-col gap-1.5">
                {inactive.map(kw => (
                  <KeywordRow key={kw.id} kw={kw} onToggle={handleToggle} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function KeywordRow({ kw, onToggle, onDelete }) {
  const [toggling, setToggling] = useState(false)

  const handleToggle = async () => {
    setToggling(true)
    await onToggle(kw.id)
    setToggling(false)
  }

  return (
    <div
      className={`glass-card px-4 py-3 flex items-center gap-3 ${kw.is_active ? '' : 'opacity-50'}`}
      role="listitem"
    >
      {/* 状态指示 */}
      <span
        className={`w-2 h-2 rounded-full flex-shrink-0 ${kw.is_active ? 'bg-cyan-neon shadow-[0_0_6px_var(--cyan)]' : 'bg-gray-500'}`}
        aria-hidden="true"
      />

      {/* 关键词文字 */}
      <span className="flex-1 text-sm font-mono text-slate-200 truncate">
        {kw.word}
      </span>

      {/* 操作按钮 */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleToggle}
          disabled={toggling}
          className="btn-ghost text-xs py-1 px-3"
          aria-label={kw.is_active ? '暂停监控' : '恢复监控'}
        >
          {toggling ? '…' : kw.is_active ? '暂停' : '恢复'}
        </button>
        <button
          onClick={() => onDelete(kw.id)}
          className="btn-ghost text-xs py-1 px-3 text-red-alert border-red-alert/20 hover:border-red-alert/40"
          aria-label={`删除关键词 ${kw.word}`}
        >
          删除
        </button>
      </div>
    </div>
  )
}

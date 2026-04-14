import { useState, useEffect, useCallback } from 'react'
import { api } from '../api'
import { LiveDot } from '../components/Aceternity'

export default function Keywords() {
  const [keywords, setKeywords] = useState([])
  const [inputVal, setInputVal] = useState('')
  const [loading,  setLoading]  = useState(true)
  const [adding,   setAdding]   = useState(false)
  const [error,    setError]    = useState('')

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
    setAdding(true); setError('')
    try { await api.addKeyword(word); setInputVal(''); load() }
    catch (err) { setError(err.message || '添加失败') }
    finally { setAdding(false) }
  }

  const handleToggle = async id => {
    try { await api.toggleKeyword(id); load() } catch {}
  }

  const handleDelete = async id => {
    if (!window.confirm('确认删除该关键词？')) return
    try { await api.deleteKeyword(id); load() } catch {}
  }

  const active   = keywords.filter(k =>  k.is_active)
  const inactive = keywords.filter(k => !k.is_active)

  return (
    <div className="p-6 flex flex-col gap-5 max-w-2xl">
      <header>
        <h1 className="font-bold text-xl gradient-text">关键词管理</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>添加 AI 领域关键词，采集后自动命中匹配</p>
      </header>

      {/* 添加 */}
      <section aria-label="添加关键词">
        <form onSubmit={handleAdd} className="flex gap-2">
          <div className="flex-1">
            <input
              className="input-field"
              type="text"
              value={inputVal}
              onChange={e => { setInputVal(e.target.value); setError('') }}
              placeholder="如: GPT-4o、Claude、Cursor、AI Agent…"
              maxLength={80}
              aria-label="关键词输入"
              disabled={adding}
            />
            {error && <p className="text-xs mt-1" style={{ color: 'var(--alert)' }} role="alert">{error}</p>}
          </div>
          <button type="submit" className="btn btn-signal" disabled={adding || !inputVal.trim()}>
            {adding
              ? <span className="inline-block w-3.5 h-3.5 border-2 border-t-transparent rounded-full border-current animate-spin" />
              : '添加'}
          </button>
        </form>
      </section>

      {/* 列表 */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12 rounded-[10px]" />)}
        </div>
      ) : keywords.length === 0 ? (
        <div className="card p-10 text-center flex flex-col items-center gap-3">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ color: 'var(--text-3)' }} aria-hidden="true">
            <path d="M4 9h28M4 18h18M4 27h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3"/>
          </svg>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>暂无关键词，添加后开始监控</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {active.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <LiveDot />
                <h2 className="text-xs font-semibold font-mono" style={{ color: 'var(--flux)' }}>监控中 ({active.length})</h2>
              </div>
              <div className="flex flex-col gap-1.5">
                {active.map(kw => <KeywordRow key={kw.id} kw={kw} onToggle={handleToggle} onDelete={handleDelete} />)}
              </div>
            </div>
          )}
          {inactive.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold font-mono mb-2" style={{ color: 'var(--text-3)' }}>已暂停 ({inactive.length})</h2>
              <div className="flex flex-col gap-1.5">
                {inactive.map(kw => <KeywordRow key={kw.id} kw={kw} onToggle={handleToggle} onDelete={handleDelete} />)}
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
      className="card px-4 py-3 flex items-center gap-3"
      style={!kw.is_active ? { opacity: 0.4 } : {}}
      role="listitem"
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: kw.is_active ? 'var(--emerald)' : 'var(--text-3)' }}
        aria-hidden="true"
      />
      <span className="flex-1 text-sm font-mono truncate" style={{ color: 'var(--text-1)' }}>{kw.word}</span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleToggle}
          disabled={toggling}
          className="btn btn-ghost text-xs py-1 px-3"
          aria-label={kw.is_active ? '暂停监控' : '恢复监控'}
        >
          {toggling ? '…' : kw.is_active ? '暂停' : '恢复'}
        </button>
        <button
          onClick={() => onDelete(kw.id)}
          className="btn btn-danger text-xs py-1 px-3"
          aria-label={`删除关键词 ${kw.word}`}
        >
          删除
        </button>
      </div>
    </div>
  )
}

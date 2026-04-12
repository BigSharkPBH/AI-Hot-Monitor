import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Keywords from './pages/Keywords'
import Explorer from './pages/Explorer'
import Notifications from './pages/Notifications'

// 注册 Service Worker
function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    })
  }
}

export default function App() {
  useEffect(registerSW, [])

  return (
    <Layout>
      <Routes>
        <Route path="/"              element={<Dashboard />} />
        <Route path="/keywords"      element={<Keywords />} />
        <Route path="/explorer"      element={<Explorer />} />
        <Route path="/notifications" element={<Notifications />} />
        {/* 404 兜底 */}
        <Route path="*" element={
          <div className="flex-1 flex items-center justify-center p-8 text-gray-dim flex-col gap-4">
            <span className="text-6xl opacity-20" aria-hidden="true">404</span>
            <p>页面不存在</p>
          </div>
        } />
      </Routes>
    </Layout>
  )
}

// 前端 API 请求封装，统一处理错误
const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

export const api = {
  // Keywords
  getKeywords: () => request('/keywords'),
  addKeyword: word => request('/keywords', { method: 'POST', body: { word } }),
  toggleKeyword: id => request(`/keywords/${id}`, { method: 'PATCH' }),
  deleteKeyword: id => request(`/keywords/${id}`, { method: 'DELETE' }),

  // Topics
  getTopics: params => {
    const qs = new URLSearchParams(params).toString()
    return request(`/topics${qs ? `?${qs}` : ''}`)
  },
  getStats: () => request('/topics/stats'),
  triggerCollect: () => request('/topics/collect', { method: 'POST' }),

  // Notifications
  getNotifications: params => {
    const qs = new URLSearchParams(params).toString()
    return request(`/notifications${qs ? `?${qs}` : ''}`)
  },
  getUnreadCount: () => request('/notifications/unread-count'),
  markRead: id => request(`/notifications/${id}`, { method: 'PATCH' }),
  markAllRead: () => request('/notifications/all', { method: 'PATCH' }),

  // Push
  getVapidKey: () => request('/push/vapid-public-key'),
  subscribePush: sub => request('/push/subscribe', { method: 'POST', body: sub }),
  unsubscribePush: endpoint => request('/push/unsubscribe', { method: 'DELETE', body: { endpoint } }),

  // Config
  getConfig: () => request('/config'),
  updateConfig: cfg => request('/config', { method: 'PUT', body: cfg }),
}

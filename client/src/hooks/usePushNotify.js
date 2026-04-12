import { useState, useEffect, useCallback } from 'react'
import { api } from '../api'

// 将 VAPID base64url 公钥转换为 Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(ch => ch.charCodeAt(0)))
}

export function usePushNotify() {
  const [isPushEnabled, setIsPushEnabled] = useState(false)
  const [pushLoading, setPushLoading] = useState(false)
  const isPushSupported =
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window

  // 检测当前订阅状态
  useEffect(() => {
    if (!isPushSupported) return
    navigator.serviceWorker.ready
      .then(reg => reg.pushManager.getSubscription())
      .then(sub => setIsPushEnabled(!!sub))
      .catch(() => {})
  }, [isPushSupported])

  const subscribePush = useCallback(async () => {
    const reg = await navigator.serviceWorker.ready
    const { publicKey } = await api.getVapidKey()
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    })
    await api.subscribePush(sub.toJSON())
    setIsPushEnabled(true)
  }, [])

  const unsubscribePush = useCallback(async () => {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) {
      await api.unsubscribePush(sub.endpoint)
      await sub.unsubscribe()
    }
    setIsPushEnabled(false)
  }, [])

  const togglePush = useCallback(async () => {
    // 先请求通知权限
    if (!isPushEnabled) {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') {
        alert('请在浏览器设置中允许通知权限后再试')
        return
      }
    }
    setPushLoading(true)
    try {
      if (isPushEnabled) {
        await unsubscribePush()
      } else {
        await subscribePush()
      }
    } catch (err) {
      console.error('[Push]', err)
      alert('Push 操作失败：' + (err.message || '未知错误'))
    } finally {
      setPushLoading(false)
    }
  }, [isPushEnabled, subscribePush, unsubscribePush])

  return { isPushEnabled, isPushSupported, togglePush, pushLoading }
}

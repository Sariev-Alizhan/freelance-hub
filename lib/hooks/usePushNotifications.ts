'use client'
import { useState, useEffect, useCallback } from 'react'

type PushState = 'unsupported' | 'denied' | 'granted' | 'default' | 'loading'

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const arr = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i)
  return arr.buffer
}

function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false
  if (!('serviceWorker' in navigator)) return false
  if (!('PushManager' in window)) return false
  if (!('Notification' in window)) return false
  return true
}

export function usePushNotifications() {
  const [state, setState] = useState<PushState>('loading')
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)

  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim()

  useEffect(() => {
    if (!isPushSupported() || !vapidKey) {
      setState('unsupported')
      return
    }

    const perm = Notification.permission
    if (perm === 'denied') { setState('denied'); return }

    navigator.serviceWorker.ready
      .then(reg => reg.pushManager.getSubscription())
      .then(sub => {
        setSubscription(sub)
        setState(sub ? 'granted' : perm === 'granted' ? 'granted' : 'default')
      })
      .catch(() => setState('unsupported'))
  }, [vapidKey])

  const subscribe = useCallback(async () => {
    if (!vapidKey || !isPushSupported()) return
    setState('loading')
    try {
      // Some browsers need explicit permission request first
      const permission = await Notification.requestPermission()
      if (permission === 'denied') { setState('denied'); return }
      if (permission !== 'granted') { setState('default'); return }

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })
      setSubscription(sub)
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      })
      setState('granted')
    } catch (err) {
      console.error('[push] subscribe error:', err)
      setState(Notification.permission === 'denied' ? 'denied' : 'default')
    }
  }, [vapidKey])

  const unsubscribe = useCallback(async () => {
    if (!subscription) return
    setState('loading')
    try {
      await fetch('/api/push/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      })
      await subscription.unsubscribe()
    } catch (err) {
      console.error('[push] unsubscribe error:', err)
    }
    setSubscription(null)
    setState('default')
  }, [subscription])

  return { state, subscription, subscribe, unsubscribe }
}

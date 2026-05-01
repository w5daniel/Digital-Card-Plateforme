import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getNotifications, markAllRead, deleteNotification } from '../api/notifications'

export const useNotificationStore = defineStore('notification', () => {
  // ── Toasts (éphémères) ────────────────────────────────────────────────────
  const notifications = ref([])

  const addNotification = (message, type = 'info', duration = 3000) => {
    const id = Date.now()
    const notification = {
      id,
      message,
      type, // 'success', 'error', 'info', 'warning'
      duration,
      timerId: null,
    }

    notifications.value.push(notification)

    if (duration > 0) {
      notification.timerId = setTimeout(() => {
        removeNotification(id)
      }, duration)
    }

    // Chaque toast est aussi archivé dans l'inbox
    addToInbox(message, type)

    return id
  }

  const removeNotification = (id) => {
    const notif = notifications.value.find((n) => n.id === id)
    if (notif?.timerId) clearTimeout(notif.timerId)
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }

  const _showToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random()
    const toast = { id, message, type, duration, timerId: null }
    notifications.value.push(toast)
    if (duration > 0) {
      toast.timerId = setTimeout(() => removeNotification(id), duration)
    }
  }

  const clearAllToasts = () => {
    notifications.value.forEach((n) => { if (n.timerId) clearTimeout(n.timerId) })
    notifications.value = []
  }

  const success = (message, duration) => addNotification(message, 'success', duration ?? 3000)
  const error   = (message, duration) => addNotification(message, 'error',   duration ?? 4000)
  const info    = (message, duration) => addNotification(message, 'info',    duration ?? 3000)
  const warning = (message, duration) => addNotification(message, 'warning', duration ?? 3500)

  // ── Inbox (persistant — centre de notifications) ──────────────────────────
  const inbox = ref([]) // [{ id, message, type, timestamp, read }]

  const unreadCount = computed(() => inbox.value.filter((n) => !n.read).length)

  const addToInbox = (message, type = 'info') => {
    inbox.value.unshift({
      id: Date.now() + Math.random(), // évite collision si appelé très rapidement
      message,
      type,
      timestamp: new Date(),
      read: false,
    })
    // Garder max 50 notifications dans l'inbox
    if (inbox.value.length > 50) inbox.value = inbox.value.slice(0, 50)
  }

  const loadFromApi = async () => {
    try {
      const { data } = await getNotifications()
      let hasNew = false
      for (const n of data) {
        if (inbox.value.some((i) => i._apiId === n.id)) continue
        inbox.value.push({
          id:        n.id,
          message:   n.data.message,
          type:      n.data.type ?? 'info',
          timestamp: new Date(n.created_at),
          read:      false,
          _apiId:    n.id,
        })
        _showToast(n.data.message, n.data.type ?? 'info')
        hasNew = true
      }
      if (inbox.value.length > 50) inbox.value = inbox.value.slice(0, 50)
      if (hasNew) markAllRead().catch(() => {})
    } catch { /* silencieux si non connecté */ }
  }

  const markAsRead = (id) => {
    const notif = inbox.value.find((n) => n.id === id)
    if (notif) notif.read = true
  }

  const markAllAsRead = () => {
    inbox.value.forEach((n) => (n.read = true))
  }

  const clearInbox = () => {
    inbox.value = []
  }

  const markAllAsReadAndSync = async () => {
    markAllAsRead()
    try { await markAllRead() } catch { /* ignore */ }
  }

  const removeFromInbox = async (id) => {
    const notif = inbox.value.find((n) => n.id === id)
    inbox.value = inbox.value.filter((n) => n.id !== id)
    if (notif?._apiId) {
      try { await deleteNotification(notif._apiId) } catch { /* ignore */ }
    }
  }

  return {
    // toasts
    notifications,
    addNotification,
    removeNotification,
    clearAllToasts,
    success,
    error,
    info,
    warning,
    // inbox
    inbox,
    unreadCount,
    addToInbox,
    loadFromApi,
    markAsRead,
    markAllAsRead,
    markAllAsReadAndSync,
    removeFromInbox,
    clearInbox,
  }
})

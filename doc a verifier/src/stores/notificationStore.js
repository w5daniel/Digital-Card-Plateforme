import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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
    }

    notifications.value.push(notification)

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }

    // Chaque toast est aussi archivé dans l'inbox
    addToInbox(message, type)

    return id
  }

  const removeNotification = (id) => {
    notifications.value = notifications.value.filter((n) => n.id !== id)
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

  return {
    // toasts
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    info,
    warning,
    // inbox
    inbox,
    unreadCount,
    addToInbox,
    markAsRead,
    markAllAsRead,
    clearInbox,
  }
})

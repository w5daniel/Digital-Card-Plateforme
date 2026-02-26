import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
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

    return id
  }

  const removeNotification = (id) => {
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }

  const success = (message, duration) => addNotification(message, 'success', duration ?? 3000)
  const error = (message, duration) => addNotification(message, 'error', duration ?? 4000)
  const info = (message, duration) => addNotification(message, 'info', duration ?? 3000)
  const warning = (message, duration) => addNotification(message, 'warning', duration ?? 3500)

  return {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    info,
    warning,
  }
})

import api from './axios'

export const getNotifications  = ()    => api.get('/api/notifications')
export const markAllRead       = ()    => api.patch('/api/notifications/read-all')
export const deleteNotification = (id) => api.delete(`/api/notifications/${id}`)

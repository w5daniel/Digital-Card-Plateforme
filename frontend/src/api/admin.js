import api from './axios'

// Config publique (sans auth)
export const getPublicConfig = () => api.get('/api/config')

// Settings admin
export const getSettings    = ()       => api.get('/api/admin/settings')
export const updateSettings = (data)   => api.put('/api/admin/settings', data)

// Users
export const getUsers    = ()         => api.get('/api/admin/users')
export const updateUser  = (id, data) => api.patch(`/api/admin/users/${id}`, data)
export const deleteUser  = (id)       => api.delete(`/api/admin/users/${id}`)

// Cards
export const getCards   = ()   => api.get('/api/admin/cards')
export const deleteCard = (id) => api.delete(`/api/admin/cards/${id}`)

// Templates
export const getTemplates     = ()         => api.get('/api/admin/templates')
export const createTemplate   = (data)     => api.post('/api/admin/templates', data)
export const updateTemplate   = (id, data) => api.patch(`/api/admin/templates/${id}`, data)
export const deleteTemplate   = (id)       => api.delete(`/api/admin/templates/${id}`)

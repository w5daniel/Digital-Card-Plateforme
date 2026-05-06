import api from './axios'

export const getGallery = () => api.get('/api/gallery')

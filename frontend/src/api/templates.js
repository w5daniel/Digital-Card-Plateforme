import api from './axios'

export default {
  list:       ()             => api.get('/api/templates'),
  create:     (payload)      => api.post('/api/templates', payload),
  get:        (id)           => api.get(`/api/templates/${id}`),
  update:     (id, payload)  => api.put(`/api/templates/${id}`, payload),
  remove:     (id)           => api.delete(`/api/templates/${id}`),
  community:  ()             => api.get('/api/templates/community'),
  gallery:    ()             => api.get('/api/gallery'),
  galleryOne: (slug)         => api.get(`/api/gallery/${slug}`),
}

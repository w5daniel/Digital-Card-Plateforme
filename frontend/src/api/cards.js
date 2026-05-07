import api from './axios'

export default {
  list:          ()            => api.get('/api/cards'),
  create:        (payload)     => api.post('/api/cards', payload),
  get:           (id)          => api.get(`/api/cards/${id}`),
  update:        (id, payload) => api.put(`/api/cards/${id}`, payload),
  remove:        (id)          => api.delete(`/api/cards/${id}`),
  incrementStat:       (id, stat) => api.post(`/api/cards/${id}/stats`, { stat }),
  incrementPublicStat: (id, stat) => api.post(`/api/share/${id}/stats`, { stat }),
  getPublic:     (id)          => api.get(`/api/share/${id}`),
}

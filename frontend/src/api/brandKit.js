import api from './axios'

export const getBrandKit = () => api.get('/api/brand-kit')

export const updateBrandKit = (payload) => api.put('/api/brand-kit', payload)

export const uploadLogo = (file) => {
  const form = new FormData()
  form.append('logo', file)
  return api.post('/api/brand-kit/logo', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const deleteLogo = () => api.delete('/api/brand-kit/logo')

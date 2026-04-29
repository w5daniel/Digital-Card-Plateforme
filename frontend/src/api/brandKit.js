import api from './axios'

export const getBrandKit = () => api.get('/brand-kit')

export const updateBrandKit = (payload) => api.put('/brand-kit', payload)

export const uploadLogo = (file) => {
  const form = new FormData()
  form.append('logo', file)
  return api.post('/brand-kit/logo', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const deleteLogo = () => api.delete('/brand-kit/logo')

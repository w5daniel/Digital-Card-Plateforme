import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 403 && error.response?.data?.suspended) {
      const { useAuthStore } = await import('@/stores/authStore')
      await useAuthStore().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default api

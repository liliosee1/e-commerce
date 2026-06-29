import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://e-commas-apis-production-e0f8.up.railway.app/api'
})

api.interceptors.response.use(
  res => res,
  err => {
    //  global error handling
    if (!err.response) {
      return Promise.reject({ message: 'Network error' })
    }
    return Promise.reject(err.response.data || err)
  }
)

export default api

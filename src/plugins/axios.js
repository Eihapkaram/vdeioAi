// src/plugins/axios.js
import axios from 'axios'

const api = axios.create({
  baseURL: 'https://partridgelike-undelusively-gael.ngrok-free.dev/api/v1',
  timeout: 600000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  'ngrok-skip-browser-warning': 'bypass-please'
  },
})

// Interceptor للتعامل مع الأخطاء
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  },
)

export default {
  install(app) {
    app.config.globalProperties.$api = api
    app.provide('api', api)
  },
}

export { api }

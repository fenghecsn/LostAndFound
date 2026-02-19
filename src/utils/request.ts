import axios from "axios";
import { ElMessage } from 'element-plus'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''

const request= axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
})

request.interceptors.request.use(
  (config) => {
    const method = (config.method || 'get').toLowerCase()
    if ((method === 'get' || method === 'delete') && config.headers) {
      const headers = config.headers as any
      if (typeof headers.delete === 'function') {
        headers.delete('Content-Type')
      } else {
        delete headers['Content-Type']
        delete headers['content-type']
      }
    }

    const token = localStorage.getItem('token')
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

request.interceptors.response.use(
  (response) => response,
  (error) => {
    ElMessage.error(error?.response?.data?.msg || '请求失败，请稍后重试')
    return Promise.reject(error)
  }
)

export default request

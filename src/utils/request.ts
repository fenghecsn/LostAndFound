import axios from "axios";
import { ElMessage } from 'element-plus'

const request= axios.create({
  baseURL:"https://m1.apifoxmock.com/m1/7803476-7550431-7135491"
})

request.interceptors.request.use(
  (config) => {
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

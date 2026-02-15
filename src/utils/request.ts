import axios from "axios";
import { ElMessage } from 'element-plus'

const request= axios.create({
  // 改成真实后端地址，例如：
  // baseURL: 'http://localhost:8080',
  // 原来的 Mock 地址：
  //你用了本地mock，我这是云端mock地址，后端接口开发好记得改回来
  baseURL: 'https://m1.apifoxmock.com/m1/7803476-7550431-7135491/',
  timeout: 15000,
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

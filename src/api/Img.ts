//上传图片至服务器
import request from '@/utils/request'
export const uploadImageApi = (data: FormData) => {
  const token = localStorage.getItem('token') || ''
  return request ({
    headers: {
      Authorization: token ? `Bearer ${token}` : ''//移除了手动 Content-Type（让浏览器自动带 boundary，避免上传失败）。
    },
    url: '/api/v1/upload/image',
    method: 'post',
    data
  })
}

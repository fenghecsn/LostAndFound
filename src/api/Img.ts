//上传图片至服务器
import request from '@/utils/request'
export const uploadImageApi = (data: FormData) => {
  return request ({
    url: '/api/v1/upload/image',
    method: 'post',
    data
  })
}

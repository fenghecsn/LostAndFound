import request from '@/utils/request'


// 登录参数类型
export interface LoginParams {
  role: number // 角色类型,1:学生/老师, 2:失物招领管理员, 3:系统管理员
  username: string
  password: string
}

// 登录接口
export const loginApi = (params: LoginParams) => {
  return request ({
    "headers":{
      "Content-Type": "application/json",
    } ,
    url: '/api/v1/login',
    method: 'post',
    data: params
  })
}

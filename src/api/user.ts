import request from '@/utils/request'


// 登录参数类型
export interface LoginParams {
  role: number // 角色类型,1:学生/老师, 2:失物招领管理员, 3:系统管理员
  username: string
  password: string
}

// 获取用户信息参数类型
export interface GetUserInfoParams {
  username: string
}

export interface ChangePasswordParams {
  old_password: string
  new_password: string
}
// 登录接口
export const loginApi = (params: LoginParams) => {
  return request ({
    "headers":{
      "Content-Type": "application/json",
    } ,
    url: '/api/v1/login?apifoxApiId=418131352',
    method: 'post',
    data: params
  })
}
// 获取用户信息接口
export const getUserInfoApi = (params: GetUserInfoParams) => {
  return request ({
    "headers":{
      "Content-Type": "application/json",
    } ,
    url: '/api/v1/profile',
    method: 'get',
    params
  })
}
// 修改密码接口
export const changePasswordApi = (data: ChangePasswordParams) => {
  return request ({
    "headers":{
      "Content-Type": "application/json",
    } ,
    url: '/api/v1/password',
    method: 'put',
    data
  })
}

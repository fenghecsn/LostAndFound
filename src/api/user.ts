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

export type MyItemStatus = '' | '待审核' | '已通过' | '已匹配' | '已认领' | '已驳回'

export interface MyItemsParams {
  status?: MyItemStatus
  page_num?: number
  page_size?: number
}

export interface MyItemPublisher {
  ID?: number
  Username?: string
  name?: string
  nickname?: string
  phone?: string
}

export interface MyItem {
  ID?: number
  id?: number
  title?: string
  type?: string
  campus?: string
  category?: string
  location?: string
  time?: string
  description?: string
  img1?: string
  img2?: string
  img3?: string
  img4?: string
  contact_name?: string
  contact_phone?: string
  is_bounty?: boolean
  status?: string
  publisher_id?: number
  publisher?: MyItemPublisher
  CreatedAt?: string
  UpdatedAt?: string
  DeletedAt?: string | null
  reject_reason?: string | null
  process_method?: string | null
}

export interface GetMyItemsResponse {
  code: number
  msg: string
  data: {
    list: MyItem[]
    total: number
  }
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
// 获取我的发布列表接口
export const getMyItemsApi = (params: MyItemsParams) => {
  return request<GetMyItemsResponse>({
    headers: {
      'Content-Type': 'application/json'
    },
    url: '/api/v1/my/items?apifoxApiId=418131351',
    method: 'get',
    params
  })
}

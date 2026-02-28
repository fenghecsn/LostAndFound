import request from '@/utils/request'

export interface RawItemFromApi {
  id?: number
  ID?: number
  name?: string
  title?: string
  type?: number | 'lost' | 'found'
  campus?: string
  category?: string
  location?: string
  event_time?: string
  time?: string
  description?: string
  cover_image?: string
  img1?: string
  img2?: string
  img3?: string
  img4?: string
  images?: string[]
  reward?: number
  bounty?: number
  contact_method?: string
  contact_person?: string
  contact_name?: string
  contact_phone?: string
  status?: number | 'pending' | 'approved' | 'displaying' | 'matched' | 'claimed' | 'archived' | 'rejected'
  create_time?: string
  CreatedAt?: string
  UpdatedAt?: string
  DeletedAt?: string | null
}

export interface Item {
  id: number
  type: number | 'lost' | 'found' // 1/lost: Lost, 2/found: Found
  name: string
  campus: string
  location: string
  event_time: string
  cover_image: string
  status: number | 'pending' | 'approved' | 'displaying' | 'matched' | 'claimed' | 'archived' | 'rejected' // 兼容文档字符串状态
  description?: string
  category?: string
  reward?: number
  contact_method?: string//增加弹窗会用到的可选字段
  contact_person?: string//增加弹窗会用到的可选字段
  images?: string[]
  img1?: string
  img2?: string
  img3?: string
  img4?: string
  time?: string
  contact_name?: string
  contact_phone?: string
  create_time?: string
  CreatedAt?: string
  status_text?: string
}

export interface ItemDetailResponse {
  code: number
  msg: string
  data: RawItemFromApi
}

export interface ItemListResponse {
  code: number
  msg: string
  data: {
    list: RawItemFromApi[]
    total: number
  }
}

export interface ItemQuery {
  lost_or_found?: number//1: lost, 2: found
  campus?: string
  location?: string//粗略搜索
  status?: 'pending' | 'approved' | 'matched' | 'claimed' | 'archived' | 'rejected'
  page_num?: number
  page_size?: number
  days?: number
  category?: string
}

export const getItems = (params: ItemQuery) => {
  return request<ItemListResponse>({
    "headers":{
      "Content-Type": "application/json",
    } ,
    url: '/api/v1/items',
    method: 'get',
    params: params
  })
}
// 获取物品详情接口
export const getItemDetail = (id: number) => {
  return request<ItemDetailResponse>({
    headers: {
      'Content-Type': 'application/json',
    },
    url: `/api/v1/items/${id}`,
    method: 'get',
  })
}


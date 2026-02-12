import request from '@/utils/request'

export interface Item {
  id: number
  type: number // 1: Lost, 2: Found
  name: string
  campus: string
  location: string
  event_time: string
  cover_image: string
  status: number // 1: Displaying, 2: Matched, 3: Claimed
  description?: string
  category?: string
  reward?: number
  create_time?: string
  contact_method?: string//增加弹窗会用到的可选字段
  contact_person?: string//增加弹窗会用到的可选字段
  images?: string[]
}

export interface ItemQuery {
  type?: number
  keyword?: string
  campus?: string
  location?: string
  status?: number
  page?: number
  size?: number
  time_range?: string
  category?: string
  reward?: number
}

export const getItems = (params: ItemQuery) => {
  return request ({
    "headers":{
      "Content-Type": "application/json",
    } ,
    url: '/api/v1/items',
    method: 'get',
    params: params
  })
}


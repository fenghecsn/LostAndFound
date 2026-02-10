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

export interface PageResult<T> {
  code: number
  msg: string
  data: {
    total: number
    list: T[]
  }
}

export const getItems = (params: ItemQuery) => {
  return request.get<any, PageResult<Item>>('/api/v1/items', {
    params
  })
}

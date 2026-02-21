import request from '@/utils/request'

export interface ActivitiesParams {
  page_num: number
  page_size: number
}

export type ActivityType = 'status_update' | 'claim_received' | string
export type ItemStatus = 'pending' | 'approved' | 'matched' | 'claimed' | 'rejected' | string

export interface ActivityItem {
  type?: ActivityType
  title?: string
  time?: string
  item_id?: number
  peer_user_id?: number
  item_name?: string
  loss_time?: string
  location?: string
  img?: string
  item_status?: ItemStatus
  claim_id?: number
  claimant_name?: string
  reject_reason?: string
  process_method?: string
}

export interface ActivitiesResponse {
  code: number
  msg: string
  data: {
    list: ActivityItem[]
    total: number
  }
}

export const getActivitiesApi = (params: ActivitiesParams) => {
  return request<ActivitiesResponse>({
    headers: {
      'Content-Type': 'application/json'
    },
    url: '/api/v1/activities',
    method: 'get',
    params
  })
}

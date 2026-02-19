//申请认领的接口
import request from '@/utils/request'
export interface ClaimItemPayload {
  item_id: number
  proof?: string
  img?: string
}
export interface ClaimItemResponse {
  code: number
  msg: string
  data: null
}
//获取失物招领列表的接口
export const claimItemApi = (data: ClaimItemPayload) => {
  return request<ClaimItemResponse>({
    headers: {
      'Content-Type': 'application/json'
    },
    url: 'api/v1/claim',
    method: 'post',
    data
  })
}

export interface ClaimProgressParams {
  page_num: number
  page_size: number
}

export interface ClaimProgressItem {
  type?: 'claim_rejected' | 'claim_pending' | 'claim_approved' | string
  title?: string
  hint?: string
  action_text?: string
  time?: string
  claim_id?: number
  item_id?: number
  peer_user_id?: number
  item_name?: string
  loss_time?: string
  location?: string
  img?: string
  claim_status?: 'approved' | 'pending' | 'rejected' | string
  reject_reason?: string
}

export interface ClaimProgressResponse {
  code: number
  msg: string
  data: {
    list: ClaimProgressItem[]
    total: number
  }
}
//获取认领进度的接口
export const getClaimProgressApi = (params: ClaimProgressParams) => {
  return request<ClaimProgressResponse>({
    headers: {
      'Content-Type': 'application/json'
    },
    url: '/api/v1/claims/progress',
    method: 'get',
    params
  })
}

export interface ClaimReasonPageParams {
 id: number
}
export interface ClaimReasonResponse {
  code: number
  msg: string
  data: {
    reject_reason: string
  }
}
//查看认领进度原因的接口
export const getClaimReasonApi = (params: ClaimReasonPageParams) => {
  return request<ClaimReasonResponse>({
    headers: {
      'Content-Type': 'application/json'
    },
    url: `/api/v1/claims/${params.id}/reason`,
    method: 'get',
  })
}

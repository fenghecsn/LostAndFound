//申请认领的接口
import request from '@/utils/request'
export interface ClaimItemPayload {
  item_id: number
  proof?: string
  img1?: string
  img2?: string
  img3?: string
  img4?: string
}
export interface ClaimItemResponse {
  code: number
  msg: string
  data: null
}
export const claimItemApi = (data: ClaimItemPayload) => {
  return request<ClaimItemResponse>({
    headers: {
      'Content-Type': 'application/json'
    },
    url: 'api/v1/claims?apifoxApiId=418131339',
    method: 'post',
    data
  })
}

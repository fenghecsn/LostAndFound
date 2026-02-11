import request from '@/utils/request'

// 1. 定义数据结构 (跟 Apifox 返回的一样)
export interface AuditItem {
  id: number
  type: number // 1:失物 2:招领
  title: string // 注意：Apifox 里定义的叫 title 还是 name？保持一致
  content: string
  images: string[]
  location: string
  event_time: string
  username: string
  contact: string
  status: number // 0:待审核 1:通过 2:驳回
  create_time: string
}

// 2. 获取审核列表
// 对应 Apifox: GET /api/admin/posts?status=0
export const getAuditList = (params: { status: number, page?: number, size?: number }) => {
  return request({
    url: '/api/admin/posts', // 确保这个路径跟你 Apifox 里的“管理员获取列表”一致
    method: 'get',
    params
  })
}

// 3. 审核操作 (通过/驳回)
// 对应 Apifox: POST /api/admin/audit
export const auditItem = (data: { id: number, status: number, reason?: string }) => {
  return request({
    url: '/api/admin/audit', // 确保这个路径一致
    method: 'post',
    data
  })
}
import request from '@/utils/request'

// ==================== 类型定义 ====================

export interface PaginationParams {
  page?: number
  pageSize?: number
}

/** 创建管理员请求 */
export interface CreateAdminRequest {
  username: string
  name: string
  password: string
}

/** 更新用户状态请求 */
export interface UpdateUserStatusRequest {
  is_active: boolean
}

/** 创建系统公告请求 */
export interface CreateAnnouncementRequest {
  title: string
  content: string
  is_top?: boolean
  type?: string
}

/** 审核公告请求（body 里传 id + status） */
export interface ReviewAnnouncementRequest {
  id: number
  status: 'approved' | 'rejected'
}

/** 添加物品分类请求 */
export interface AddCategoryRequest {
  name: string
}

/** 回复反馈请求 */
export interface ReplyFeedbackRequest {
  reply: string
}

/** 数据清理请求 */
export interface CleanupRequest {
  days: number
}

// ==================== 仪表盘与数据中心 ====================

/** 获取系统统计数据 */
export function getSuperStats() {
  return request.get('/api/v1/super/stats')
}

/** 清理过期数据 */
export function cleanupExpiredData(data: CleanupRequest) {
  return request.post('/api/v1/super/data/cleanup', data)
}

// ==================== 账号与权限管理 ====================

/** 获取用户列表 */
export function getUserList(params?: PaginationParams & { role?: number; keyword?: string }) {
  return request.get('/api/v1/super/users', {
    params: {
      page_num: params?.page || 1,
      page_size: params?.pageSize || 10,
      role: params?.role,
      keyword: params?.keyword,
    }
  })
}

/** 创建失物招领管理员 */
export function createAdmin(data: CreateAdminRequest) {
  return request.post('/api/v1/super/users/admin', data)
}

/** 禁用/启用账号 */
export function updateUserStatus(id: number, data: UpdateUserStatusRequest) {
  return request.put(`/api/v1/super/users/${id}/status`, data)
}

// ==================== 公告管理 ====================

/** 获取公告列表 */
export function getAnnouncements(params?: PaginationParams) {
  return request.get('/api/v1/super/announcements', {
    params: {
      page_num: params?.page || 1,
      page_size: params?.pageSize || 50,
    }
  })
}

/** 发布系统公告 */
export function createSystemAnnouncement(data: CreateAnnouncementRequest) {
  return request.post('/api/v1/super/announcements', data)
}

/** 审核公告（通过/拒绝）—— body 传 { id, status } */
export function reviewAnnouncement(data: ReviewAnnouncementRequest) {
  return request.put('/api/v1/super/announcements/review', data)
}

/** 删除公告 */
export function deleteAnnouncement(id: number) {
  return request.delete(`/api/v1/super/announcements/${id}`)
}

// ==================== 系统参数设置 ====================

/** 获取分类列表（公共接口） */
export function getCategoryList() {
  return request.get('/api/v1/kinds')
}

/** 添加物品分类 */
export function addCategory(data: AddCategoryRequest) {
  return request.post('/api/v1/super/categories', data)
}

/** 删除物品分类 */
export function deleteCategory(id: number) {
  return request.delete(`/api/v1/super/categories/${id}`)
}

// ==================== 反馈中心 ====================

/** 获取用户反馈列表 */
export function getFeedbacks(params?: PaginationParams & { status?: string }) {
  return request.get('/api/v1/super/feedbacks', {
    params: {
      page_num: params?.page || 1,
      page_size: params?.pageSize || 10,
      status: params?.status,
    }
  })
}

/** 回复反馈 */
export function replyFeedback(id: number, data: ReplyFeedbackRequest) {
  return request.put(`/api/v1/super/feedbacks/${id}/reply`, data)
}
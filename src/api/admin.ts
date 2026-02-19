import request from '@/utils/request'

// ==================== 类型定义 ====================

/** 驳回审核请求 - internal_controllers.RejectRecordRequest */
export interface RejectRecordRequest {
  reject_reason: string
}

/** 归档帖子请求 - internal_controllers.ArchiveRecordRequest */
export interface ArchiveRecordRequest {
  process_method: string
}

/** 分页参数 */
export interface PaginationParams {
  page?: number
  pageSize?: number
}

/** 物品列表筛选参数 */
export interface ItemListParams extends PaginationParams {
  status?: string
  type?: string
  keyword?: string
  time_range?: string
  lost_or_found?: string | number
  campus?: string
  category?: string
}

/** 管理员更新物品请求 - 与 UpdateRecordRequest 字段一致 */
export interface AdminUpdateItemRequest {
  title?: string
  category?: string
  campus?: string
  location?: string
  time?: string
  description?: string
  contact_name?: string
  contact_phone?: string
  img1?: string
  img2?: string
  img3?: string
  img4?: string
  status?: string
  process_method?: string
}

// ==================== 物品管理 ====================

/** 管理员获取物品列表 */
export function getAllItems(params?: ItemListParams) {
  return request.get('/api/v1/admin/items', {
    params: {
      page_num: params?.page || 1,
      page_size: params?.pageSize || 10,
      status: params?.status,
      lost_or_found: params?.lost_or_found,
      campus: params?.campus,
      category: params?.category,
      keyword: params?.keyword,
      time_range: params?.time_range,
    }
  })
}

/** 管理员获取待审核物品 */
export function getPendingItems(params?: PaginationParams) {
  return request.get('/api/v1/admin/items/pending', {
    params: { page_num: params?.page || 1, page_size: params?.pageSize || 10 }
  })
}

/** 通过审核 */
export function approveItem(id: number) {
  return request.put(`/api/v1/admin/items/${id}/approve`)
}

/** 驳回审核 */
export function rejectItem(id: number, data: RejectRecordRequest) {
  return request.put(`/api/v1/admin/items/${id}/reject`, data)
}

/** 归档物品 */
export function archiveItem(id: number, data: ArchiveRecordRequest) {
  return request.put(`/api/v1/admin/items/${id}/archive`, data)
}

/** 管理员更新物品 */
export function updateItem(id: number, data: AdminUpdateItemRequest) {
  return request.put(`/api/v1/admin/items/${id}`, data)
}

// ==================== 认领管理 ====================

/** 管理员获取待审核认领 */
export function getPendingClaims(params?: PaginationParams) {
  return request.get('/api/v1/admin/claims/pending', {
    params: { page_num: params?.page || 1, page_size: params?.pageSize || 10 }
  })
}

/** 通过认领 */
export function approveClaim(id: number) {
  return request.put(`/api/v1/admin/claims/${id}/approve`)
}

/** 驳回认领（部分后端支持驳回原因） */
export function rejectClaim(id: number, data?: RejectRecordRequest) {
  return request.put(`/api/v1/admin/claims/${id}/reject`, data)
}

// ==================== 公告管理 ====================

/** 获取公告列表（SuperAdmin 接口，Admin 也调用） */
export function getAnnouncements(params?: PaginationParams) {
  return request.get('/api/v1/super/announcements', {
    params: { page_num: params?.page || 1, page_size: params?.pageSize || 50 }
  })
}

/** 管理员发布区域公告 */
export function createAnnouncement(data: { title: string; content: string; is_top?: boolean }) {
  return request.post('/api/v1/admin/announcements', data)
}

// ==================== 数据统计 ====================

/** 获取系统统计数据 */
export function getDashboardStats() {
  return request.get('/api/v1/admin/stats')
}

/** 导出统计数据 (CSV) */
export function exportStatsCSV() {
  return request.get('/api/v1/admin/export', {
    responseType: 'blob'  // CSV 文件需要 blob 类型
  })
}

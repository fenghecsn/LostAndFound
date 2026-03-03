import request from '@/utils/request'

// ==================== 绫诲瀷瀹氫箟 ====================

/** 椹冲洖瀹℃牳璇锋眰 - internal_controllers.RejectRecordRequest */
export interface RejectRecordRequest {
  reject_reason: string
}

/** 褰掓。甯栧瓙璇锋眰 - internal_controllers.ArchiveRecordRequest */
export interface ArchiveRecordRequest {
  process_method: string
}

/** 鍒嗛〉鍙傛暟 */
export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface AnnouncementQueryParams extends PaginationParams {
  status?: string
  type?: string
  region?: string
}

/** 鐗╁搧鍒楄〃绛涢€夊弬鏁?*/
export interface ItemListParams extends PaginationParams {
  status?: string
  type?: string
  keyword?: string
  time_range?: string
  lost_or_found?: string | number
  campus?: string
  category?: string
}

/** 绠＄悊鍛樻洿鏂扮墿鍝佽姹?- 涓?UpdateRecordRequest 瀛楁涓€鑷?*/
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

// ==================== 鐗╁搧绠＄悊 ====================

/** 绠＄悊鍛樿幏鍙栫墿鍝佸垪琛?*/
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

/** 绠＄悊鍛樿幏鍙栧緟瀹℃牳鐗╁搧 */
export function getPendingItems(params?: PaginationParams) {
  return request.get('/api/v1/admin/items/pending', {
    params: { page_num: params?.page || 1, page_size: params?.pageSize || 10 }
  })
}

/** 閫氳繃瀹℃牳 */
export function approveItem(id: number) {
  return request.put(`/api/v1/admin/items/${id}/approve`)
}

/** 椹冲洖瀹℃牳 */
export function rejectItem(id: number, data: RejectRecordRequest) {
  return request.put(`/api/v1/admin/items/${id}/reject`, data)
}

/** 褰掓。鐗╁搧 */
export function archiveItem(id: number, data: ArchiveRecordRequest) {
  return request.put(`/api/v1/admin/items/${id}/archive`, data)
}

/** 绠＄悊鍛樻洿鏂扮墿鍝?*/
export function updateItem(id: number, data: AdminUpdateItemRequest) {
  return request.put(`/api/v1/admin/items/${id}`, data)
}

// ==================== 璁ら绠＄悊 ====================

/** 绠＄悊鍛樿幏鍙栧緟瀹℃牳璁ら */
export function getPendingClaims(params?: PaginationParams) {
  return request.get('/api/v1/admin/claims/pending', {
    params: { page_num: params?.page || 1, page_size: params?.pageSize || 10 }
  })
}

/** 閫氳繃璁ら */
export function approveClaim(id: number) {
  return request.put(`/api/v1/admin/claims/${id}/approve`)
}

/** 椹冲洖璁ら锛堥儴鍒嗗悗绔敮鎸侀┏鍥炲師鍥狅級 */
export function rejectClaim(id: number, data?: RejectRecordRequest) {
  return request.put(`/api/v1/admin/claims/${id}/reject`, data)
}

// ==================== 鍏憡绠＄悊 ====================

/** 鑾峰彇鍏憡鍒楄〃锛圫uperAdmin 鎺ュ彛锛孉dmin 涔熻皟鐢級 */
export async function getAnnouncements(params?: AnnouncementQueryParams) {
  const query = {
    page_num: params?.page || 1,
    page_size: params?.pageSize || 50,
    status: params?.status,
    type: params?.type,
    region: params?.region,
  }
  try {
    return await request.get('/api/v1/super/announcements', { params: query, silentError: true } as any)
  } catch (error: unknown) {
    const status = Number(((error as { response?: { status?: number } })?.response?.status) || 0)
    if (status === 403 || status === 404) {
      return request.get('/api/v1/announcements', {
        params: {
          page_num: query.page_num,
          page_size: query.page_size,
        },
        silentError: true,
      } as any)
    }
    throw error
  }
}

/** 绠＄悊鍛樺彂甯冨尯鍩熷叕鍛?*/
export async function createAnnouncement(data: { title: string; content: string; type?: string; region: string; is_top?: boolean }) {
  try {
    return await request.post('/api/v1/admin/announcements', data)
  } catch (err: unknown) {
    const httpError = err as { response?: { status?: number } } | undefined
    if (Number(httpError?.response?.status || 0) === 404) {
      return request.post('/api/v1/admin/announcement', data)
    }
    throw err
  }
}

// ==================== 鏁版嵁缁熻 ====================

/** 鑾峰彇绯荤粺缁熻鏁版嵁 */
export function getDashboardStats() {
  return request.get('/api/v1/admin/stats')
}

/** 瀵煎嚭缁熻鏁版嵁 (CSV) */
export function exportStatsCSV() {
  return request.get('/api/v1/admin/export', {
    responseType: 'blob'  // CSV 鏂囦欢闇€瑕?blob 绫诲瀷
  })
}


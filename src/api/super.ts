import request from '@/utils/request'

export interface ApiResponse<T = unknown> {
  code: number
  msg: string
  data: T
}

export interface PageResponse<T> {
  list: T[]
  total: number
}

export interface PageParams {
  page_num: number
  page_size: number
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface User {
  ID: number
  username: string
  name: string
  nickname: string
  phone: string
  role: number
  is_active: boolean
  avatar: string
  CreatedAt: string
}

export interface Announcement {
  ID: number
  title: string
  content: string
  type: string
  publisher: string
  is_top: boolean
  status: string
  region?: string
  CreatedAt: string
}

export interface Feedback {
  ID: number
  type: string
  content: string
  contact: string
  status: string
  reply?: string
  CreatedAt: string
}

export interface Category {
  id: number
  kind_name: string
}

export interface GetUsersParams extends PageParams {
  role?: number
  keyword?: string
}

export interface CreateAdminRequest {
  username: string
  password: string
  name: string
}

export interface UpdateUserStatusRequest {
  is_active: boolean
}

export interface CreateSystemAnnouncementRequest {
  title: string
  content: string
  type: string
  is_top?: boolean
}

export interface ReviewAnnouncementRequest {
  id: number
  status: 'published' | 'rejected' | 'approved'
}

export interface GetFeedbacksParams extends PageParams {
  status?: string
}

export interface ReplyFeedbackRequest {
  reply: string
}

export interface CleanupRequest {
  days: number
}

export interface AddCategoryRequest {
  name: string
}

export interface SendMessageRequest {
  receiver_id: number
  content: string
  type?: number
  item_id?: number
}

export interface SuperStats {
  total_users?: number
  active_users?: number
  total_items?: number
  solved_items?: number
  total_claims?: number
  today_items?: number
  [key: string]: unknown
}

export interface UpdateUserRequest {
  username?: string
  name?: string
  nickname?: string
  phone?: string
  role?: number
  is_active?: boolean
  avatar?: string
}

type UserListCompatParams = PaginationParams & {
  page_num?: number
  page_size?: number
  role?: number
  keyword?: string
}

type AnnouncementCompatParams = PaginationParams & {
  page_num?: number
  page_size?: number
}

type FeedbackCompatParams = PaginationParams & {
  page_num?: number
  page_size?: number
  status?: string
}

export const getSuperStatsApi = () =>
  request<ApiResponse<SuperStats>>({
    url: '/api/v1/super/stats',
    method: 'GET',
  })

export const cleanupDataApi = (data: CleanupRequest) =>
  request<ApiResponse<null>>({
    url: '/api/v1/super/data/cleanup',
    method: 'POST',
    data,
  })

export const getUsersApi = (params: GetUsersParams) =>
  request<ApiResponse<PageResponse<User>>>({
    url: '/api/v1/super/users',
    method: 'GET',
    params,
  })

export const createAdminApi = (data: CreateAdminRequest) =>
  request<ApiResponse<null>>({
    url: '/api/v1/super/users/admin',
    method: 'POST',
    data,
  })

export const updateUserStatusApi = (id: number, data: UpdateUserStatusRequest) =>
  request<ApiResponse<null>>({
    url: `/api/v1/super/users/${id}/status`,
    method: 'PUT',
    data,
  })

export const getAnnouncementsApi = (params: PageParams) =>
  request<ApiResponse<PageResponse<Announcement>>>({
    url: '/api/v1/super/announcements',
    method: 'GET',
    params,
  })

export const createSystemAnnouncementApi = (data: CreateSystemAnnouncementRequest) =>
  request<ApiResponse<null>>({
    url: '/api/v1/super/announcements',
    method: 'POST',
    data,
  })

export const reviewAnnouncementApi = (data: ReviewAnnouncementRequest) =>
  request<ApiResponse<null>>({
    url: '/api/v1/super/announcements/review',
    method: 'PUT',
    data,
  })

export const deleteAnnouncementApi = (id: number) =>
  request<ApiResponse<null>>({
    url: `/api/v1/super/announcements/${id}`,
    method: 'DELETE',
  })

export const getFeedbacksApi = (params: GetFeedbacksParams) =>
  request<ApiResponse<PageResponse<Feedback>>>({
    url: '/api/v1/super/feedbacks',
    method: 'GET',
    params,
  })

export const replyFeedbackApi = (id: number, data: ReplyFeedbackRequest) =>
  request<ApiResponse<null>>({
    url: `/api/v1/super/feedbacks/${id}/reply`,
    method: 'PUT',
    data,
  })

export const getCategoriesApi = () =>
  request<ApiResponse<Category[]>>({
    url: '/api/v1/kinds',
    method: 'GET',
  })

export const addCategoryApi = (data: AddCategoryRequest) =>
  request<ApiResponse<null>>({
    url: '/api/v1/super/categories',
    method: 'POST',
    data,
  })

export const deleteCategoryApi = (id: number) =>
  request<ApiResponse<null>>({
    url: `/api/v1/super/categories/${id}`,
    method: 'DELETE',
  })

export const sendMessageApi = (data: SendMessageRequest) =>
  request<ApiResponse<null>>({
    url: '/api/v1/messages',
    method: 'POST',
    data,
  })

export const updateUserApi = (id: number, data: UpdateUserRequest) =>
  request<ApiResponse<null>>({
    url: `/api/v1/super/users/${id}`,
    method: 'PUT',
    data,
  })

export const deleteUserApi = (id: number) =>
  request<ApiResponse<null>>({
    url: `/api/v1/super/users/${id}`,
    method: 'DELETE',
  })

export const getUserList = (params?: UserListCompatParams) => {
  const newParams = {
    ...params,
    page_num: params?.page || params?.page_num || 1,
    page_size: params?.pageSize || params?.page_size || 10,
  }
  return getUsersApi(newParams as GetUsersParams)
}

export const getSuperStats = getSuperStatsApi
export const cleanupExpiredData = cleanupDataApi

export const getAnnouncements = (params?: AnnouncementCompatParams) => {
  const newParams = {
    ...params,
    page_num: params?.page || params?.page_num || 1,
    page_size: params?.pageSize || params?.page_size || 10,
  }
  return getAnnouncementsApi(newParams as PageParams)
}

export const createSystemAnnouncement = createSystemAnnouncementApi
export const reviewAnnouncement = reviewAnnouncementApi
export const deleteAnnouncement = deleteAnnouncementApi
export const getCategoryList = getCategoriesApi
export const addCategory = addCategoryApi
export const deleteCategory = deleteCategoryApi
export const updateUserStatus = updateUserStatusApi
export const createAdmin = createAdminApi
export const sendMessage = sendMessageApi
export const updateUser = updateUserApi
export const deleteUser = deleteUserApi

export const getFeedbacks = (params?: FeedbackCompatParams) => {
  const newParams = {
    ...params,
    page_num: params?.page || params?.page_num || 1,
    page_size: params?.pageSize || params?.page_size || 10,
  }
  return getFeedbacksApi(newParams as GetFeedbacksParams)
}

export const replyFeedback = replyFeedbackApi

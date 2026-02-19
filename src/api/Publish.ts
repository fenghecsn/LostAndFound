//发布丢失或捡到的帖子
import request from '@/utils/request'

export type PublishType = 'lost' | 'found'

export interface PublishItemPayload {
	title: string
	type: PublishType
	campus?: string
	category?: string
	location?: string
	time?: string
	description?: string
	img1?: string
	img2?: string
	img3?: string
	img4?: string
	contact_name?: string
	contact_phone?: string
	bounty?: number
}

export interface PublishItemResponse {
	code: number
	msg: string
	data: null
}

export interface UpdateMyItemPayload {
	title?: string
	campus?: string
	category?: string
	location?: string
	time?: string
	description?: string
	img1?: string
	img2?: string
	img3?: string
	img4?: string
	contact_name?: string
	contact_phone?: string
}

export const publishItemApi = (data: PublishItemPayload) => {
	return request<PublishItemResponse>({
		headers: {
			'Content-Type': 'application/json'
		},
		url: '/api/v1/items',
		method: 'post',
		data
	})
}

export const updateMyItemApi = (id: number, data: UpdateMyItemPayload) => {
	return request<PublishItemResponse>({
		headers: {
			'Content-Type': 'application/json'
		},
		url: `/api/v1/items/${id}`,
		method: 'put',
		data
	})
}

export const deleteMyItemApi = (id: number) => {
	return request<PublishItemResponse>({
		headers: {
			'Content-Type': 'application/json'
		},
		url: `/api/v1/items/${id}`,
		method: 'delete'
	})
}

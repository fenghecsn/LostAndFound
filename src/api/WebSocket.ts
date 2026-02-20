export type MessageScope = 'dialog' | 'activity' | 'claim_progress' | 'announcement'
// 来自服务器的消息更新负载
export type WsUpdatePayload = {
	type?: string | number
	scope?: MessageScope | string
	has_new?: boolean
	unread_count?: number
	ref_id?: number
	at?: string
	is_read?: boolean
	[key: string]: unknown
}

export const buildMessageWsUrl = () => {
	const envUrl = String(import.meta.env.VITE_WS_URL || '').trim()
	if (envUrl) return envUrl
	return 'ws://127.0.0.1:8080/api/v1/ws'
}

export const buildMessageWsUrlWithToken = (token?: string) => {
	const baseUrl = buildMessageWsUrl()
	if (!token) return baseUrl
	const separator = baseUrl.includes('?') ? '&' : '?'
	return `${baseUrl}${separator}token=${encodeURIComponent(token)}`
}

export const createHeartbeatPayload = () => {
	return {
		type: 'ping',
		at: new Date().toISOString()
	}
}

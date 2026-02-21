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

const toWsBase = (value: string) => {
	const trimmed = String(value || '').trim().replace(/\/+$/, '')
	if (!trimmed) return ''
	if (trimmed.startsWith('ws://') || trimmed.startsWith('wss://')) return trimmed
	if (trimmed.startsWith('http://')) return trimmed.replace('http://', 'ws://')
	if (trimmed.startsWith('https://')) return trimmed.replace('https://', 'wss://')
	return trimmed
}

const ensureWsPath = (wsBase: string) => {
	if (!wsBase) return ''
	if (wsBase.endsWith('/api/v1/ws')) return wsBase
	return `${wsBase}/api/v1/ws`
}

export const buildMessageWsUrl = () => {
	const explicitWsUrl = ensureWsPath(toWsBase(String(import.meta.env.VITE_WS_URL || '')))
	if (explicitWsUrl) return explicitWsUrl

	const apiBaseUrl = ensureWsPath(toWsBase(String(import.meta.env.VITE_API_BASE_URL || '')))
	if (apiBaseUrl) return apiBaseUrl

	const proxyTarget = ensureWsPath(toWsBase(String(import.meta.env.VITE_DEV_PROXY_TARGET || '')))
	if (proxyTarget) return proxyTarget

	if (typeof window !== 'undefined') {
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
		return `${protocol}//${window.location.host}/api/v1/ws`
	}

	return 'ws://47.98.193.254:80/api/v1/ws'
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

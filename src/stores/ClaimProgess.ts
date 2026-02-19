import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

type ClaimProgressSocketPayload = {
	type?: string
	event?: string
	topic?: string
	unread_count?: number
	unreadCount?: number
	data?: Record<string, unknown>
}

const CLAIM_PROGRESS_UNREAD_KEY = 'claim_progress_unread_count'

const parseUnreadValue = (value: unknown): number | null => {
	const parsed = Number(value)
	if (!Number.isFinite(parsed) || parsed < 0) return null
	return Math.floor(parsed)
}

const normalizeWsBase = (value: string) => {
	if (!value) return ''
	if (value.startsWith('ws://') || value.startsWith('wss://')) return value
	if (value.startsWith('http://')) return value.replace('http://', 'ws://')
	if (value.startsWith('https://')) return value.replace('https://', 'wss://')
	return value
}

const buildDefaultWsUrl = () => {
	const explicit = normalizeWsBase(
		String(import.meta.env.VITE_CLAIM_PROGRESS_WS_URL || import.meta.env.VITE_WS_URL || '').trim()
	)
	if (explicit) return explicit

	const proxyTarget = normalizeWsBase(String(import.meta.env.VITE_DEV_PROXY_TARGET || '').trim())
	if (proxyTarget) return `${proxyTarget.replace(/\/$/, '')}/api/v1/ws/claims/progress`

	if (typeof window === 'undefined') return ''
	const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
	return `${protocol}//${window.location.host}/api/v1/ws/claims/progress`
}

const maybeClaimProgressEvent = (eventType: string) => {
	if (!eventType) return false
	const normalized = eventType.toLowerCase()
	return (
		normalized.includes('claim.progress') ||
		normalized.includes('claim_progress') ||
		normalized.includes('claims/progress') ||
		normalized.includes('claim-progress')
	)
}

export const useClaimProgressStore = defineStore('claim-progress', () => {
	const unreadCount = ref<number>(Number(localStorage.getItem(CLAIM_PROGRESS_UNREAD_KEY) || 0) || 0)
	const socket = ref<WebSocket | null>(null)
	const isConnected = ref(false)
	const isConnecting = ref(false)
	const reconnectAttempts = ref(0)
	const reconnectTimer = ref<number | null>(null)
	const manuallyClosed = ref(false)

	const hasUnread = computed(() => unreadCount.value > 0)

	const persistUnread = () => {
		localStorage.setItem(CLAIM_PROGRESS_UNREAD_KEY, String(unreadCount.value))
	}

	const setUnreadCount = (count: number) => {
		unreadCount.value = Math.max(0, Math.floor(count))
		persistUnread()
	}

	const increaseUnread = (delta = 1) => {
		setUnreadCount(unreadCount.value + Math.max(0, Math.floor(delta)))
	}

	const clearUnread = () => {
		setUnreadCount(0)
	}

	const clearReconnectTimer = () => {
		if (reconnectTimer.value !== null) {
			window.clearTimeout(reconnectTimer.value)
			reconnectTimer.value = null
		}
	}

	const scheduleReconnect = () => {
		if (manuallyClosed.value || reconnectTimer.value !== null) return
		const delay = Math.min(30000, 1000 * 2 ** reconnectAttempts.value)
		reconnectTimer.value = window.setTimeout(() => {
			reconnectTimer.value = null
			initConnection()
		}, delay)
		reconnectAttempts.value += 1
	}

	const resolveUnreadFromPayload = (payload: ClaimProgressSocketPayload): number | null => {
		const direct = parseUnreadValue(payload.unread_count ?? payload.unreadCount)
		if (direct !== null) return direct

		const nested = payload.data || {}
		const nestedUnread = parseUnreadValue(
			nested.unread_count ?? nested.unreadCount ?? nested.progress_unread_count ?? nested.claim_progress_unread
		)
		return nestedUnread
	}

	const handleMessage = (rawData: string) => {
		let payload: ClaimProgressSocketPayload | null = null
		try {
			payload = JSON.parse(rawData)
		} catch {
			return
		}
		if (!payload) return

		const eventType = String(payload.type || payload.event || payload.topic || '')
		const unreadFromPayload = resolveUnreadFromPayload(payload)

		if (unreadFromPayload !== null && maybeClaimProgressEvent(eventType)) {
			setUnreadCount(unreadFromPayload)
			return
		}

		if (maybeClaimProgressEvent(eventType)) {
			increaseUnread(1)
			return
		}

		if (!eventType && unreadFromPayload !== null) {
			setUnreadCount(unreadFromPayload)
		}
	}

	const getConnectionUrl = () => {
		const baseUrl = buildDefaultWsUrl()
		if (!baseUrl) return ''

		const token = localStorage.getItem('token') || ''
		if (!token) return ''

		const separator = baseUrl.includes('?') ? '&' : '?'
		return `${baseUrl}${separator}token=${encodeURIComponent(token)}`
	}

	const initConnection = () => {
		if (socket.value || isConnecting.value) return
		const wsUrl = getConnectionUrl()
		if (!wsUrl) return

		manuallyClosed.value = false
		isConnecting.value = true
		const ws = new WebSocket(wsUrl)
		socket.value = ws

		ws.onopen = () => {
			isConnected.value = true
			isConnecting.value = false
			reconnectAttempts.value = 0
			clearReconnectTimer()
		}

		ws.onmessage = (event) => {
			handleMessage(String(event.data || ''))
		}

		ws.onerror = () => {
			isConnected.value = false
		}

		ws.onclose = () => {
			isConnected.value = false
			isConnecting.value = false
			socket.value = null
			if (!manuallyClosed.value) {
				scheduleReconnect()
			}
		}
	}

	const closeConnection = () => {
		manuallyClosed.value = true
		clearReconnectTimer()
		isConnecting.value = false
		reconnectAttempts.value = 0

		if (socket.value) {
			socket.value.close()
			socket.value = null
		}
		isConnected.value = false
	}

	return {
		unreadCount,
		hasUnread,
		isConnected,
		isConnecting,
		setUnreadCount,
		increaseUnread,
		clearUnread,
		initConnection,
		closeConnection
	}
})

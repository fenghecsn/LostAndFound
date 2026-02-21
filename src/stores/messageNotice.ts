import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { buildMessageWsUrlWithToken, createHeartbeatPayload } from '@/api/WebSocket'

export type MessageScope = 'dialog' | 'activity' | 'claim_progress' | 'announcement'

type ServerUpdatePayload = {
	type?: string | number
	scope?: MessageScope | string
	has_new?: boolean
	unread_count?: number
	is_read?: boolean
	data?: Record<string, unknown>
}

type ScopeUnreadMap = Record<MessageScope, number>

const UNREAD_STORAGE_KEY = 'message_scope_unread_map'
const HEARTBEAT_INTERVAL = 30000

const DEFAULT_UNREAD_MAP: ScopeUnreadMap = {
	dialog: 0,
	activity: 0,
	claim_progress: 0,
	announcement: 0
}

const cloneDefaultUnreadMap = (): ScopeUnreadMap => ({ ...DEFAULT_UNREAD_MAP })

const parseUnreadCount = (value: unknown): number | null => {
	const parsed = Number(value)
	if (!Number.isFinite(parsed) || parsed < 0) return null
	return Math.floor(parsed)
}

const isMessageScope = (value: unknown): value is MessageScope => {
	return value === 'dialog' || value === 'activity' || value === 'claim_progress' || value === 'announcement'
}

const loadUnreadMap = (): ScopeUnreadMap => {
	const raw = localStorage.getItem(UNREAD_STORAGE_KEY)
	if (!raw) return cloneDefaultUnreadMap()
	try {
		const parsed = JSON.parse(raw) as Partial<Record<MessageScope, unknown>>
		const next = cloneDefaultUnreadMap()
		;(Object.keys(next) as MessageScope[]).forEach((scope) => {
			const count = parseUnreadCount(parsed?.[scope])
			next[scope] = count ?? 0
		})
		return next
	} catch {
		return cloneDefaultUnreadMap()
	}
}

export const useMessageNoticeStore = defineStore('message-notice', () => {
	const unreadMap = ref<ScopeUnreadMap>(loadUnreadMap())
	const socket = ref<WebSocket | null>(null)
	const isConnected = ref(false)
	const isConnecting = ref(false)
	const reconnectAttempts = ref(0)
	const reconnectTimer = ref<number | null>(null)
	const heartbeatTimer = ref<number | null>(null)
	const manuallyClosed = ref(false)

	const unreadCount = computed(() => unreadMap.value.claim_progress)
	const hasUnread = computed(() => unreadMap.value.claim_progress > 0)

	const persistUnreadMap = () => {
		localStorage.setItem(UNREAD_STORAGE_KEY, JSON.stringify(unreadMap.value))
	}

	const setScopeUnread = (scope: MessageScope, count: number) => {
		unreadMap.value[scope] = Math.max(0, Math.floor(count))
		persistUnreadMap()
	}

	const increaseScopeUnread = (scope: MessageScope, delta = 1) => {
		setScopeUnread(scope, unreadMap.value[scope] + Math.max(0, Math.floor(delta)))
	}

	const clearScopeUnread = (scope: MessageScope) => {
		setScopeUnread(scope, 0)
	}

	const clearUnread = () => {
		clearScopeUnread('claim_progress')
	}

	const hasScopeUnread = (scope: MessageScope) => unreadMap.value[scope] > 0

	const clearReconnectTimer = () => {
		if (reconnectTimer.value !== null) {
			window.clearTimeout(reconnectTimer.value)
			reconnectTimer.value = null
		}
	}

	const clearHeartbeatTimer = () => {
		if (heartbeatTimer.value !== null) {
			window.clearInterval(heartbeatTimer.value)
			heartbeatTimer.value = null
		}
	}

	const sendHeartbeat = () => {
		if (!socket.value || socket.value.readyState !== WebSocket.OPEN) return
		socket.value.send(JSON.stringify(createHeartbeatPayload()))
	}

	const startHeartbeat = () => {
		clearHeartbeatTimer()
		heartbeatTimer.value = window.setInterval(() => {
			sendHeartbeat()
		}, HEARTBEAT_INTERVAL)
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

	const resolveScope = (payload: ServerUpdatePayload): MessageScope | null => {
		if (isMessageScope(payload.scope)) return payload.scope

		if (payload.type === 1 && payload.is_read === false) return 'dialog'

		const normalized = String(payload.type || '').toLowerCase()
		if (normalized.includes('dialog')) return 'dialog'
		if (normalized.includes('activity')) return 'activity'
		if (normalized.includes('claim_progress')) return 'claim_progress'
		if (normalized.includes('announcement')) return 'announcement'

		return null
	}

	const resolveUnread = (payload: ServerUpdatePayload): number | null => {
		const direct = parseUnreadCount(payload.unread_count)
		if (direct !== null) return direct
		return parseUnreadCount(payload.data?.unread_count)
	}

	const handleMessage = (rawData: string) => {
		let payload: ServerUpdatePayload | null = null
		try {
			payload = JSON.parse(rawData)
		} catch {
			return
		}

		if (!payload) return

		const scope = resolveScope(payload)
		if (!scope) return

		const unread = resolveUnread(payload)
		if (unread !== null) {
			setScopeUnread(scope, unread)
			return
		}

		if (payload.has_new === false || payload.is_read === true) {
			clearScopeUnread(scope)
			return
		}

		if (payload.has_new === true || payload.type === 'update' || payload.type === 1) {
			increaseScopeUnread(scope, 1)
		}
	}

	const getConnectionUrl = () => {
		const token = localStorage.getItem('token') || ''
		return buildMessageWsUrlWithToken(token)
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
			startHeartbeat()
			sendHeartbeat()
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
			clearHeartbeatTimer()
			if (!manuallyClosed.value) {
				scheduleReconnect()
			}
		}
	}

	const closeConnection = () => {
		manuallyClosed.value = true
		clearReconnectTimer()
		clearHeartbeatTimer()
		isConnecting.value = false
		reconnectAttempts.value = 0

		if (socket.value) {
			socket.value.close()
			socket.value = null
		}
		isConnected.value = false
	}

	return {
		unreadMap,
		unreadCount,
		hasUnread,
		isConnected,
		isConnecting,
		hasScopeUnread,
		setScopeUnread,
		clearScopeUnread,
		clearUnread,
		initConnection,
		closeConnection
	}
})

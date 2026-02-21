import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getChatList, type ChatSessionItem } from '@/api/chat'

export interface ChatSession {
  target_id: number
  target_name: string
  avatar: string
  last_msg: string
  last_time: string
  unread_count: number
}

const normalizeSession = (raw: ChatSessionItem): ChatSession | null => {
  const targetId = Number(raw.target_id ?? 0)
  if (!targetId) return null
  return {
    target_id: targetId,
    target_name: String(raw.target_name || `用户${targetId}`),
    avatar: String(raw.avatar || ''),
    last_msg: String(raw.last_msg || ''),
    last_time: String(raw.last_time || ''),
    unread_count: Math.max(0, Number(raw.unread_count || 0))
  }
}

export const useChatSessionStore = defineStore('chat-session', () => {
  const sessions = ref<ChatSession[]>([])
  const loading = ref(false)

  const fetchSessions = async () => {
    loading.value = true
    try {
      const response = await getChatList()
      if (Number(response?.data?.code) !== 200) {
        sessions.value = []
        return
      }
      const list = Array.isArray(response?.data?.data) ? response.data.data : []
      sessions.value = list
        .map((item) => normalizeSession(item))
        .filter((item): item is ChatSession => Boolean(item))
    } catch {
      sessions.value = []
    } finally {
      loading.value = false
    }
  }

  const ensureSession = (payload: Partial<ChatSession> & { target_id: number }) => {
    const targetId = Number(payload.target_id || 0)
    if (!targetId) return

    const index = sessions.value.findIndex((item) => item.target_id === targetId)
    const next: ChatSession = {
      target_id: targetId,
      target_name: payload.target_name || `用户${targetId}`,
      avatar: payload.avatar || '',
      last_msg: payload.last_msg || '',
      last_time: payload.last_time || '',
      unread_count: Math.max(0, Number(payload.unread_count || 0))
    }

    if (index >= 0) {
      sessions.value[index] = {
        ...sessions.value[index],
        ...next,
        target_id: targetId
      }
      return
    }

    sessions.value.unshift(next)
  }

  return {
    sessions,
    loading,
    fetchSessions,
    ensureSession
  }
})

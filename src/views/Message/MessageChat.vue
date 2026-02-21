<template>
  <div class="chat-page" v-loading="loading">
    <div class="item-info-card">
      <template v-if="itemInfo.item_name || itemInfo.loss_time || itemInfo.location">
        <div class="item-main">
          <p><strong>物品名称：</strong>{{ itemInfo.item_name || '-' }}</p>
          <p><strong>丢失时间：</strong>{{ formatLossTime(itemInfo.loss_time) }}</p>
          <p><strong>丢失地点：</strong>{{ itemInfo.location || '-' }}</p>
        </div>
        <el-image v-if="itemInfo.img" :src="normalizeResourceUrl(itemInfo.img)" fit="cover" class="item-image" />
      </template>
      <p v-else class="item-empty">暂无关联失物信息</p>

      <el-button v-if="showConfirmButton" type="warning" round class="confirm-btn" @click="handleConfirmClaim">
        确认招领
      </el-button>
    </div>

    <div class="message-list" ref="messageListRef">
      <el-empty v-if="!loading && messages.length === 0" description="暂无聊天记录" />

      <div v-for="msg in messages" :key="msg.ID || `${msg.CreatedAt}-${msg.content}`" class="message-row" :class="{ self: isSelfMessage(msg) }">
        <el-image :src="getMessageAvatar(msg)" fit="cover" class="message-avatar" />
        <div class="message-main">
          <div class="message-name">{{ getMessageName(msg) }}</div>
          <div class="message-bubble">{{ msg.content || '[空消息]' }}</div>
        </div>
      </div>
    </div>

    <div class="input-bar">
      <el-input
        v-model="content"
        type="textarea"
        :rows="2"
        resize="none"
        maxlength="300"
        show-word-limit
        placeholder="请输入消息"
        @keydown.enter.exact.prevent="handleSend"
      />
      <el-button type="primary" class="send-btn" :loading="sending" @click="handleSend">发送</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getChatHistory, sendMessage, signRead, type GetChatHistoryResponse } from '@/api/chat'
import { normalizeResourceUrl } from '@/utils/url'
import { useChatSessionStore } from '@/stores/chatSession'

const route = useRoute()
const chatSessionStore = useChatSessionStore()

const loading = ref(false)
const sending = ref(false)
const content = ref('')
const messageListRef = ref<HTMLElement | null>(null)
const messages = ref<GetChatHistoryResponse['data']['list']>([])

const activeTargetId = computed(() => Number(route.params.targetId || 0))

const itemInfo = computed(() => ({
  item_id: Number(route.query.item_id || 0),
  item_name: String(route.query.item_name || ''),
  loss_time: String(route.query.loss_time || ''),
  location: String(route.query.location || ''),
  img: String(route.query.img || '')
}))

const showConfirmButton = computed(() => String(route.query.can_confirm || '') === '1')

const getSelfName = () => String(localStorage.getItem('nickname') || localStorage.getItem('username') || '我')

const getSelfAvatar = () => String(localStorage.getItem('avatar') || '../../../public/头像框@7.png')

const getPeerName = () => String(route.query.target_name || `用户${activeTargetId.value}`)

const getPeerAvatar = () => {
  const matched = chatSessionStore.sessions.find((item) => item.target_id === activeTargetId.value)
  return String(matched?.avatar || '../../../public/头像框@7.png')
}

const getCurrentUserId = () => {
  const keys = ['user_id', 'userId', 'id', 'ID']
  for (const key of keys) {
    const value = Number(localStorage.getItem(key) || 0)
    if (value) return value
  }
  return 0
}

const getCurrentUsername = () => {
  return String(localStorage.getItem('username') || '')
}

const normalizeText = (value: unknown) => String(value || '').trim().toLowerCase()

const isPeerId = (id: unknown) => {
  const peerId = activeTargetId.value
  const parsed = Number(id || 0)
  return Boolean(peerId && parsed && parsed === peerId)
}

const isPeerName = (name: unknown) => {
  const peerName = normalizeText(route.query.target_name)
  const parsed = normalizeText(name)
  return Boolean(peerName && parsed && parsed === peerName)
}

const isSelfMessage = (msg: GetChatHistoryResponse['data']['list'][number]) => {
  const senderId = Number(msg.sender_id || msg.sender?.ID || 0)
  const receiverId = Number(msg.receiver_id || msg.receiver?.ID || 0)
  const senderName = normalizeText(msg.sender?.username || msg.sender?.nickname || msg.sender?.name)
  const receiverName = normalizeText(msg.receiver?.username || msg.receiver?.nickname || msg.receiver?.name)

  const currentUserId = getCurrentUserId()
  if (currentUserId) {
    if (senderId && senderId === currentUserId) return true
    if (receiverId && receiverId === currentUserId) return false
  }

  const currentUsername = getCurrentUsername()
  if (currentUsername) {
    const normalizedCurrent = normalizeText(currentUsername)
    if (senderName && senderName === normalizedCurrent) return true
    if (receiverName && receiverName === normalizedCurrent) return false
  }

  if (isPeerId(senderId)) return false
  if (isPeerId(receiverId)) return true

  if (isPeerName(senderName)) return false
  if (isPeerName(receiverName)) return true

  return false
}

const getMessageName = (msg: GetChatHistoryResponse['data']['list'][number]) => {
  if (isSelfMessage(msg)) {
    return String(msg.sender?.nickname || msg.sender?.name || msg.sender?.username || getSelfName())
  }
  return String(msg.sender?.nickname || msg.sender?.name || msg.sender?.username || getPeerName())
}

const getMessageAvatar = (msg: GetChatHistoryResponse['data']['list'][number]) => {
  if (isSelfMessage(msg)) {
    return normalizeResourceUrl(String(msg.sender?.avatar || getSelfAvatar()))
  }
  return normalizeResourceUrl(String(msg.sender?.avatar || getPeerAvatar()))
}

const formatLossTime = (value?: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const scrollToBottom = async () => {
  await nextTick()
  if (!messageListRef.value) return
  messageListRef.value.scrollTop = messageListRef.value.scrollHeight
}

const resolveHistoryList = (payload: unknown): GetChatHistoryResponse['data']['list'] => {
  if (Array.isArray(payload)) return payload as GetChatHistoryResponse['data']['list']
  if (!payload || typeof payload !== 'object') return []

  const dataObj = payload as Record<string, unknown>
  if (Array.isArray(dataObj.list)) return dataObj.list as GetChatHistoryResponse['data']['list']
  if (Array.isArray(dataObj.records)) return dataObj.records as GetChatHistoryResponse['data']['list']
  if (Array.isArray(dataObj.messages)) return dataObj.messages as GetChatHistoryResponse['data']['list']
  if (Array.isArray(dataObj.items)) return dataObj.items as GetChatHistoryResponse['data']['list']
  return []
}

const normalizeSortedHistory = (list: GetChatHistoryResponse['data']['list']) => {
  const copy = [...list]
  copy.sort((left, right) => {
    const leftTime = new Date(String(left.CreatedAt || left.UpdatedAt || '')).getTime()
    const rightTime = new Date(String(right.CreatedAt || right.UpdatedAt || '')).getTime()

    if (Number.isFinite(leftTime) && Number.isFinite(rightTime) && leftTime !== rightTime) {
      return leftTime - rightTime
    }

    const leftId = Number(left.ID || 0)
    const rightId = Number(right.ID || 0)
    if (leftId && rightId && leftId !== rightId) return leftId - rightId
    return 0
  })
  return copy
}

const loadHistory = async () => {
  if (!activeTargetId.value) {
    messages.value = []
    return
  }

  loading.value = true
  try {
    const response = await getChatHistory({
      target_id: activeTargetId.value,
      page_num: 1,
      page_size: 100
    })

    if (Number(response?.data?.code) !== 200) {
      messages.value = []
      ElMessage.warning(response?.data?.msg || '获取聊天记录失败')
      return
    }

    const list = resolveHistoryList(response?.data?.data)
    messages.value = normalizeSortedHistory(list)
    try {
      await signRead(activeTargetId.value)
    } catch {
    }
    await scrollToBottom()
  } catch {
    messages.value = []
    ElMessage.error('获取聊天记录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handleSend = async () => {
  const targetId = activeTargetId.value
  const text = content.value.trim()
  if (!targetId) {
    ElMessage.warning('目标会话无效')
    return
  }
  if (!text) {
    ElMessage.warning('请输入消息内容')
    return
  }

  sending.value = true
  try {
    await sendMessage({
      receiver_id: targetId,
      content: text,
      type: 1,
      item_id: itemInfo.value.item_id || undefined
    })
    content.value = ''
    await loadHistory()
    await chatSessionStore.fetchSessions()
  } catch {
    ElMessage.error('发送失败，请稍后重试')
  } finally {
    sending.value = false
  }
}

const handleConfirmClaim = () => {
  ElMessage.info('确认招领逻辑待接入接口')
}

watch(
  () => route.fullPath,
  async () => {
    const targetId = activeTargetId.value
    if (targetId) {
      chatSessionStore.ensureSession({
        target_id: targetId,
        target_name: String(route.query.target_name || `用户${targetId}`)
      })
    }
    await loadHistory()
  },
  { immediate: true }
)

onMounted(async () => {
  await chatSessionStore.fetchSessions()
})
</script>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 70vh;
}

.item-info-card {
  border: 1px solid #f6c27d;
  border-radius: 10px;
  background: #fff;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.item-main p {
  margin: 0 0 4px;
  color: #333;
}

.item-empty {
  margin: 0;
  color: #999;
}

.item-image {
  width: 68px;
  height: 68px;
  border-radius: 8px;
  overflow: hidden;
}

.confirm-btn {
  flex-shrink: 0;
}

.message-list {
  flex: 1;
  background: #fdf6ec;
  border-radius: 8px;
  padding: 16px;
  overflow-y: auto;
  min-height: 420px;
  max-height: 62vh;
}

.message-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
  width: 100%;
}

.message-row.self {
  justify-content: flex-end;
  flex-direction: row-reverse;
  margin-left: auto;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.message-main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  max-width: min(72%, 680px);
}

.message-row.self .message-main {
  align-items: flex-end;
}

.message-name {
  font-size: 12px;
  color: #8f8f8f;
}

.message-bubble {
  max-width: 100%;
  min-width: 64px;
  width: fit-content;
  background: #fff;
  border-radius: 6px;
  padding: 10px 12px;
  color: #333;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: normal;
  overflow-wrap: anywhere;
}

.message-row.self .message-bubble {
  background: #fef0db;
}

.input-bar {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.send-btn {
  height: 36px;
}
</style>

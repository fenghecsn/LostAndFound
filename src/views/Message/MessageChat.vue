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
        <div class="message-bubble">{{ msg.content || '[空消息]' }}</div>
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

const getCurrentUserId = () => {
  const keys = ['user_id', 'userId', 'id', 'ID']
  for (const key of keys) {
    const value = Number(localStorage.getItem(key) || 0)
    if (value) return value
  }
  return 0
}

const isSelfMessage = (msg: GetChatHistoryResponse['data']['list'][number]) => {
  const currentUserId = getCurrentUserId()
  if (currentUserId && Number(msg.sender_id || 0) === currentUserId) return true
  return Number(msg.receiver_id || 0) === activeTargetId.value
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

    const list = Array.isArray(response?.data?.data?.list) ? response.data.data.list : []
    messages.value = list
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
  margin-bottom: 12px;
}

.message-row.self {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 65%;
  background: #fff;
  border-radius: 6px;
  padding: 10px 12px;
  color: #333;
  line-height: 1.5;
  word-break: break-word;
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

<template>
  <div class="system-board">
    <div class="message-list" v-loading="loading">
      <el-empty v-if="!loading && announcements.length === 0" description="暂无系统消息" />

      <div
        v-for="item in announcements"
        :key="item.ID"
        class="message-row"
      >
        <div class="avatar-wrap">
          <div class="system-avatar">系统</div>
        </div>
        <div class="message-main">
          <div class="message-bubble">
            <div v-if="item.title" class="bubble-title">{{ item.title }}</div>
            <span>{{ item.content }}</span>
          </div>
          <div class="message-time">{{ formatTime(item.CreatedAt) }}</div>
        </div>
      </div>
    </div>

    <div class="footer-bar">
      <span class="no-reply">你没有权限回复</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAnnouncementsApi, type AnnouncementResponse } from '@/api/announcements'

type AnnouncementItem = AnnouncementResponse['data']['list'][number]

const loading = ref(false)
const announcements = ref<AnnouncementItem[]>([])

const formatTime = (value?: string) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
}

const fetchAnnouncements = async () => {
  loading.value = true
  try {
    const res = await getAnnouncementsApi({ page_num: 1, page_size: 100 })
    if (Number(res?.data?.code) === 200 && Array.isArray(res.data?.data?.list)) {
      announcements.value = res.data.data.list.filter(
        (item) => item.status !== 'deleted' && item.DeletedAt === null
      )
    } else {
      ElMessage.warning(res?.data?.msg || '获取系统消息失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取系统消息失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAnnouncements()
})
</script>

<style scoped>
.system-board {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 170px);
  min-height: 480px;
  overflow: hidden;
}

.message-list {
  flex: 1;
  background: #fdf6ec;
  border-radius: 8px;
  padding: 20px;
  overflow-y: auto;
  min-height: 0;
}

.message-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
}

.avatar-wrap {
  flex-shrink: 0;
}

.system-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f5a623, #f7c948);
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}

.message-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: min(72%, 680px);
}

.message-bubble {
  background: #fff;
  border-radius: 8px;
  padding: 12px 16px;
  color: #333;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: normal;
  overflow-wrap: anywhere;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.bubble-title {
  font-weight: bold;
  margin-bottom: 6px;
  font-size: 15px;
  color: #111;
}

.message-time {
  font-size: 12px;
  color: #aaa;
  padding-left: 4px;
}

.footer-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px 0;
  border-top: 1px solid #edd7b9;
  background: #fff;
  border-radius: 0 0 8px 8px;
}

.no-reply {
  color: #bbb;
  font-size: 14px;
  user-select: none;
}
</style>

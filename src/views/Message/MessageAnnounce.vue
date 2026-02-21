<template>
  <div class="announce-page" v-loading="loading">
    <el-empty v-if="!loading && announceList.length === 0" description="暂无系统公告" />

    <el-card v-else class="announce-card" shadow="never">
      <div class="announce-badge">公告栏</div>
      <div class="announce-divider" />

      <div class="announce-content-wrap">
        <h3 class="announce-title">{{ currentNotice?.title || '系统公告' }}</h3>
        <div class="announce-content">{{ currentNotice?.content || '-' }}</div>

        <div class="announce-meta">
          <span>发布时间：{{ formatTime(currentNotice?.CreatedAt || currentNotice?.UpdatedAt || currentNotice?.createdAt || currentNotice?.updatedAt) || '-' }}</span>
          <span>发布者：{{ currentNotice?.publisher || '管理员' }}</span>
        </div>
      </div>

      <div class="announce-divider" />
      <div class="announce-footer">
        <el-button
          :type="isCurrentNoticeReceived ? 'info' : 'primary'"
          class="confirm-btn"
          :class="{ 'is-received': isCurrentNoticeReceived }"
          :disabled="isCurrentNoticeReceived"
          @click="handleConfirmReceive"
        >
          {{ isCurrentNoticeReceived ? '已接收' : '确认接收' }}
        </el-button>
        <div class="announce-nav">
          <el-button :disabled="currentIndex <= 0" @click="goPrev">上一条</el-button>
          <span class="announce-index">{{ currentIndex + 1 }} / {{ announceList.length }}</span>
          <el-button :disabled="currentIndex >= announceList.length - 1" @click="goNext">下一条</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getAnnouncements } from '@/api/super'
import { useMessageNoticeStore } from '@/stores/messageNotice'

type AnnouncementItem = {
  ID?: number
  title?: string
  content?: string
  publisher?: string
  region?: string
  status?: string
  is_top?: boolean
  CreatedAt?: string
  UpdatedAt?: string
  createdAt?: string
  updatedAt?: string
}

const loading = ref(false)
const announceList = ref<AnnouncementItem[]>([])
const currentIndex = ref(0)
const receivedNoticeKeys = ref<string[]>([])
const messageNoticeStore = useMessageNoticeStore()

const currentNotice = computed(() => announceList.value[currentIndex.value] || null)
const getNoticeKey = (notice: AnnouncementItem | null | undefined, index: number) => {
  if (!notice) return `index:${index}`
  if (notice.ID !== undefined && notice.ID !== null) return `id:${notice.ID}`
  const time = notice.UpdatedAt || notice.CreatedAt || notice.updatedAt || notice.createdAt || ''
  return `mix:${notice.title || ''}|${time}|${index}`
}

const isCurrentNoticeReceived = computed(() => {
  return receivedNoticeKeys.value.includes(getNoticeKey(currentNotice.value, currentIndex.value))
})

const isSuccessResponse = (resData: unknown) => {
  return Number((resData as { code?: number } | null | undefined)?.code) === 200
}

const formatTime = (value?: string) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const normalizeStatus = (status?: string) => String(status || '').trim().toLowerCase()

const sortNotices = (list: AnnouncementItem[]) => {
  return [...list].sort((a, b) => {
    if (Boolean(a.is_top) !== Boolean(b.is_top)) {
      return a.is_top ? -1 : 1
    }
    const aTime = new Date(a.UpdatedAt || a.CreatedAt || a.updatedAt || a.createdAt || '').getTime() || 0
    const bTime = new Date(b.UpdatedAt || b.CreatedAt || b.updatedAt || b.createdAt || '').getTime() || 0
    return bTime - aTime
  })
}

const fetchAnnouncements = async () => {
  loading.value = true
  try {
    const response = await getAnnouncements({ page: 1, pageSize: 200 })
    if (!isSuccessResponse(response?.data)) {
      announceList.value = []
      return
    }

    const payload = (response.data as { data?: { list?: AnnouncementItem[] } }).data
    const sourceList = Array.isArray(payload?.list) ? payload.list : []
    const visibleList = sourceList.filter((item) => {
      const status = normalizeStatus(item.status)
      if (!status) return true
      return status === 'approved' || status === 'published' || status === '已发布'
    })
    announceList.value = sortNotices(visibleList.length ? visibleList : sourceList)
    currentIndex.value = 0
  } catch {
    announceList.value = []
    ElMessage.error('获取系统公告失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const goPrev = () => {
  if (currentIndex.value <= 0) return
  currentIndex.value -= 1
}

const goNext = () => {
  if (currentIndex.value >= announceList.value.length - 1) return
  currentIndex.value += 1
}

const handleConfirmReceive = () => {
  if (announceList.value.length === 0) return
  const key = getNoticeKey(currentNotice.value, currentIndex.value)
  if (receivedNoticeKeys.value.includes(key)) {
    return
  }
  receivedNoticeKeys.value.push(key)
  ElMessage.success('已确认接收')
}

onMounted(() => {
  messageNoticeStore.clearScopeUnread('announcement')
  fetchAnnouncements()
})
</script>

<style scoped>
.announce-page {
  padding: 8px 12px;
}

.announce-card {
  border: 1px solid #ebeef5;
}

.announce-badge {
  width: fit-content;
  margin: 2px auto 16px;
  padding: 8px 28px;
  border-radius: 24px;
  background: #f59a3d;
  color: #fff;
  font-size: 20px;
  font-weight: 700;
}

.announce-divider {
  height: 1px;
  background: #606266;
  opacity: 0.45;
}

.announce-content-wrap {
  padding: 18px 8px;
}

.announce-title {
  margin: 0 0 12px;
  font-size: 34px;
  line-height: 1.2;
  color: #303133;
}

.announce-content {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.9;
  color: #606266;
  font-size: 25px;
  min-height: 320px;
}

.announce-meta {
  margin-top: 16px;
  color: #909399;
  font-size: 13px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
}

.announce-footer {
  padding: 14px 0 4px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.announce-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.announce-index {
  min-width: 64px;
  text-align: center;
  color: #606266;
}

.confirm-btn {
  min-width: 120px;
}

.confirm-btn.is-received {
  --el-button-bg-color: #c0c4cc;
  --el-button-border-color: #c0c4cc;
  --el-button-text-color: #ffffff;
}

@media (max-width: 768px) {
  .announce-title {
    font-size: 20px;
  }

  .announce-content {
    font-size: 14px;
    min-height: 200px;
  }

  .announce-footer {
    justify-content: center;
  }
}
</style>

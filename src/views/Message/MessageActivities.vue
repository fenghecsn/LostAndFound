<template>
  <div class="activities-page" v-loading="loading">
    <el-empty v-if="!loading && activities.length === 0" description="暂无帖子动态" />

    <div v-else class="activities-list">
      <div v-for="item in activities" :key="`${item.type || ''}-${item.item_id || 0}-${item.time || ''}`" class="activity-row">
        <div class="activity-left">系统</div>

        <div class="activity-right">
          <div class="activity-card">
            <div class="notice-title" :class="{ rejected: isRejected(item) }">{{ getDisplayTitle(item) }}</div>

            <div v-if="shouldShowStatusBar(item)" class="status-bar">
              <template v-for="(step, index) in statusSteps" :key="step.value">
                <div class="status-pill" :class="{ active: normalizeStatus(item.item_status) === step.value }">{{ step.label }}</div>
                <div v-if="index < statusSteps.length - 1" class="status-sep">——</div>
              </template>
            </div>

            <el-button
              v-if="getActionText(item)"
              type="primary"
              class="action-btn"
              round
              @click="handleAction(item)"
            >
              {{ getActionText(item) }}
            </el-button>

            <div class="item-card">
              <div class="item-content">
                <div class="item-meta">
                  <p><strong>物品名称：</strong>{{ item.item_name || '-' }}</p>
                  <p><strong>丢失时间：</strong>{{ formatLossTime(item.loss_time) }}</p>
                  <p><strong>丢失地点：</strong>{{ item.location || '-' }}</p>
                </div>
                <el-image
                  v-if="item.img"
                  :src="normalizeResourceUrl(item.img)"
                  fit="cover"
                  class="item-image"
                >
                  <template #error>
                    <div class="img-fallback">暂无图片</div>
                  </template>
                </el-image>
              </div>
              <button class="more-btn" type="button" @click="handleMore(item)">···</button>
            </div>
          </div>

          <div class="time-line">{{ formatTimeline(item.time) }}</div>
        </div>
      </div>
    </div>

    <div class="pager" v-if="total > pageSize">
      <el-pagination
        layout="prev, pager, next"
        :total="total"
        :page-size="pageSize"
        :current-page="pageNum"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getActivitiesApi, type ActivityItem } from '@/api/activities'
import { normalizeResourceUrl } from '@/utils/url'
import { useMessageNoticeStore } from '@/stores/messageNotice'
import { useChatSessionStore } from '@/stores/chatSession'

const loading = ref(false)
const activities = ref<ActivityItem[]>([])
const pageNum = ref(1)
const pageSize = 10
const total = ref(0)
const router = useRouter()
const messageNoticeStore = useMessageNoticeStore()
const chatSessionStore = useChatSessionStore()

const statusSteps = [
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '已通过' },
  { value: 'matched', label: '已匹配' }
]

const normalizeStatus = (status?: string) => String(status || '').trim().toLowerCase()

const isRejected = (item: ActivityItem) => normalizeStatus(item.item_status) === 'rejected'

const shouldShowStatusBar = (item: ActivityItem) => {
  if (item.type !== 'status_update') return false
  return !isRejected(item)
}

const getDisplayTitle = (item: ActivityItem) => {
  if (isRejected(item)) return '你的帖子被驳回!'
  if (item.title) return item.title
  if (item.type === 'claim_received') return '你的帖子有人认领'
  return '你的帖子状态已更新'
}

const getActionText = (item: ActivityItem) => {
  if (item.type === 'claim_received') return '点此与对方进行沟通'
  if (isRejected(item)) return '点此查看原因'
  return ''
}

const formatLossTime = (value?: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const formatTimeline = (value?: string) => {
  if (!value) return '-- --:--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return `${date.getMonth() + 1}.${date.getDate()}   ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const fetchActivities = async () => {
  loading.value = true
  try {
    const response = await getActivitiesApi({ page_num: pageNum.value, page_size: pageSize })
    if (Number(response?.data?.code) !== 200) {
      activities.value = []
      total.value = 0
      ElMessage.warning(response?.data?.msg || '获取帖子动态失败')
      return
    }

    const list = Array.isArray(response.data?.data?.list) ? response.data.data.list : []
    activities.value = list
    total.value = Number(response.data?.data?.total || list.length || 0)
  } catch {
    activities.value = []
    total.value = 0
    ElMessage.error('获取帖子动态失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  pageNum.value = page
  fetchActivities()
}

const handleAction = async (item: ActivityItem) => {
  if (item.type === 'claim_received') {
    const dynamicItem = item as ActivityItem & Record<string, unknown>
    const targetId = Number(
      dynamicItem.target_id ||
      dynamicItem.peer_user_id ||
      dynamicItem.claimant_id ||
      0
    )
    if (!targetId) {
      ElMessage.warning('缺少沟通对象ID，无法打开会话')
      return
    }

    chatSessionStore.ensureSession({
      target_id: targetId,
      target_name: item.claimant_name || `用户${targetId}`
    })

    router.push({
      path: `/StudentHome/message/chat/${targetId}`,
      query: {
        target_name: item.claimant_name || `用户${targetId}`,
        item_id: String(item.item_id || ''),
        item_name: item.item_name || '',
        loss_time: item.loss_time || '',
        location: item.location || '',
        img: item.img || '',
        can_confirm: '1'
      }
    })
    return
  }

  if (isRejected(item)) {
    await ElMessageBox.alert(item.reject_reason || item.process_method || '暂无原因', '原因说明', {
      confirmButtonText: '我知道了'
    })
  }
}

const handleMore = async (item: ActivityItem) => {
  const lines = [
    `动态类型：${item.type || '-'}`,
    `帖子状态：${item.item_status || '-'}`,
    `物品ID：${item.item_id || '-'}`,
    `认领ID：${item.claim_id || '-'}`,
    `认领人：${item.claimant_name || '-'}`
  ]
  await ElMessageBox.alert(lines.join('\n'), '动态详情', {
    confirmButtonText: '关闭'
  })
}

onMounted(() => {
  messageNoticeStore.clearScopeUnread('activity')
  fetchActivities()
})
</script>

<style scoped>
.activities-page {
  padding: 12px;
  background: #fff3e4;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.activity-left {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #f5a623;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.activity-right {
  flex: 1;
  min-width: 0;
}

.activity-card {
  background: #f6f6f6;
  border-radius: 4px;
  padding: 12px 14px;
}

.notice-title {
  margin: 0;
  font-size: 30px;
  font-weight: 700;
  color: #333;
  line-height: 1.35;
}

.notice-title.rejected {
  color: #f56c6c;
}

.status-bar {
  margin-top: 8px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.status-pill {
  min-width: 84px;
  height: 32px;
  padding: 0 10px;
  border-radius: 16px;
  background: #9ea7b3;
  color: #fff;
  font-size: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.status-pill.active {
  background: #f5a623;
}

.status-sep {
  color: #8f98a3;
  font-size: 18px;
}

.action-btn {
  margin: 10px 0 12px;
  min-width: 190px;
}

.item-card {
  background: #fff;
  border: 1px solid #f6b65f;
  border-radius: 10px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.item-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex: 1;
}

.item-meta p {
  margin: 0 0 2px;
  color: #333;
  font-size: 26px;
  line-height: 1.5;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.img-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 12px;
  background: #f5f7fa;
}

.more-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: #ffe8cf;
  color: #f6b65f;
  font-weight: 700;
  cursor: pointer;
}

.time-line {
  margin-top: 6px;
  color: #444;
  font-size: 24px;
}

.pager {
  margin-top: 14px;
  display: flex;
  justify-content: center;
}
</style>

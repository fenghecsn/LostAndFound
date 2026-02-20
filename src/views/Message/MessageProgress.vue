<template>
  <div class="progress-page" v-loading="loading">
    <el-empty v-if="!loading && progressList.length === 0" description="暂无招领进度" />

    <div v-else class="progress-list">
      <div v-for="item in progressList" :key="`${item.claim_id || 0}-${item.time || ''}`" class="progress-row">
        <div class="progress-left">系统</div>

        <div class="progress-right">
          <div class="progress-card">
            <div class="notice-title" :class="{ rejected: isRejected(item) }">{{ getNoticeTitle(item) }}</div>
            <div v-if="getNoticeHint(item)" class="notice-hint" :class="{ rejected: isRejected(item) }">{{ getNoticeHint(item) }}</div>

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
import { ElMessage, ElMessageBox } from 'element-plus'
import { getClaimProgressApi, getClaimReasonApi, type ClaimProgressItem } from '@/api/ClaimProgess'
import { normalizeResourceUrl } from '@/utils/url'
import { useMessageNoticeStore } from '@/stores/messageNotice'

const loading = ref(false)
const progressList = ref<ClaimProgressItem[]>([])
const pageNum = ref(1)
const pageSize = 10
const total = ref(0)
const messageNoticeStore = useMessageNoticeStore()

type ClaimStatusType = 'approved' | 'pending' | 'rejected' | 'unknown'

const getClaimStatusType = (item: ClaimProgressItem): ClaimStatusType => {
  const status = String(item.claim_status || '').toLowerCase()
  if (status === 'approved') return 'approved'
  if (status === 'pending') return 'pending'
  if (status === 'rejected') return 'rejected'
  return 'unknown'
}

const getNoticeTitle = (item: ClaimProgressItem) => {
  if (item.title) return item.title
  const status = getClaimStatusType(item)
  if (status === 'approved') return '你的认领申请已通过！'
  if (status === 'pending') return '你的认领申请待审核'
  if (status === 'rejected') return '你的认领申请未通过'
  return '招领进度更新'
}

const getNoticeHint = (item: ClaimProgressItem) => {
  if (item.hint) return item.hint
  const status = getClaimStatusType(item)
  if (status === 'rejected') return '请认真填写相关细节和更多物品特征'
  return ''
}

const getActionText = (item: ClaimProgressItem) => {
  const status = getClaimStatusType(item)
  if (status === 'approved') return '点此与对方进行沟通'
  if (status === 'pending') return '点此查看原因'
  return ''
}

const isRejected = (item: ClaimProgressItem) => {
  return getClaimStatusType(item) === 'rejected'
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

const fetchProgress = async () => {
  loading.value = true
  try {
    const response = await getClaimProgressApi({ page_num: pageNum.value, page_size: pageSize })
    if (Number(response?.data?.code) !== 200) {
      progressList.value = []
      total.value = 0
      ElMessage.warning(response?.data?.msg || '获取招领进度失败')
      return
    }

    const list = Array.isArray(response.data?.data?.list) ? response.data.data.list : []
    progressList.value = list
    total.value = Number(response.data?.data?.total || list.length || 0)
  } catch {
    progressList.value = []
    total.value = 0
    ElMessage.error('获取招领进度失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  pageNum.value = page
  fetchProgress()
}

const handleAction = async (item: ClaimProgressItem) => {
  const status = getClaimStatusType(item)
  try {
    if (status === 'pending') {
      if (!item.claim_id) {
        ElMessage.warning('缺少认领ID，无法查看原因')
        return
      }
      const response = await getClaimReasonApi({ id: item.claim_id })
      if (Number(response?.data?.code) !== 200) {
        ElMessage.warning(response?.data?.msg || '获取原因失败')
        return
      }
      await ElMessageBox.alert(response?.data?.data?.reject_reason || '暂无原因', '原因说明', {
        confirmButtonText: '我知道了'
      })
      return
    }

    if (status === 'approved') {
      ElMessage.info('沟通功能开发中')
      return
    }

    ElMessage.info('该操作暂未实现')
  } catch {
    ElMessage.error('操作失败，请稍后重试')
  }
}

const handleMore = (item: ClaimProgressItem) => {
  if (isRejected(item) && item.reject_reason) {
    ElMessageBox.alert(item.reject_reason, '详情说明', {
      confirmButtonText: '关闭'
    })
    return
  }
  ElMessage.info('暂无更多操作')
}

onMounted(() => {
  messageNoticeStore.clearScopeUnread('claim_progress')
  fetchProgress()
})

</script>

<style scoped>
.progress-page {
  padding: 12px;
}

.progress-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.progress-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.progress-left {
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

.progress-right {
  flex: 1;
  min-width: 0;
}

.progress-card {
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

.notice-title.rejected,
.notice-hint.rejected {
  color: #f56c6c;
}

.notice-hint {
  margin-top: 2px;
  font-size: 30px;
  line-height: 1.35;
  font-weight: 600;
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

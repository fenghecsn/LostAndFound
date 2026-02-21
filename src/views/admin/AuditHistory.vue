<template>
  <div class="history-page">
    <div class="page-header">
      <h2 class="page-title">审核记录</h2>
      <el-button type="warning" size="large" round @click="router.back()">返回</el-button>
    </div>

    <div class="table-wrapper">
      <el-table
        :data="pagedList"
        v-loading="loading"
        stripe
        :header-cell-style="{ background: '#fdf6ec', color: '#333', fontWeight: 'bold' }"
        style="width: 100%"
      >
        <el-table-column label="索引" width="70" align="center">
          <template #default="{ $index }">
            {{ (currentPage - 1) * pageSize + $index + 1 }}
          </template>
        </el-table-column>

        <el-table-column label="审核模块" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.type === 'claim' ? 'warning' : 'success'" round>
              {{ row.type === 'claim' ? '认领申请审核' : '帖子审核' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="业务类型" width="120" align="center">
          <template #default="{ row }">
            {{ getBizTypeLabel(row) }}
          </template>
        </el-table-column>

        <el-table-column label="物品名称" width="140" align="center">
          <template #default="{ row }">
            {{ row.item?.title || row.item?.category || '--' }}
          </template>
        </el-table-column>

        <el-table-column label="图片" width="100" align="center">
          <template #default="{ row }">
            <el-image
              v-if="row.item?.img1"
              :src="row.item.img1"
              fit="cover"
              style="width: 60px; height: 60px; border-radius: 4px;"
            />
            <span v-else class="no-image">无图片</span>
          </template>
        </el-table-column>

        <el-table-column label="时间" width="160" align="center">
          <template #default="{ row }">
            {{ row.item?.time || '--' }}
          </template>
        </el-table-column>

        <el-table-column label="地点" width="140" align="center">
          <template #default="{ row }">
            {{ row.item?.location || '--' }}
          </template>
        </el-table-column>

        <el-table-column label="申请/描述" min-width="200">
          <template #default="{ row }">
            <span class="desc-text">{{ getRecordContent(row) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作时间" width="170" align="center">
          <template #default="{ row }">
            {{ row.time || '--' }}
          </template>
        </el-table-column>

        <el-table-column label="审核结果" width="110" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.action === 'approved'" type="success" effect="dark">通过</el-tag>
            <el-tag v-else-if="row.action === 'rejected'" type="danger" effect="dark">驳回</el-tag>
            <el-tag v-else type="info" effect="dark">未知</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="90" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="warning" round size="small" @click="showDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
      />
    </div>

    <el-dialog v-model="detailVisible" width="720px" :show-close="true" top="8vh">
      <div class="detail-dialog" v-if="currentRecord">
        <div class="detail-header">
          <div class="detail-info">
            <p>
              <strong>审核模块：</strong>
              <el-tag :type="currentRecord.type === 'claim' ? 'warning' : 'success'" round>
                {{ currentRecord.type === 'claim' ? '认领申请审核' : '帖子审核' }}
              </el-tag>
            </p>
            <p><strong>业务类型：</strong>{{ getBizTypeLabel(currentRecord) }}</p>
            <p><strong>物品名称：</strong>{{ currentRecord.item?.title || currentRecord.item?.category || '--' }}</p>
            <p><strong>{{ isLostPost(currentRecord.item) ? '丢失' : '拾取' }}时间：</strong>{{ currentRecord.item?.time || '--' }}</p>
            <p><strong>{{ isLostPost(currentRecord.item) ? '丢失' : '拾取' }}地点：</strong>{{ currentRecord.item?.location || '--' }}</p>
            <p><strong>物品描述：</strong>{{ currentRecord.item?.description || '--' }}</p>
            <p v-if="currentRecord.type === 'claim'"><strong>申请人说明：</strong>{{ getClaimSpeech(currentRecord) || '--' }}</p>
            <p><strong>操作人：</strong>{{ currentRecord.operator || '--' }}</p>
            <p><strong>操作时间：</strong>{{ currentRecord.time || '--' }}</p>
            <p v-if="currentRecord.action === 'rejected' && currentRecord.reason">
              <strong>驳回原因：</strong><span class="reject-reason">{{ currentRecord.reason }}</span>
            </p>
          </div>
          <div class="detail-actions">
            <el-tag
              :type="currentRecord.action === 'approved' ? 'success' : 'danger'"
              size="large"
              effect="dark"
              style="font-size: 16px; padding: 8px 20px;"
            >
              {{ currentRecord.action === 'approved' ? '已通过' : '已驳回' }}
            </el-tag>
          </div>
        </div>

        <div class="detail-tags">
          <div class="tag-item">
            <span class="tag-dot blue"></span>
            <el-tag type="warning" effect="plain" round>校区：{{ currentRecord.item?.campus || '--' }}</el-tag>
          </div>
          <div class="tag-item">
            <span class="tag-dot orange"></span>
            <el-tag type="warning" effect="plain" round>物品类型：{{ currentRecord.item?.category || '--' }}</el-tag>
          </div>
          <div class="tag-item">
            <span class="tag-dot yellow"></span>
            <el-tag type="warning" effect="plain" round>悬赏：{{ getBountyText(currentRecord.item) }}</el-tag>
          </div>
        </div>

        <div class="detail-images" v-if="getImages(currentRecord.item).length > 0">
          <el-image
            v-for="(img, idx) in getImages(currentRecord.item)"
            :key="idx"
            :src="img"
            fit="cover"
            class="detail-img"
            :preview-src-list="getImages(currentRecord.item)"
          />
        </div>

        <p class="detail-time">
          {{ currentRecord.item?.CreatedAt ? new Date(currentRecord.item.CreatedAt).toLocaleString('zh-CN') : '' }} 发布
        </p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuditHistoryStore, type AuditRecord } from '@/stores/auditHistory'

const router = useRouter()
const auditHistoryStore = useAuditHistoryStore()

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const detailVisible = ref(false)
const currentRecord = ref<AuditRecord | null>(null)

const total = computed(() => auditHistoryStore.records.length)
const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return auditHistoryStore.records.slice(start, start + pageSize.value)
})

function getImages(item: any): string[] {
  if (!item) return []
  return [item.img1, item.img2, item.img3, item.img4].filter(Boolean)
}

function getClaimSpeech(record: AuditRecord): string {
  return String(record?.item?._claim_proof || '').trim()
}

function isLostPost(item: any): boolean {
  const t = String(item?.type ?? '').toLowerCase()
  if (t === 'lost') return true
  if (t === 'found') return false
  return Number(item?.lost_or_found) === 1
}

function getPostTypeLabel(item: any): string {
  if (isLostPost(item)) return '失物帖'
  const t = String(item?.type ?? '').toLowerCase()
  if (t === 'found' || Number(item?.lost_or_found) === 2) return '招领帖'
  return '--'
}

function getBizTypeLabel(record: AuditRecord): string {
  if (record.type === 'item') return getPostTypeLabel(record.item)
  return isLostPost(record.item) ? '归还申请' : '认领申请'
}

function getRecordContent(record: AuditRecord): string {
  if (record.type === 'claim') return getClaimSpeech(record) || '--'
  return String(record.item?.description || '--')
}

function getBountyText(item: any): string {
  const value = Number(item?.bounty ?? item?.reward ?? 0)
  if (!Number.isFinite(value) || value < 0) return '0元'
  return `${value}元`
}

function showDetail(record: AuditRecord) {
  currentRecord.value = record
  detailVisible.value = true
}
</script>

<style scoped>
.history-page { padding: 0; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title { font-size: 24px; font-weight: bold; color: #333; margin: 0; }
.table-wrapper { background: #fff; border-radius: 8px; overflow: hidden; }
.no-image { color: #999; font-size: 13px; }
.desc-text { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 13px; color: #666; }
.pagination-wrapper { display: flex; justify-content: center; margin-top: 24px; }
.detail-dialog { padding: 0 8px; }
.detail-header { display: flex; justify-content: space-between; gap: 16px; }
.detail-info p { margin: 8px 0; font-size: 15px; color: #333; }
.detail-actions { display: flex; flex-direction: column; gap: 10px; align-items: center; }
.reject-reason { color: #f56c6c; }
.detail-tags { display: flex; gap: 16px; margin: 16px 0; flex-wrap: wrap; }
.tag-item { display: flex; align-items: center; gap: 6px; }
.tag-dot { width: 10px; height: 10px; border-radius: 50%; }
.tag-dot.blue { background: #409eff; }
.tag-dot.orange { background: #e6a23c; }
.tag-dot.yellow { background: #f5c242; }
.detail-images { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 16px 0; }
.detail-img { width: 100%; height: 200px; border-radius: 8px; background: #f5f5f5; }
.detail-time { text-align: center; color: #999; font-size: 13px; margin-top: 12px; }
</style>

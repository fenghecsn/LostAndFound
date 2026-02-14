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
        <el-table-column label="发帖类型" width="100" align="center">
          <template #default="{ row }">
            {{ row.item?.lost_or_found === 1 ? '丢失帖' : '拾取帖' }}
          </template>
        </el-table-column>
        <el-table-column label="物品名称" width="100" align="center">
          <template #default="{ row }">
            {{ row.item?.category || row.item?.title || '--' }}
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
            <div v-else class="img-placeholder">
              <el-icon :size="30" color="#ccc"><Picture /></el-icon>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="拾取/丢失时间" width="160" align="center">
          <template #default="{ row }">
            {{ row.item?.time || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="拾取/丢失地点" width="120" align="center">
          <template #default="{ row }">
            {{ row.item?.location || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="物品描述" min-width="160">
          <template #default="{ row }">
            <span class="desc-text">{{ row.item?.description || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作时间" width="160" align="center">
          <template #default="{ row }">
            {{ row.time || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="审核结果" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.action === 'approved'" type="success" effect="dark">通过</el-tag>
            <el-tag v-else-if="row.action === 'rejected'" type="danger" effect="dark">驳回</el-tag>
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

    <!-- 详情弹窗（只读） -->
    <el-dialog v-model="detailVisible" width="700px" :show-close="true" top="8vh">
      <div class="detail-dialog" v-if="currentRecord">
        <div class="detail-header">
          <div class="detail-info">
            <p><strong>物品名称：</strong>{{ currentRecord.item?.title || currentRecord.item?.category }}</p>
            <p><strong>{{ currentRecord.item?.lost_or_found === 1 ? '丢失' : '拾取' }}时间：</strong>{{ currentRecord.item?.time || '--' }}</p>
            <p><strong>{{ currentRecord.item?.lost_or_found === 1 ? '丢失' : '拾取' }}地点：</strong>{{ currentRecord.item?.location || '--' }}</p>
            <p><strong>物品特征：</strong>{{ currentRecord.item?.description || '--' }}</p>
            <p><strong>操作人：</strong>{{ currentRecord.operator || '--' }}</p>
            <p><strong>操作时间：</strong>{{ currentRecord.time || '--' }}</p>
            <p v-if="currentRecord.action === 'rejected' && currentRecord.reason">
              <strong>驳回原因：</strong>
              <span style="color: #f56c6c;">{{ currentRecord.reason }}</span>
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
            <el-button type="primary" @click="detailVisible = false">返回</el-button>
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
          <div class="tag-item" v-if="currentRecord.item?.is_bounty">
            <span class="tag-dot yellow"></span>
            <el-tag type="warning" effect="plain" round>悬赏：10元</el-tag>
          </div>
        </div>
        <div class="detail-images">
          <el-image
            v-for="(img, idx) in getImages(currentRecord.item)"
            :key="idx"
            :src="img"
            fit="cover"
            class="detail-img"
            :preview-src-list="getImages(currentRecord.item)"
          />
          <div v-if="getImages(currentRecord.item).length === 0" class="no-img">暂无图片</div>
        </div>
        <p class="detail-time">{{ currentRecord.item?.CreatedAt ? new Date(currentRecord.item.CreatedAt).toLocaleString('zh-CN') : '' }} 发布</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Picture } from '@element-plus/icons-vue'
import { useAuditHistoryStore, type AuditRecord } from '@/stores/auditHistory'

const router = useRouter()
const auditHistoryStore = useAuditHistoryStore()

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const detailVisible = ref(false)
const currentRecord = ref<AuditRecord | null>(null)

/** 总记录数 */
const total = computed(() => auditHistoryStore.records.length)

/** 当前页数据（前端分页） */
const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return auditHistoryStore.records.slice(start, start + pageSize.value)
})

function getImages(item: any): string[] {
  if (!item) return []
  return [item.img1, item.img2, item.img3, item.img4].filter(Boolean)
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
.img-placeholder { width: 60px; height: 60px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; border-radius: 4px; margin: 0 auto; }
.desc-text { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 13px; color: #666; }
.pagination-wrapper { display: flex; justify-content: center; margin-top: 24px; }
.detail-dialog { padding: 0 8px; }
.detail-header { display: flex; justify-content: space-between; }
.detail-info p { margin: 8px 0; font-size: 15px; color: #333; }
.detail-actions { display: flex; flex-direction: column; gap: 10px; align-items: center; }
.detail-tags { display: flex; gap: 16px; margin: 16px 0; flex-wrap: wrap; }
.tag-item { display: flex; align-items: center; gap: 6px; }
.tag-dot { width: 10px; height: 10px; border-radius: 50%; }
.tag-dot.blue { background: #409eff; }
.tag-dot.orange { background: #e6a23c; }
.tag-dot.yellow { background: #f5c242; }
.detail-images { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 16px 0; }
.detail-img { width: 100%; height: 200px; border-radius: 8px; background: #f5f5f5; }
.no-img { color: #999; text-align: center; padding: 40px; grid-column: 1 / -1; }
.detail-time { text-align: center; color: #999; font-size: 13px; margin-top: 12px; }
</style>
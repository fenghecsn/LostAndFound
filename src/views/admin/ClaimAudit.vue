<template>
  <div class="claim-page">
    <div class="page-header">
      <h2 class="page-title">认领审核</h2>
      <el-button type="warning" size="large" round @click="router.push('/admin/audit-history')">
        审核记录
      </el-button>
    </div>

    <div class="table-wrapper">
      <el-table
        :data="claimList"
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
        <el-table-column label="认领时间" width="160" align="center">
          <template #default="{ row }">
            {{ row.CreatedAt ? new Date(row.CreatedAt).toLocaleString('zh-CN') : '--' }}
          </template>
        </el-table-column>
        <el-table-column label="物品名称" width="100" align="center">
          <template #default="{ row }">
            {{ row.item?.category || row.item?.title || row.category || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="图片" width="100" align="center">
          <template #default="{ row }">
            <el-image
              v-if="row.item?.img1 || row.img1"
              :src="row.item?.img1 || row.img1"
              fit="cover"
              style="width: 60px; height: 60px; border-radius: 4px;"
            />
            <div v-else class="img-placeholder">
              <el-icon :size="30" color="#ccc"><Picture /></el-icon>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="申请内容" min-width="240">
          <template #default="{ row }">
            <span class="desc-text">{{ row.proof || row.description || row.reason || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-btns">
              <el-button type="warning" round size="small" @click="showClaimDetail(row)">详情</el-button>
              <el-button type="warning" round size="small" plain @click="openClaimReject(row)">驳回</el-button>
              <el-button type="warning" round size="small" @click="handleClaimApprove(row)">通过</el-button>
            </div>
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
        @current-change="fetchClaimList"
      />
    </div>

    <!-- 认领详情弹窗 -->
    <el-dialog v-model="detailVisible" width="700px" :show-close="true" top="8vh" @closed="resetDialog">
      <div class="claim-detail" v-if="currentClaim">
        <h2 class="claim-detail-title">认领申请：</h2>

        <div class="item-info-card">
          <p>物品名称：{{ currentClaim.item?.title || currentClaim.item?.category || '--' }}</p>
          <p>物品类型：{{ currentClaim.item?.category || '--' }}</p>
          <p>拾取地点：{{ currentClaim.item?.location || '--' }}</p>
          <p>拾取时间：{{ currentClaim.item?.time || '--' }}</p>
          <p>物品特征：{{ currentClaim.item?.description || currentClaim.proof || '--' }}</p>
          <p>联系人及联系电话：{{ currentClaim.claimant?.username || '--' }}</p>
          <p>照片说明：已上传物品清晰照片（正面及反面，关键隐私信息已打码处理）</p>
          <div class="word-count">{{ (currentClaim.proof || '').length }}/1000</div>
        </div>

        <p class="claim-hint">需填写物品名称、类型、拾取地点、拾取时间、物品特征、联系人及联系电话</p>

        <div class="claim-images">
          <el-image
            v-for="(img, idx) in getClaimImages(currentClaim)"
            :key="idx"
            :src="img"
            fit="cover"
            class="claim-img"
            :preview-src-list="getClaimImages(currentClaim)"
          />
          <div v-if="getClaimImages(currentClaim).length === 0" class="no-img-box">
            <el-icon :size="40" color="#ccc"><Picture /></el-icon>
          </div>
        </div>

        <p class="claim-img-hint">必须上传物品清晰照片<br/>便于失主确认</p>

        <div v-if="showRejectInput" class="reject-input-area">
          <h4>填写驳回原因</h4>
          <el-input
            v-model="rejectReason"
            type="textarea"
            :rows="3"
            placeholder="请输入文字"
            maxlength="200"
            show-word-limit
          />
        </div>

        <div class="claim-detail-footer">
          <el-button
            :type="showRejectInput ? 'info' : 'primary'"
            :loading="rejectLoading"
            @click="handleClaimRejectConfirm"
          >驳回</el-button>
          <el-button
            :type="showRejectInput ? 'info' : 'primary'"
            :loading="approveLoading"
            @click="handleClaimApprove(currentClaim)"
            :disabled="showRejectInput"
          >通过</el-button>
          <el-button type="primary" @click="detailVisible = false">返回</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import { getPendingClaims, approveClaim, rejectClaim } from '@/api/admin'
import { useAuditHistoryStore } from '@/stores/auditHistory'

const router = useRouter()
const auditHistoryStore = useAuditHistoryStore()

const loading = ref(false)
const approveLoading = ref(false)
const rejectLoading = ref(false)
const claimList = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const detailVisible = ref(false)
const currentClaim = ref<any>(null)
const showRejectInput = ref(false)
const rejectReason = ref('')

function getClaimImages(claim: any): string[] {
  if (!claim) return []
  const item = claim.item || claim
  return [item.img1, item.img2, item.img3, item.img4].filter(Boolean)
}

function resetDialog() {
  showRejectInput.value = false
  rejectReason.value = ''
  currentClaim.value = null
}

async function fetchClaimList() {
  loading.value = true
  try {
    const res = await getPendingClaims({
      page: currentPage.value,
      pageSize: pageSize.value
    })
    const resData = res.data?.data ?? res.data ?? {}
    claimList.value = (resData.list ?? resData.items ?? []).map((item: any) => ({
      ...item,
      id: item.id ?? item.ID,
    }))
    total.value = resData.total ?? 0
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : '获取认领列表失败'
    ElMessage.error(errMsg)
    claimList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function showClaimDetail(row: any) {
  currentClaim.value = row
  showRejectInput.value = false
  rejectReason.value = ''
  detailVisible.value = true
}

function openClaimReject(row: any) {
  currentClaim.value = row
  rejectReason.value = ''
  showRejectInput.value = false
  detailVisible.value = true
  setTimeout(() => { showRejectInput.value = true }, 100)
}

function handleClaimRejectConfirm() {
  if (!showRejectInput.value) {
    showRejectInput.value = true
    return
  }
  if (!rejectReason.value.trim()) {
    ElMessage.warning('请填写驳回原因')
    return
  }
  doRejectClaim()
}

async function doRejectClaim() {
  if (rejectLoading.value) return
  rejectLoading.value = true
  try {
    const id = currentClaim.value.id ?? currentClaim.value.ID
    await rejectClaim(id, { reject_reason: rejectReason.value })
    const itemForHistory = currentClaim.value.item || currentClaim.value
    auditHistoryStore.addRecord(itemForHistory, 'rejected', rejectReason.value, 'claim')
    ElMessage.success('已驳回')
    detailVisible.value = false
    showRejectInput.value = false
    rejectReason.value = ''
    fetchClaimList()
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : '驳回失败'
    ElMessage.error(errMsg)
  } finally {
    rejectLoading.value = false
  }
}

async function handleClaimApprove(row: any) {
  if (approveLoading.value) return
  try {
    await ElMessageBox.confirm('确定通过该认领申请？', '确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    approveLoading.value = true
    const id = row.id ?? row.ID
    await approveClaim(id)
    const itemForHistory = row.item || row
    auditHistoryStore.addRecord(itemForHistory, 'approved', undefined, 'claim')
    ElMessage.success('认领审核通过')
    detailVisible.value = false
    fetchClaimList()
  } catch (error: unknown) {
    // 区分用户取消和真实错误
    if (error === 'cancel' || error === 'close') return
    const errMsg = error instanceof Error ? error.message : '审核失败'
    ElMessage.error(errMsg)
  } finally {
    approveLoading.value = false
  }
}

onMounted(() => {
  fetchClaimList()
})
</script>

<style scoped>
.claim-page { padding: 0; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title { font-size: 24px; font-weight: bold; color: #333; margin: 0; }
.table-wrapper { background: #fff; border-radius: 8px; overflow: hidden; }
.img-placeholder { width: 60px; height: 60px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; border-radius: 4px; margin: 0 auto; }
.desc-text { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 13px; color: #666; }
.action-btns { display: flex; gap: 6px; justify-content: center; }
.pagination-wrapper { display: flex; justify-content: center; margin-top: 24px; }

.claim-detail { padding: 0 8px; }
.claim-detail-title { font-size: 22px; font-weight: bold; color: #333; margin: 0 0 16px 0; }

.item-info-card { background: #fef8ee; border-radius: 8px; padding: 16px 20px; position: relative; }
.item-info-card p { margin: 6px 0; font-size: 14px; color: #333; line-height: 1.8; }
.word-count { position: absolute; right: 16px; bottom: 10px; font-size: 12px; color: #999; }

.claim-hint { color: #e6a23c; font-size: 13px; text-align: center; margin: 12px 0; }
.claim-images { display: flex; gap: 12px; justify-content: center; margin: 16px 0; }
.claim-img { width: 160px; height: 140px; border-radius: 8px; background: #f5f5f5; }
.no-img-box { width: 160px; height: 140px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
.claim-img-hint { color: #e6a23c; font-size: 13px; text-align: center; margin: 8px 0 16px; }

.reject-input-area { margin: 16px 0; background: #f9f9f9; padding: 16px; border-radius: 8px; }
.reject-input-area h4 { margin: 0 0 10px 0; font-size: 15px; color: #333; }

.claim-detail-footer { display: flex; justify-content: center; gap: 16px; margin-top: 20px; padding-bottom: 8px; }
</style>

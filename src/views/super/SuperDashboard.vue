<template>
  <div class="dashboard-page" v-loading="loading">
    <div class="page-header">
      <h2 class="page-title">数据中心</h2>
      <el-button plain round @click="fetchStats">
        <el-icon><Refresh /></el-icon> 刷新数据
      </el-button>
    </div>

    <!-- 统计卡片 -->
    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-card-body">
          <div>
            <p class="stat-label">用户总数</p>
            <p class="stat-number">{{ formatNum(stats.total_users) }}</p>
          </div>
          <div class="stat-icon blue"><el-icon :size="28"><User /></el-icon></div>
        </div>
        <p class="stat-sub">活跃用户 {{ formatNum(stats.active_users) }}</p>
      </div>
      <div class="stat-card">
        <div class="stat-card-body">
          <div>
            <p class="stat-label">发布总量</p>
            <p class="stat-number">{{ formatNum(stats.total_items) }}</p>
          </div>
          <div class="stat-icon green"><el-icon :size="28"><DataAnalysis /></el-icon></div>
        </div>
        <p class="stat-sub">今日新增 {{ formatNum(stats.today_items) }}</p>
      </div>
      <div class="stat-card">
        <div class="stat-card-body">
          <div>
            <p class="stat-label">已解决</p>
            <p class="stat-number">{{ formatNum(stats.solved_items) }}</p>
          </div>
          <div class="stat-icon orange"><el-icon :size="28"><CircleCheck /></el-icon></div>
        </div>
        <p class="stat-sub green-text">
          解决率 {{ solvedRate }}%
        </p>
      </div>
      <div class="stat-card">
        <div class="stat-card-body">
          <div>
            <p class="stat-label">认领申请</p>
            <p class="stat-number">{{ formatNum(stats.total_claims) }}</p>
          </div>
          <div class="stat-icon yellow"><el-icon :size="28"><Connection /></el-icon></div>
        </div>
      </div>
    </div>

    <!-- 系统维护区 -->
    <div class="action-cards">
      <!-- 数据清理 -->
      <div class="action-card">
        <div class="action-header">
          <h3><el-icon color="#f56c6c"><Delete /></el-icon> 数据清理</h3>
        </div>
        <div class="action-body">
          <p class="action-desc">清理系统中超过指定天数的过期无效数据（已取消的帖子等），释放数据库空间。</p>
          <div class="cleanup-form">
            <span>清理</span>
            <el-input-number v-model="cleanupDays" :min="7" :max="365" :step="7" size="default" />
            <span>天前的过期数据</span>
            <el-button type="danger" :loading="cleanupLoading" @click="handleCleanup">
              <el-icon><Delete /></el-icon> 执行清理
            </el-button>
          </div>
          <p v-if="cleanupResult !== null" class="cleanup-result">
            上次清理删除了 <strong>{{ cleanupResult }}</strong> 条数据
          </p>
        </div>
      </div>

      <!-- 数据导出 -->
      <div class="action-card">
        <div class="action-header">
          <h3><el-icon color="#409eff"><Download /></el-icon> 数据导出</h3>
        </div>
        <div class="action-body">
          <div class="export-row">
            <p>导出全校失物招领系统统计数据（CSV 格式）。</p>
            <el-button type="primary" :loading="exportLoading" @click="handleExport">
              <el-icon><Download /></el-icon> 导出统计报表
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-footer">
      数据更新时间：{{ lastUpdateTime }} · © 失物招领系统 · 超级管理员数据中心
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, DataAnalysis, Connection, CircleCheck, Delete, Download, Refresh } from '@element-plus/icons-vue'
import { getSuperStats, cleanupExpiredData } from '@/api/super'
import { exportStatsCSV } from '@/api/admin'

const loading = ref(false)
const exportLoading = ref(false)
const cleanupLoading = ref(false)
const cleanupDays = ref(90)
const cleanupResult = ref<number | null>(null)
const lastUpdateTime = ref('')

const stats = ref({
  total_users: 0,
  active_users: 0,
  total_items: 0,
  solved_items: 0,
  total_claims: 0,
  today_items: 0,
})

const solvedRate = computed(() => {
  if (!stats.value.total_items) return '0.0'
  return ((stats.value.solved_items / stats.value.total_items) * 100).toFixed(1)
})

function formatNum(n: number) {
  if (!n) return '0'
  return n.toLocaleString()
}

async function fetchStats() {
  loading.value = true
  try {
    const res = await getSuperStats()
    const d = res.data?.data ?? res.data ?? {}
    stats.value = {
      total_users: d.total_users ?? 0,
      active_users: d.active_users ?? 0,
      total_items: d.total_items ?? 0,
      solved_items: d.solved_items ?? 0,
      total_claims: d.total_claims ?? 0,
      today_items: d.today_items ?? 0,
    }
    lastUpdateTime.value = new Date().toLocaleString('zh-CN')
  } catch {
    ElMessage.error('获取统计数据失败')
  } finally {
    loading.value = false
  }
}

async function handleCleanup() {
  try {
    await ElMessageBox.confirm(
      `确定要清理 ${cleanupDays.value} 天前的过期数据吗？此操作不可撤销！`,
      '危险操作',
      { type: 'error', confirmButtonText: '确认清理', cancelButtonText: '取消' }
    )
    cleanupLoading.value = true
    const res = await cleanupExpiredData({ days: cleanupDays.value })
    const d = res.data?.data ?? res.data ?? {}
    cleanupResult.value = d.deleted_count ?? d.count ?? 0
    ElMessage.success(`数据清理完成，共删除 ${cleanupResult.value} 条`)
    fetchStats()
  } catch (error: unknown) {
    if (error === 'cancel' || error === 'close') return
    const errMsg = error instanceof Error ? error.message : '清理失败'
    ElMessage.error(errMsg)
  } finally {
    cleanupLoading.value = false
  }
}

async function handleExport() {
  exportLoading.value = true
  try {
    const res = await exportStatsCSV()
    const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `全校统计报表_${new Date().toLocaleDateString('zh-CN')}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch {
    ElMessage.error('导出失败，请稍后重试')
  } finally {
    exportLoading.value = false
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.dashboard-page { padding: 0; }
.page-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 24px;
}
.page-title { font-size: 24px; font-weight: bold; color: #333; margin: 0; }

.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}
.stat-card {
  background: #fff;
  border: 2px solid #f5d4a0;
  border-radius: 12px;
  padding: 20px 24px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(230, 162, 60, 0.15);
}
.stat-card-body { display: flex; justify-content: space-between; align-items: center; }
.stat-label { font-size: 14px; color: #999; margin: 0 0 8px 0; }
.stat-number { font-size: 32px; font-weight: bold; color: #333; margin: 0; }
.stat-icon {
  width: 48px; height: 48px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
}
.stat-icon.blue { background: #e3f2fd; color: #1976d2; }
.stat-icon.green { background: #e8f5e9; color: #4caf50; }
.stat-icon.yellow { background: #fff8e1; color: #ff9800; }
.stat-icon.orange { background: #fff3e0; color: #e6a23c; }
.stat-sub { margin: 8px 0 0 0; font-size: 13px; color: #999; }
.green-text { color: #67c23a; }

.action-cards { display: flex; flex-direction: column; gap: 20px; margin-bottom: 24px; }
.action-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}
.action-header h3 {
  display: flex; align-items: center; gap: 8px;
  font-size: 16px; color: #333; margin: 0 0 16px 0;
}
.action-desc { font-size: 14px; color: #666; margin: 0 0 16px 0; }
.cleanup-form {
  display: flex; align-items: center; gap: 12px;
  font-size: 14px; color: #333;
}
.cleanup-result { margin-top: 12px; font-size: 13px; color: #67c23a; }
.export-row { display: flex; align-items: center; justify-content: space-between; }
.export-row p { font-size: 14px; color: #666; margin: 0; }

.dashboard-footer {
  text-align: center; color: #999; font-size: 13px; padding: 24px 0;
}
</style>
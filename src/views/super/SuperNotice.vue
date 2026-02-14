<template>
  <div class="notice-page">
    <div class="page-header">
      <h2 class="page-title">公告管理</h2>
    </div>

    <div class="tab-header">
      <el-button :type="currentTab === 'publish' ? 'danger' : 'default'" round @click="currentTab = 'publish'">
        发布系统公告
      </el-button>
      <el-button :type="currentTab === 'audit' ? 'danger' : 'default'" round @click="currentTab = 'audit'; fetchList()">
        审核区域公告
        <el-badge v-if="pendingCount > 0" :value="pendingCount" :max="99" class="badge-offset" />
      </el-button>
      <el-button :type="currentTab === 'all' ? 'danger' : 'default'" round @click="currentTab = 'all'; fetchList()">
        全部公告
      </el-button>
    </div>

    <!-- 发布系统公告 -->
    <div v-if="currentTab === 'publish'" class="publish-card">
      <el-form :model="publishForm" label-width="90px">
        <el-form-item label="公告标题">
          <el-input v-model="publishForm.title" placeholder="请输入系统公告标题" />
        </el-form-item>
        <el-form-item label="公告内容">
          <el-input v-model="publishForm.content" type="textarea" :rows="10" placeholder="请输入公告内容" />
        </el-form-item>
        <el-form-item label="是否置顶">
          <el-switch v-model="publishForm.is_top" />
        </el-form-item>
        <el-form-item>
          <div style="text-align: right; width: 100%;">
            <el-button type="primary" :loading="publishing" @click="handlePublish">发布</el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <!-- 审核区域公告 -->
    <div v-if="currentTab === 'audit'" v-loading="loading">
      <div v-if="auditList.length === 0" style="padding: 40px 0;">
        <el-empty description="暂无待审核公告" />
      </div>
      <div v-else class="notice-list">
        <div v-for="notice in auditList" :key="notice.ID" class="notice-card">
          <div class="notice-card-header">
            <h3>{{ notice.title }}</h3>
            <div style="display: flex; align-items: center; gap: 8px;">
              <el-tag type="warning" size="small">待审核</el-tag>
              <el-tag v-if="notice.region" type="info" size="small" effect="plain">{{ notice.region }}</el-tag>
            </div>
          </div>
          <p class="notice-body">{{ notice.content }}</p>
          <div class="notice-meta">
            <span>发布者：{{ notice.publisher || '--' }}</span>
          </div>
          <div class="notice-card-footer">
            <span class="notice-time">
              提交时间：{{ notice.CreatedAt ? new Date(notice.CreatedAt).toLocaleString('zh-CN') : '' }}
            </span>
            <div class="notice-actions">
              <el-button type="success" size="small" round @click="handleAudit(notice, 'approved')">通过</el-button>
              <el-button type="danger" size="small" round @click="handleAudit(notice, 'rejected')">拒绝</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 全部公告 -->
    <div v-if="currentTab === 'all'" v-loading="loading">
      <div v-if="allList.length === 0" style="padding: 40px 0;">
        <el-empty description="暂无公告" />
      </div>
      <div v-else class="notice-list">
        <div v-for="notice in allList" :key="notice.ID" class="notice-card">
          <div class="notice-card-header">
            <h3>
              <el-tag v-if="notice.is_top" type="danger" size="small" effect="dark" style="margin-right: 8px;">置顶</el-tag>
              {{ notice.title }}
            </h3>
            <div style="display: flex; align-items: center; gap: 8px;">
              <el-tag
                :type="notice.status === 'approved' ? 'success' : notice.status === 'rejected' ? 'danger' : 'warning'"
                size="small"
              >
                {{ notice.status === 'approved' ? '已通过' : notice.status === 'rejected' ? '已拒绝' : '待审核' }}
              </el-tag>
              <el-tag :type="notice.type === 'system' ? 'danger' : 'info'" size="small" effect="plain">
                {{ notice.type === 'system' ? '系统公告' : '区域公告' }}
              </el-tag>
            </div>
          </div>
          <p class="notice-body">{{ notice.content }}</p>
          <div class="notice-meta">
            <span>发布者：{{ notice.publisher || '--' }}</span>
            <span v-if="notice.region">区域：{{ notice.region }}</span>
          </div>
          <div class="notice-card-footer">
            <span class="notice-time">
              {{ notice.CreatedAt ? new Date(notice.CreatedAt).toLocaleString('zh-CN') : '' }}
            </span>
            <el-button type="danger" size="small" plain round @click="handleDelete(notice)">
              删除
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getAnnouncements,
  createSystemAnnouncement,
  reviewAnnouncement,
  deleteAnnouncement,
} from '@/api/super'

const loading = ref(false)
const publishing = ref(false)
const currentTab = ref<'publish' | 'audit' | 'all'>('publish')

const noticeList = ref<any[]>([])

const publishForm = reactive({
  title: '',
  content: '',
  is_top: false,
})

/** 待审核列表（从全量列表前端过滤） */
const auditList = computed(() => noticeList.value.filter(n => n.status === 'pending'))
const allList = computed(() => noticeList.value)
const pendingCount = computed(() => auditList.value.length)

async function fetchList() {
  loading.value = true
  try {
    const res = await getAnnouncements({ page: 1, pageSize: 200 })
    const resData = res.data?.data ?? res.data ?? {}
    noticeList.value = resData.list ?? resData.items ?? []
  } catch {
    noticeList.value = []
  } finally {
    loading.value = false
  }
}

async function handlePublish() {
  if (!publishForm.title.trim() || !publishForm.content.trim()) {
    ElMessage.warning('请填写标题和内容')
    return
  }
  publishing.value = true
  try {
    await createSystemAnnouncement({
      title: publishForm.title,
      content: publishForm.content,
      is_top: publishForm.is_top,
    })
    ElMessage.success('系统公告发布成功')
    publishForm.title = ''
    publishForm.content = ''
    publishForm.is_top = false
    fetchList()
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : '发布失败'
    ElMessage.error(errMsg)
  } finally {
    publishing.value = false
  }
}

async function handleAudit(notice: any, status: 'approved' | 'rejected') {
  const action = status === 'approved' ? '通过' : '拒绝'
  try {
    await ElMessageBox.confirm(`确定要${action}该公告吗？`, '确认', { type: 'warning' })
    await reviewAnnouncement({ id: notice.ID, status })
    ElMessage.success(`已${action}`)
    fetchList()
  } catch (error: unknown) {
    if (error === 'cancel' || error === 'close') return
    const errMsg = error instanceof Error ? error.message : `${action}失败`
    ElMessage.error(errMsg)
  }
}

async function handleDelete(notice: any) {
  try {
    await ElMessageBox.confirm(`确定要删除公告「${notice.title}」吗？此操作不可撤销！`, '删除公告', {
      type: 'error', confirmButtonText: '确认删除',
    })
    await deleteAnnouncement(notice.ID)
    ElMessage.success('已删除')
    fetchList()
  } catch (error: unknown) {
    if (error === 'cancel' || error === 'close') return
    const errMsg = error instanceof Error ? error.message : '删除失败'
    ElMessage.error(errMsg)
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.notice-page { padding: 0; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title { font-size: 24px; font-weight: bold; color: #333; margin: 0; }
.tab-header { display: flex; gap: 12px; margin-bottom: 24px; }
.badge-offset { margin-left: 6px; }

.publish-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
}

.notice-list { display: flex; flex-direction: column; gap: 16px; }
.notice-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 20px 24px;
}
.notice-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.notice-card-header h3 { margin: 0; font-size: 17px; color: #333; display: flex; align-items: center; }
.notice-body { font-size: 14px; color: #555; line-height: 1.8; white-space: pre-wrap; margin: 0 0 8px 0; }
.notice-meta { font-size: 13px; color: #999; margin-bottom: 12px; display: flex; gap: 16px; }
.notice-card-footer { display: flex; justify-content: space-between; align-items: center; }
.notice-time { font-size: 13px; color: #999; }
.notice-actions { display: flex; gap: 8px; }
</style>
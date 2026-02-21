<template>
  <div class="notice-page">
    <div class="notice-layout">
      <!-- 左侧菜单 -->
      <aside class="notice-sidebar">
        <div class="sidebar-title">
          <el-icon color="#e6a23c"><Bell /></el-icon>
          <span>公告</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
        <div
          class="sidebar-item"
          :class="{ active: currentTab === 'region' }"
          @click="currentTab = 'region'"
        >
          <el-icon color="#e6a23c"><FolderOpened /></el-icon>
          <span>发布区域公告</span>
        </div>
        <div
          class="sidebar-item"
          :class="{ active: currentTab === 'system' }"
          @click="currentTab = 'system'"
        >
          <span class="dot-red" v-if="hasUnread"></span>
          <el-icon color="#666"><Flag /></el-icon>
          <span>系统公告</span>
        </div>
      </aside>

      <!-- 右侧内容 -->
      <div class="notice-content">
        <!-- 区域公告 -->
        <div v-if="currentTab === 'region'">
          <div class="tab-header">
            <el-button
              :type="regionSubTab === 'history' ? 'warning' : 'default'"
              round
              @click="regionSubTab = 'history'"
            >历史区域公告</el-button>
            <el-button
              :type="regionSubTab === 'publish' ? 'warning' : 'default'"
              round
              @click="regionSubTab = 'publish'"
            >发布区域公告</el-button>
          </div>

          <!-- 历史公告列表 -->
          <div v-if="regionSubTab === 'history'" class="notice-list" v-loading="loading">
            <div
              v-for="notice in noticeList"
              :key="notice.ID || notice.id || notice._localId"
              class="notice-card"
            >
              <h3 class="notice-title">{{ notice.title }}</h3>
              <div class="notice-body">{{ notice.content }}</div>
              <div class="notice-footer">
                <span class="notice-status" :class="getStatusClass(notice)">
                  {{ getStatusText(notice) }}
                </span>
                <div class="notice-meta-right">
                  <span class="notice-region">区域：{{ getRegionLabel(notice) }}</span>
                  <span class="notice-date">发布时间：{{ formatTime(notice.CreatedAt || notice.created_at || notice._localTime) }}</span>
                </div>
              </div>
            </div>
            <el-empty v-if="noticeList.length === 0" description="暂无公告" />
          </div>

          <!-- 发布公告表单 -->
          <div v-if="regionSubTab === 'publish'" class="publish-form">
            <el-form :model="publishForm" label-width="80px">
              <el-form-item label="公告标题">
                <el-input v-model="publishForm.title" placeholder="请输入公告标题" />
              </el-form-item>
              <el-form-item label="公告内容">
                <el-input
                  v-model="publishForm.content"
                  type="textarea"
                  :rows="10"
                  placeholder="请输入公告内容"
                />
              </el-form-item>
              <el-form-item label="发布区域">
                <el-select
                  v-model="publishForm.region"
                  placeholder="请选择发布区域"
                  style="width: 100%;"
                >
                  <el-option label="朝晖校区" value="朝晖校区" />
                  <el-option label="屏风校区" value="屏风校区" />
                  <el-option label="莫干山校区" value="莫干山校区" />
                </el-select>
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
        </div>

        <!-- 系统公告 -->
        <div v-if="currentTab === 'system'">
          <h2 class="section-title">系统公告</h2>
          <div class="notice-list">
            <div
              v-for="notice in systemNoticeList"
              :key="notice.ID || notice.id"
              class="notice-card"
            >
              <h3 class="notice-title">{{ notice.title }}</h3>
              <div class="notice-body">{{ notice.content }}</div>
              <div class="notice-footer">
                <div class="notice-meta-right">
                  <span class="notice-region">区域：{{ getRegionLabel(notice) }}</span>
                  <span class="notice-date">
                    发布时间：{{ formatTime(notice.CreatedAt || notice.created_at) }}
                  </span>
                </div>
                <el-button
                  v-if="!notice.confirmed"
                  type="warning"
                  size="small"
                  @click="confirmNotice(notice)"
                >确认</el-button>
                <el-button
                  v-else
                  type="info"
                  size="small"
                  disabled
                >已确认</el-button>
              </div>
            </div>
            <el-empty v-if="systemNoticeList.length === 0" description="暂无系统公告" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Bell, ArrowDown, FolderOpened, Flag } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import {
  getAnnouncements,
  createAnnouncement,
} from '@/api/admin'

const currentTab = ref('region')
const regionSubTab = ref('history')
const userStore = useUserStore()

const loading = ref(false)
const publishing = ref(false)
const confirmedNoticeIds = ref<number[]>([])

// 区域公告列表（包含后端返回的 + 本地刚发布的）
const noticeList = ref<any[]>([])
// 系统公告列表
const systemNoticeList = ref<any[]>([])
// 本地发布的公告（解决发布接口和获取接口不在同一数据源的问题）
const localPublished = ref<any[]>([])

const hasUnread = computed(() => systemNoticeList.value.some((n: any) => !n.confirmed))

let localIdCounter = 0

const publishForm = reactive({
  title: '',
  content: '',
  region: '',
  is_top: false,
})

function formatTime(t: string | undefined): string {
  if (!t) return ''
  return new Date(t).toLocaleString('zh-CN')
}

function loadConfirmedNoticeIds() {
  try {
    const raw = localStorage.getItem('admin_confirmed_notice_ids')
    const list = raw ? JSON.parse(raw) : []
    confirmedNoticeIds.value = Array.isArray(list) ? list.map((v) => Number(v)).filter(Boolean) : []
  } catch {
    confirmedNoticeIds.value = []
  }
}

function saveConfirmedNoticeIds() {
  localStorage.setItem('admin_confirmed_notice_ids', JSON.stringify(confirmedNoticeIds.value))
}

function localRegionDraftKey() {
  return `admin_region_notice_drafts_${userStore.username || 'unknown'}`
}

function loadLocalPublished() {
  try {
    const raw = localStorage.getItem(localRegionDraftKey())
    const list = raw ? JSON.parse(raw) : []
    localPublished.value = Array.isArray(list) ? list : []
    localIdCounter = localPublished.value.reduce((max: number, item: any) => {
      const id = Number(item?._localId || 0)
      return id > max ? id : max
    }, 0)
  } catch {
    localPublished.value = []
    localIdCounter = 0
  }
}

function saveLocalPublished() {
  localStorage.setItem(localRegionDraftKey(), JSON.stringify(localPublished.value))
}

function getStatusText(notice: any): string {
  const status = normalizeNoticeStatus(notice)
  if (status === 'approved') return '已审核'
  if (status === 'rejected') return '已驳回'
  return '未审核'
}

function getStatusClass(notice: any): string {
  const status = normalizeNoticeStatus(notice)
  if (status === 'approved') return 'pass'
  if (status === 'rejected') return 'reject'
  return 'pending'
}

function normalizeNoticeStatus(notice: any): string {
  const s = String(notice?.status ?? notice?.review_status ?? '').toLowerCase()
  if (['approved', 'allow', 'allowed', 'pass', 'passed', 'published', 'success'].includes(s)) return 'approved'
  if (['rejected', 'reject', 'denied', 'deny', 'failed', 'refused'].includes(s)) return 'rejected'
  return 'pending'
}

function getRegionLabel(notice: any): string {
  const type = String(notice?.type ?? notice?.announcement_type ?? notice?.notice_type ?? '').toLowerCase()
  const region = String(notice?.region ?? '').trim()
  if (type.includes('system')) return '全体用户'
  return region || '未指定'
}

function isNoticeOwnedByCurrentUser(notice: any): boolean {
  const currentUsername = String(userStore.username || '').toLowerCase()
  if (!currentUsername) return false
  const publisherCandidates = [
    notice?.publisher,
    notice?.publisher_name,
    notice?.publisher_username,
    notice?.creator,
    notice?.created_by,
  ]
  return publisherCandidates.some((v) => String(v ?? '').toLowerCase() === currentUsername)
}

/** 获取公告列表 - 合并后端数据和本地发布的 */
async function fetchNoticeList() {
  loading.value = true
  try {
    const res = await getAnnouncements({ page: 1, pageSize: 50 })
    const resData = res.data?.data ?? res.data ?? {}
    const list: any[] = Array.isArray(resData)
      ? resData
      : (resData.list ?? resData.items ?? [])

    const getType = (n: any) => String(n?.type ?? n?.announcement_type ?? n?.notice_type ?? '').toLowerCase()
    const isSystem = (n: any) => {
      const type = getType(n)
      return type.includes('system')
    }

    const regionFromApi = list.filter((n: any) => !isSystem(n))
    let systemFromApi = list.filter((n: any) => isSystem(n))
    if (systemFromApi.length === 0 && regionFromApi.length === 0 && list.length > 0) {
      systemFromApi = list
    }

    systemNoticeList.value = systemFromApi.map((n: any) => ({
      ...n,
      confirmed: confirmedNoticeIds.value.includes(Number(n.ID ?? n.id ?? 0)),
    }))

    // If backend has already returned this draft with a final status, drop local placeholder.
    localPublished.value = localPublished.value.filter((local: any) => {
      return !regionFromApi.some((apiItem: any) => {
        const sameContent = apiItem.title === local.title && apiItem.content === local.content
        const status = normalizeNoticeStatus(apiItem)
        return sameContent && status !== 'pending'
      })
    })
    saveLocalPublished()

    // Backend data has higher priority than local placeholders.
    const mergedAfterSync = [...regionFromApi]
    localPublished.value.forEach((local: any) => {
      const existsInApi = regionFromApi.some(
        (apiItem: any) => apiItem.title === local.title && apiItem.content === local.content,
      )
      if (!existsInApi) {
        mergedAfterSync.push(local)
      }
    })

    noticeList.value = mergedAfterSync.filter((n: any) => {
      const status = normalizeNoticeStatus(n)
      if (status === 'approved') return true
      return isNoticeOwnedByCurrentUser(n) || Boolean(n._isLocal)
    })
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : '获取公告失败'
    ElMessage.error(errMsg)
    noticeList.value = [...localPublished.value]
  } finally {
    loading.value = false
  }
}

async function handlePublish() {
  if (!publishForm.title.trim() || !publishForm.content.trim() || !publishForm.region.trim()) {
    ElMessage.warning('请填写标题、内容和发布区域')
    return
  }

  publishing.value = true
  try {
    const res = await createAnnouncement({
      title: publishForm.title,
      content: publishForm.content,
      region: publishForm.region,
      is_top: publishForm.is_top,
    })
    const code = Number((res as any)?.data?.code ?? 200)
    if (code !== 200) {
      const msg = String((res as any)?.data?.msg || '发布失败')
      throw new Error(msg)
    }

    // 发布成功后，立即把这条公告加到本地列表
    const newNotice = {
      _localId: ++localIdCounter,
      _isLocal: true,
      _localTime: new Date().toISOString(),
      title: publishForm.title,
      content: publishForm.content,
      status: 'pending',
      type: 'region',
      region: publishForm.region,
      publisher: userStore.username,
    }
    localPublished.value.unshift(newNotice)
    saveLocalPublished()

    ElMessage.success('发布成功')
    publishForm.title = ''
    publishForm.content = ''
    publishForm.region = ''
    regionSubTab.value = 'history'

    // 重新拉取列表（合并本地数据）
    await fetchNoticeList()
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : '发布失败'
    ElMessage.error(errMsg)
  } finally {
    publishing.value = false
  }
}

function confirmNotice(notice: any) {
  const id = Number(notice.ID ?? notice.id ?? 0)
  if (id && !confirmedNoticeIds.value.includes(id)) {
    confirmedNoticeIds.value.push(id)
    saveConfirmedNoticeIds()
  }
  notice.confirmed = true
  ElMessage.success('已确认')
}

onMounted(() => {
  loadConfirmedNoticeIds()
  loadLocalPublished()
  fetchNoticeList()
})
</script>

<style scoped>
.notice-page { padding: 0; }

.notice-layout {
  display: flex;
  gap: 24px;
  min-height: calc(100vh - 120px);
}

/* 左侧菜单 */
.notice-sidebar {
  width: 200px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  height: fit-content;
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  padding: 8px 0;
  margin-bottom: 8px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  position: relative;
  transition: all 0.2s;
}

.sidebar-item:hover,
.sidebar-item.active {
  background: #fdf6ec;
  color: #e6a23c;
}

.dot-red {
  width: 8px;
  height: 8px;
  background: #f56c6c;
  border-radius: 50%;
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
}

/* 右侧内容 */
.notice-content {
  flex: 1;
  min-width: 0;
}

.tab-header {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.section-title {
  font-size: 22px;
  font-weight: bold;
  color: #333;
  margin: 0 0 20px 0;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notice-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px 24px;
}

.notice-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0 0 12px 0;
}

.notice-body {
  font-size: 14px;
  color: #555;
  line-height: 1.8;
  white-space: pre-wrap;
  margin-bottom: 16px;
}

.notice-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.notice-status {
  font-size: 13px;
  color: #999;
}
.notice-status.pass {
  color: #67c23a;
  font-weight: bold;
}
.notice-status.reject {
  color: #f56c6c;
  font-weight: bold;
}
.notice-status.pending {
  color: #e6a23c;
  font-weight: bold;
}

.notice-date {
  font-size: 13px;
  color: #999;
}

.notice-region {
  font-size: 13px;
  color: #999;
}

.notice-meta-right {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

/* 发布表单 */
.publish-form {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
}

</style>

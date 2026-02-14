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
                <span class="notice-date">发布时间：{{ formatTime(notice.CreatedAt || notice.created_at || notice._localTime) }}</span>
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
                <span class="notice-date">
                  发布时间：{{ formatTime(notice.CreatedAt || notice.created_at) }}
                </span>
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Bell, ArrowDown, FolderOpened, Flag } from '@element-plus/icons-vue'
import {
  getAnnouncements,
  createAnnouncement,
} from '@/api/admin'

const currentTab = ref('region')
const regionSubTab = ref('history')
const hasUnread = ref(true)

const loading = ref(false)
const publishing = ref(false)

// 区域公告列表（包含后端返回的 + 本地刚发布的）
const noticeList = ref<any[]>([])
// 系统公告列表
const systemNoticeList = ref<any[]>([])
// 本地发布的公告（解决发布接口和获取接口不在同一数据源的问题）
const localPublished = ref<any[]>([])

let localIdCounter = 0

const publishForm = reactive({
  title: '',
  content: '',
  is_top: false,
})

function formatTime(t: string | undefined): string {
  if (!t) return ''
  return new Date(t).toLocaleString('zh-CN')
}

function getStatusText(notice: any): string {
  if (notice._isLocal) return '已发布（本地）'
  if (notice.status === 'approved') return '已通过'
  if (notice.status === 'pending') return '待审核'
  return notice.status || '已发布'
}

function getStatusClass(notice: any): string {
  if (notice._isLocal) return 'local'
  if (notice.status === 'approved') return 'pass'
  return ''
}

/** 获取公告列表 - 合并后端数据和本地发布的 */
async function fetchNoticeList() {
  loading.value = true
  try {
    const res = await getAnnouncements({ page: 1, pageSize: 50 })
    const resData = res.data?.data ?? res.data ?? {}
    const list: any[] = resData.list ?? resData.items ?? []

    // 后端返回的按类型分
    const regionFromApi = list.filter((n: any) => n.type !== 'system')
    systemNoticeList.value = list.filter((n: any) => n.type === 'system')

    // 合并：本地发布的排在最前面 + 后端返回的
    // 用 title+content 去重，避免后端已经入库了还重复显示
    const merged = [...localPublished.value]
    regionFromApi.forEach(apiItem => {
      const isDuplicate = localPublished.value.some(
        local => local.title === apiItem.title && local.content === apiItem.content
      )
      if (!isDuplicate) {
        merged.push(apiItem)
      }
    })

    noticeList.value = merged
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : '获取公告失败'
    ElMessage.error(errMsg)
    // 即使获取失败，本地发布的也要显示
    noticeList.value = [...localPublished.value]
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
    await createAnnouncement({
      title: publishForm.title,
      content: publishForm.content,
      is_top: publishForm.is_top,
    })

    // 发布成功后，立即把这条公告加到本地列表
    const newNotice = {
      _localId: ++localIdCounter,
      _isLocal: true,
      _localTime: new Date().toISOString(),
      title: publishForm.title,
      content: publishForm.content,
      status: 'pending',
      type: 'region',
    }
    localPublished.value.unshift(newNotice)

    ElMessage.success('发布成功')
    publishForm.title = ''
    publishForm.content = ''
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
  notice.confirmed = true
  ElMessage.success('已确认')
}

onMounted(() => {
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
}

.notice-status {
  font-size: 13px;
  color: #999;
}
.notice-status.pass {
  color: #67c23a;
  font-weight: bold;
}
.notice-status.local {
  color: #e6a23c;
  font-weight: bold;
}

.notice-date {
  font-size: 13px;
  color: #999;
}

/* 发布表单 */
.publish-form {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
}
</style>
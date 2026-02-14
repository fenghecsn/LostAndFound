<template>
  <div class="admin-layout">
    <!-- 顶部导航栏 -->
    <header class="top-nav">
      <div class="nav-left">
        <div class="logo" @click="router.push('/admin/dashboard')">
          <img src="/logo.jpg" alt="logo" class="logo-icon" />
          <span class="logo-text">失物招领</span>
        </div>
        <nav class="nav-links">
          <router-link
            to="/admin/audit"
            :class="{ active: route.path.includes('/admin/audit') && !route.path.includes('history') }"
          >
            审核管理
            <el-badge
              v-if="totalPending > 0"
              :value="totalPending"
              :max="99"
              class="nav-badge"
            />
          </router-link>
          <router-link
            to="/admin/items"
            :class="{ active: route.path === '/admin/items' }"
          >物品管理</router-link>
          <router-link
            to="/admin/notices"
            :class="{ active: route.path === '/admin/notices' }"
          >公告信息</router-link>
          <router-link
            to="/admin/dashboard"
            :class="{ active: route.path === '/admin/dashboard' }"
          >数据总览</router-link>
        </nav>
      </div>
      <div class="nav-right">
        <el-button type="danger" round size="small" @click="handleLogout">退出登录</el-button>
        <div class="user-info">
          <div class="avatar-wrapper">
            <img src="/头像框@2.png" alt="avatar-frame" class="avatar-frame" />
          </div>
          <span class="user-name">{{ userStore.nickname || userStore.username || '管理员' }}</span>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 登录后系统公告弹窗 -->
    <el-dialog
      v-model="noticeDialogVisible"
      title="📢 系统通知与公告"
      width="600px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      top="12vh"
    >
      <div class="notice-dialog-body">
        <div v-if="systemNotices.length === 0" class="notice-empty">
          <el-empty description="暂无系统公告" :image-size="80" />
        </div>
        <div v-else class="notice-scroll">
          <div
            v-for="notice in systemNotices"
            :key="notice.ID || notice.id"
            class="notice-item"
          >
            <div class="notice-item-header">
              <el-tag v-if="notice.is_top" type="danger" size="small" effect="dark">置顶</el-tag>
              <h4>{{ notice.title }}</h4>
            </div>
            <p class="notice-item-content">{{ notice.content }}</p>
            <span class="notice-item-time">
              {{ notice.CreatedAt ? new Date(notice.CreatedAt).toLocaleString('zh-CN') : '' }}
            </span>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="notice-dialog-footer">
          <span class="notice-count">共 {{ systemNotices.length }} 条公告</span>
          <el-button type="warning" size="large" @click="confirmNotices">
            我已知悉，进入系统
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getPendingItems, getPendingClaims, getAnnouncements } from '@/api/admin'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const pendingItemCount = ref(0)
const pendingClaimCount = ref(0)
const totalPending = computed(() => pendingItemCount.value + pendingClaimCount.value)

// ==================== 登录后公告弹窗 ====================
const noticeDialogVisible = ref(false)
const systemNotices = ref<any[]>([])

/** 拉取系统公告并弹窗展示 */
async function fetchAndShowNotices() {
  try {
    const res = await getAnnouncements({ page: 1, pageSize: 50 })
    const resData = res.data?.data ?? res.data ?? {}
    const list: any[] = resData.list ?? resData.items ?? []

    // 只显示系统公告 + 已通过的
    systemNotices.value = list
      .filter((n: any) => n.type === 'system' && n.status === 'approved')
      .sort((a: any, b: any) => {
        // 置顶的排前面
        if (a.is_top && !b.is_top) return -1
        if (!a.is_top && b.is_top) return 1
        return 0
      })

    // 用 sessionStorage 标记本次会话已看过公告
    const hasShown = sessionStorage.getItem('admin_notice_shown')
    if (!hasShown && systemNotices.value.length > 0) {
      noticeDialogVisible.value = true
    }
  } catch {
    // 获取失败不阻塞进入系统
    console.warn('[AdminLayout] 获取系统公告失败')
  }
}

function confirmNotices() {
  noticeDialogVisible.value = false
  sessionStorage.setItem('admin_notice_shown', 'true')
}

// ==================== 待审核数量 ====================
async function fetchPendingCounts() {
  try {
    const res = await getPendingItems({ page: 1, pageSize: 1 })
    const data = res.data?.data ?? res.data ?? {}
    pendingItemCount.value = data.total ?? 0
  } catch {
    pendingItemCount.value = 0
  }
  try {
    const res = await getPendingClaims({ page: 1, pageSize: 1 })
    const data = res.data?.data ?? res.data ?? {}
    pendingClaimCount.value = data.total ?? 0
  } catch {
    pendingClaimCount.value = 0
  }
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    userStore.clearUser()
    sessionStorage.removeItem('admin_notice_shown')
    router.push('/')
    ElMessage.success('已安全退出')
  } catch {
    // 用户取消
  }
}

onMounted(() => {
  fetchPendingCounts()
  fetchAndShowNotices()
})
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background: #fdf6ec;
}

.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 24px;
  background: #fff;
  border-bottom: 2px solid #e6a23c;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 32px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.logo-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
  color: #e6a23c;
}

.nav-links {
  display: flex;
  gap: 24px;
}

.nav-links a {
  text-decoration: none;
  color: #333;
  font-size: 15px;
  padding: 4px 0;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  position: relative;
}

.nav-links a:hover,
.nav-links a.active,
.nav-links a.router-link-active {
  color: #e6a23c;
  border-bottom-color: #e6a23c;
}

.nav-badge {
  position: absolute;
  top: -8px;
  right: -20px;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-frame {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-size: 14px;
  color: #333;
}

.main-content {
  padding: 24px 40px;
  max-width: 1400px;
  margin: 0 auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ===== 公告弹窗 ===== */
.notice-dialog-body {
  max-height: 400px;
  overflow: hidden;
}

.notice-scroll {
  max-height: 380px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-right: 8px;
}

.notice-empty {
  padding: 40px 0;
}

.notice-item {
  background: #fef8ee;
  border: 1px solid #f5d4a0;
  border-radius: 8px;
  padding: 16px;
}

.notice-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.notice-item-header h4 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.notice-item-content {
  font-size: 14px;
  color: #555;
  line-height: 1.8;
  white-space: pre-wrap;
  margin: 0 0 8px 0;
}

.notice-item-time {
  font-size: 12px;
  color: #999;
}

.notice-dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notice-count {
  font-size: 13px;
  color: #999;
}
</style>
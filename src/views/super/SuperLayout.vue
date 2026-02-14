<template>
  <div class="admin-layout">
    <!-- 顶部导航栏 -->
    <header class="top-nav">
      <div class="nav-left">
        <div class="logo" @click="router.push('/super/dashboard')">
          <img src="/logo.jpg" alt="logo" class="logo-icon" />
          <span class="logo-text">失物招领 · 超管</span>
        </div>
        <nav class="nav-links">
          <router-link to="/super/dashboard" :class="{ active: route.path === '/super/dashboard' }">
            数据中心
          </router-link>
          <router-link to="/super/users" :class="{ active: route.path === '/super/users' }">
            用户管理
          </router-link>
          <router-link to="/super/notices" :class="{ active: route.path === '/super/notices' }">
            公告管理
          </router-link>
          <router-link to="/super/settings" :class="{ active: route.path === '/super/settings' }">
            系统设置
          </router-link>
          <router-link to="/super/feedback" :class="{ active: route.path === '/super/feedback' }">
            反馈中心
          </router-link>
        </nav>
      </div>
      <div class="nav-right">
        <el-tag type="danger" effect="dark" size="small" style="margin-right: 8px;">超级管理员</el-tag>
        <el-button type="danger" round size="small" @click="handleLogout">退出登录</el-button>
        <div class="user-info">
          <div class="avatar-wrapper">
            <img src="/头像框@2.png" alt="avatar-frame" class="avatar-frame" />
          </div>
          <span class="user-name">{{ userStore.nickname || userStore.username || '超管' }}</span>
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
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    userStore.clearUser()
    router.push('/')
    ElMessage.success('已安全退出')
  } catch {
    // 用户取消
  }
}
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
  border-bottom: 2px solid #f56c6c;
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
  color: #f56c6c;
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
}

.nav-links a:hover,
.nav-links a.active,
.nav-links a.router-link-active {
  color: #f56c6c;
  border-bottom-color: #f56c6c;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
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
</style>
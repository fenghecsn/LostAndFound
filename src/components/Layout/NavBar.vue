<template>
  <div class="nav-bar">
    <div class="left-section">
      <div class="logo-circle">
        <img src="/DIV@1x.png" style="width: 16px; height: 16px;"> <!-- 使用公共资源中的图片 -->
      </div>
      <span class="system-title">失物招领</span>
    </div>

    <div class="center-nav">
      <div
        v-for="nav in navs"
        :key="nav.label"
        class="nav-item"
        :class="{ active: isActive(nav) }"
        @click="handleNavClick(nav)"
      >
        <img :src="isActive(nav) ? nav.icon.active : nav.icon.normal" style="width: 16px; height: 16px;"> <!-- 使用公共资源中的图片 -->
        <span>{{ nav.label }}</span>
      </div>
    </div>

    <div class="right-actions">
      <div class="publish-dropdown-wrapper" ref="publishWrapper">
        <button class="publish-btn" @click="toggleDropdown" style="background-color: #f97316; width: 40px;height: 22.4px;border-radius: 10%;">发布</button>
        <div v-if="showDropdown" class="publish-dropdown">
          <ConfirmButton
            class="dropdown-item"
            label="捡到贴"
            title="请确认"
            message="确定发布捡到贴吗？"
            confirm-text="确认发布"
            cancel-text="取消"
            @confirm="handlePublish('found')"
          />
          <ConfirmButton
            class="dropdown-item"
            label="失物贴"
            title="请确认"
            message="确定发布失物贴吗？"
            confirm-text="确认发布"
            cancel-text="取消"
            @confirm="handlePublish('lost')"
          />
        </div>
      </div>
      <div class="user-dropdown-wrapper">
        <div class="user-trigger">
          <div class="user-info" style="padding-top: 3px; display: flex; align-items: center;">
             <img :src="userStore.avatar || '/头像框@7.png'" style="align-items: center; padding: 0; width: 16px; height: 16px;">
          </div>
          <span class="user-name">{{ userStore.nickname}}</span>
        </div>
        <div class="user-dropdown-menu">
             <ConfirmButton
                class="dropdown-item"
                label="退出登录"
                title="确认退出"
                message="确定要退出登录吗？"
                confirm-text="确认"
                cancel-text="取消"
                @confirm="handleLogout"
              />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ConfirmButton from '../ConfirmButton.vue'
import {useUserStore} from '@/stores/user'
import { ElMessage } from 'element-plus'
import { logoutApi } from '@/api/user'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

interface NavItem {
  label: string;
  path: string;
  icon: {
    normal: string;
    active: string;
  };
}

const navs: NavItem[] = [
  {
    label: '首页',
    path: '/StudentHome',
    icon: {
      normal: '/路径@1x.png',
      active: '/路径@13.png',
    },
  },
  {
    label: '消息',
    path: '/StudentHome/message/activities',
    icon: {
      normal: '/路径@14.png',
      active: '/路径@2.png',
    },
  },
  {
    label: '个人中心',
    path: '/StudentHome/profile',
    icon: {
      normal: '/路径@3.png',
      active: '/路径@15.png',
    },
  },
]
// 判断当前路由是否匹配导航项
const isActive = (nav: NavItem): boolean => {
  if (nav.path === '/StudentHome') {
    return route.path === '/StudentHome' || route.path === '/StudentHome/'
  }
  // 只要当前路由包含消息或个人中心的主路径（如 /StudentHome/message 或 /StudentHome/profile）就高亮
  else if (nav.path === '/StudentHome/message/activities') {
    return route.path.startsWith('/StudentHome/message')
  }
  else if (nav.path === '/StudentHome/profile') {
    return route.path.startsWith('/StudentHome/profile')
  }
  return route.path === nav.path
}
// 导航点击处理
const handleNavClick = (nav: NavItem) => {
  if (!isActive(nav)) router.push(nav.path)
}

const showDropdown = ref(false)
const publishWrapper = ref<HTMLElement | null>(null)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node
  if (publishWrapper.value && !publishWrapper.value.contains(target)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handlePublish = (type: 'found' | 'lost') => {
  showDropdown.value = false
  router.push({
    path: '/StudentHome/publish',
    query: { type }
  })
}

const handleLogout = async () => {
  try {
    const response = await logoutApi()
    if (Number(response?.data?.code) !== 200) {
      ElMessage.warning(response?.data?.msg || '退出接口调用失败，已执行本地退出')
    }
  } catch {
    ElMessage.warning('退出接口调用失败，已执行本地退出')
  }
  userStore.clearUserData()
  router.push('/')
  ElMessage.success('退出登录成功')
}
</script>

<style scoped>
.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 20px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.system-title {
  font-size: 18px;
  font-weight: bold;
  color: #f97316;
}

.center-nav {
  display: flex;
  gap: 40px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-item:hover, .nav-item.active {
  color: #f97316;
}

.right-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.publish-btn {
  color: white;
  border: none;
  font-weight: bold;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.user-name {
  font-size: 14px;
  color: #666;
}

.publish-dropdown-wrapper {
  position: relative;
  display: inline-block;
}

.publish-dropdown {
  position: absolute;
  top: 110%;
  left: 0;
  min-width: 90px;
  background: #fff;
  border: 1px solid #f6e7d8;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  z-index: 999;
  padding: 4px 0;
}

.publish-dropdown :deep(.confirm-button) {
  width: 100%;
  padding: 8px 16px;
  border-radius: 0;
  background: transparent;
  color: #f97316;
  font-size: 14px;
  font-weight: 500;
  text-align: left;
}

.publish-dropdown :deep(.confirm-button:hover) {
  background: #fff7ed;
}

/* User Dropdown Styles */
.user-dropdown-wrapper {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 100%;
}

.user-dropdown-menu {
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 100px;
  background: #fff;
  border: 1px solid #f6e7d8;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 4px 0;
  z-index: 1000;
}

.user-dropdown-wrapper:hover .user-dropdown-menu {
  display: block;
}

.user-dropdown-menu :deep(.confirm-button) {
  display: block; /* confirm-button usually fits content, make it block/full width */
  width: 100%;
  padding: 10px 16px;
  border-radius: 0;
  background: transparent;
  color: #606266;
  font-size: 14px;
  text-align: left;
  box-sizing: border-box;
}

.user-dropdown-menu :deep(.confirm-button:hover) {
  background-color: #fdf6ec;
  color: #f97316;
}

</style>

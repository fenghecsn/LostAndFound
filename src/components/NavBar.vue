<template>
  <div class="nav-bar">
    <div class="left-section">
      <div class="logo-circle">
        <img src="../../public/DIV@1x.png" style="width: 16px; height: 16px;"> <!-- 使用公共资源中的图片 -->
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
      <div class="user-info"style= "padding-top: 3px;">
        <img src="../../public/头像框@7.png" style="align-items: center; padding: 0; width: 16px; height: 16px;">
      </div>
      <div class="user-info">
        <span class="user-name">陈某某</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ConfirmButton from './ConfirmButton.vue'

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
      normal: '../../public/路径@1x.png',
      active: '../../public/路径@13.png',
    },
  },
  {
    label: '消息',
    path: '/StudentHome/message/activities',
    icon: {
      normal: '../../public/路径@14.png',
      active: '../../public/路径@2.png',
    },
  },
  {
    label: '个人中心',
    path: '/StudentHome/profile',
    icon: {
      normal: '../../public/路径@3.png',
      active: '../../public/路径@15.png',
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
  // 跳转到对应的发布页面，或弹窗等
  if (type === 'found') {
    router.push('/StudentHome/publish-found')
  } else {
    router.push('/StudentHome/publish-lost')
  }
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
  position: relative;
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

</style>

<template>
  <div class="admin-layout">
    <header class="admin-header">
      <div class="header-left">
        <div class="logo-box">🔍</div>
        <span class="logo-text">失物招领后台</span>
      </div>
      
      <nav class="header-center">
        <div 
          v-for="nav in topNavs" 
          :key="nav.id"
          class="nav-item"
          :class="{ active: currentModule === nav.id }"
          @click="switchModule(nav)"
        >
          {{ nav.name }}
        </div>
      </nav>

      <div class="header-right">
        <div class="user-info">
          <img src="@/assets/login.png" class="avatar" alt="avatar" />
          <span class="username">管理员</span>
        </div>
        <el-button link type="info" @click="handleLogout">退出</el-button>
      </div>
    </header>

    <div class="main-container">
      <aside class="admin-sidebar" v-if="sidebarMenus.length > 0">
        <div class="sidebar-group">
          <div class="group-title">
             <span>{{ currentModuleName }}</span>
          </div>
          <div class="menu-list">
            <div 
              v-for="menu in sidebarMenus" 
              :key="menu.path"
              class="sub-item"
              :class="{ active: $route.path === menu.path }"
              @click="$router.push(menu.path)"
            >
              <span class="dot">●</span>
              <span>{{ menu.name }}</span>
            </div>
          </div>
        </div>
      </aside>

      <main class="admin-main">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

type MenuItem = {
  path: string
  name: string
}

const router = useRouter()
const route = useRoute()

const topNavs = [
  { id: 'dashboard', name: '数据总览', path: '/admin/dashboard' },
  { id: 'audit', name: '审核管理', path: '/admin/audit-posts' }, 
  { id: 'items', name: '物品管理', path: '/admin/items' },
  { id: 'notices', name: '公告信息', path: '/admin/notices' }
]

const currentModule = computed(() => {
  const path = route.path
  if (path.includes('/audit')) return 'audit'
  if (path.includes('/items')) return 'items'
  if (path.includes('/notices')) return 'notices'
  return 'dashboard'
})

const currentModuleName = computed(() => {
  const nav = topNavs.find(n => n.id === currentModule.value)
  return nav ? nav.name : '控制台'
})

// 移除“审核管理”的侧边栏，因为页面里只有两个功能，无需侧边导航
const sidebarMenus = computed<MenuItem[]>(() => {
  // if (currentModule.value === 'audit') {
  //   return [ ... ] // 已删除
  // }
  return [] 
})

const switchModule = (nav: any) => {
  router.push(nav.path)
}

const handleLogout = () => {
  router.push('/')
}
</script>

<style scoped>
/* 样式保持不变 */
.admin-layout { height: 100vh; display: flex; flex-direction: column; background-color: #fdf6ec; }
.admin-header { height: 60px; background: #fff; display: flex; align-items: center; padding: 0 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); z-index: 10; }
.header-left { display: flex; align-items: center; gap: 10px; width: 200px; }
.logo-box { width: 32px; height: 32px; background: #f97316; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; }
.logo-text { font-weight: bold; font-size: 18px; color: #333; }
.header-center { flex: 1; display: flex; justify-content: center; gap: 40px; height: 100%; }
.nav-item { display: flex; align-items: center; height: 100%; cursor: pointer; color: #666; font-size: 15px; border-bottom: 3px solid transparent; }
.nav-item.active { color: #f97316; font-weight: bold; border-bottom-color: #f97316; }
.header-right { display: flex; align-items: center; gap: 15px; }
.user-info { display: flex; align-items: center; gap: 8px; font-size: 14px; }
.avatar { width: 30px; height: 30px; border-radius: 50%; background: #eee; }
.main-container { flex: 1; display: flex; overflow: hidden; }
.admin-sidebar { width: 220px; background: #fff; border-right: 1px solid #eee; display: flex; flex-direction: column; padding-top: 20px; }
.sidebar-group { padding: 0 10px; }
.group-title { padding: 10px 15px; font-size: 13px; color: #999; font-weight: bold; margin-bottom: 5px; }
.sub-item { display: flex; align-items: center; gap: 10px; padding: 12px 15px; cursor: pointer; color: #666; font-size: 14px; border-radius: 8px; margin-bottom: 5px; transition: all 0.2s; }
.sub-item:hover { background-color: #fff7ed; color: #f97316; }
.sub-item.active { background-color: #fff7ed; color: #f97316; font-weight: 500; }
.dot { font-size: 12px; transform: scale(0.8); }
.admin-main { flex: 1; padding: 20px; overflow-y: auto; }
</style>
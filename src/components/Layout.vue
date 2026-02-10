<template>
  <div class="main-layout">
    <NavBar />
    <div class="content-wrapper">
      <div class="sidebar-wrapper">
         <SideBar />
      </div>
      <div class="main-content">
        <!-- 这里放页面主要内容 -->
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
import SideBar from '@/components/SideBar.vue'
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  max-width: 1800px; /* 限制最大宽度 */

  background-color: #fdf6ec; /* 浅橙色背景*/
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  display: flex;
  flex: 1;
  max-width: 1800px; /* 限制最大宽度 */
  margin: 0 auto;
  width: 100%;
  padding: 20px;
  gap: 20px;
}

.sidebar-wrapper {
  width: 240px;
  flex-shrink: 0;
}

.main-content {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 20px;
}
</style>

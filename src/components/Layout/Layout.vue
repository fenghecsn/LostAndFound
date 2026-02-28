<template>
  <div class="main-layout">
    <NavBar :is-collapsed="isCollapsed" @toggle-collapse="isCollapsed = !isCollapsed" />
    <div class="content-wrapper">
      <div class="sidebar-wrapper" :class="{ collapsed: isCollapsed }">
        <SideBar />
      </div>
      <div class="main-content">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import NavBar from '@/components/Layout/NavBar.vue'
import SideBar from '@/components/Layout/SideBar.vue'
import { useMessageNoticeStore } from '@/stores/messageNotice'

const messageNoticeStore = useMessageNoticeStore()
const isCollapsed = ref(false)

onMounted(() => {
  messageNoticeStore.initConnection()
})

onBeforeUnmount(() => {
  messageNoticeStore.closeConnection()
})
</script>

<style scoped>
.main-layout {
  height: 100vh;
  min-height: 100vh;
  max-width: 1800px;
  margin: 0 auto;
  background-color: #fdf6ec;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-wrapper {
  display: flex;
  flex: 1;
  width: 100%;
  min-height: 0;
  background-color: #fff;
  padding: 20px;
  gap: 20px;
  align-items: stretch;
  box-sizing: border-box;
}

.sidebar-wrapper {
  width: 240px;
  flex-shrink: 0;
  height: 100%;
  align-self: stretch;
  overflow: hidden;
  transition: all 0.3s ease;
}

.sidebar-wrapper.collapsed {
  width: 0;
  padding: 0;
  margin: 0;
  overflow: hidden;
}

.main-content {
  flex: 1;
  background-color: #fdf6ec;
  border-radius: 8px;
  padding: 20px;
  height: 100%;
  min-height: 0;
  overflow: auto;
  box-sizing: border-box;
}
</style>

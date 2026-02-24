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
  min-height: 100vh;
  max-width: 1800px;
  margin: 0 auto;
  background-color: #fdf6ec;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  display: flex;
  flex: 1;
  width: 100%;
  padding: 20px;
  gap: 20px;
  align-items: stretch;
}

.sidebar-wrapper {
  width: 240px;
  flex-shrink: 0;
  position: sticky;
  top: 80px;
  align-self: flex-start;
  height: calc(100vh - 100px);
  transition: all 0.25s ease;
}

.sidebar-wrapper.collapsed {
  width: 0;
  padding: 0;
  margin: 0;
  overflow: hidden;
}

.main-content {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  min-width: 0;
  min-height: calc(100vh - 100px);
}
</style>

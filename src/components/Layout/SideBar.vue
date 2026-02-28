<template>
  <div class="side-bar-container">
    <div class="side-bar">
      <div class="menu-group">
        <div class="group-title" @click="isExpanded = !isExpanded">
          <div class="title-left">
            <img src="/路径@2.png" class="menu-icon" />
            <span>消息通知</span>
          </div>
          <span :class="['arrow-icon', { 'is-rotated': !isExpanded }]">&#9662;</span>
        </div>

        <div class="menu-list" v-show="isExpanded">
          <div
            v-for="(item, idx) in menuItems"
            :key="item.label"
            class="menu-item"
            :class="{ active: activeIndex === idx }"
            @click="handleMenuClick(idx)"
          >
            <span class="red-dot-placeholder">
              <span v-if="shouldShowDot(item.dotKey)" class="red-dot"></span>
            </span>
            <img :src="`/路径@${4 + idx}.png`" class="menu-icon" />
            <span>{{ item.label }}</span>
          </div>
        </div>
      </div>

      <div class="contact-list" v-if="isMessageRoute">
        <div
          v-for="session in chatSessionStore.sessions"
          :key="session.target_id"
          class="contact-card"
          :class="{ active: currentTargetId === session.target_id }"
          @click="handleSessionClick(session.target_id, session.target_name)"
        >
          <img :src="session.avatar || '/头像框@7.png'" class="contact-avatar" />
          <div class="contact-info">
            <div class="contact-name">{{ session.target_name }}</div>
            <div class="contact-status">{{ session.last_msg || '点击查看聊天记录' }}</div>
          </div>
          <span v-if="session.unread_count > 0" class="session-badge">{{ session.unread_count }}</span>
        </div>

        <div v-if="!chatSessionStore.loading && chatSessionStore.sessions.length === 0" class="contact-empty">
          暂无会话
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMessageNoticeStore, type MessageScope } from '@/stores/messageNotice'
import { useChatSessionStore } from '@/stores/chatSession'

const router = useRouter()
const route = useRoute()
const isExpanded = ref(true)
const messageNoticeStore = useMessageNoticeStore()
const chatSessionStore = useChatSessionStore()

type DotKey = MessageScope

const menuItems = [
  { label: '帖子动态', route: '/StudentHome/message/activities', dotKey: 'activity' as DotKey },
  { label: '招领进度', route: '/StudentHome/message/progress', dotKey: 'claim_progress' as DotKey },
  { label: '所有公告', route: '/StudentHome/message/announce', dotKey: 'announcement' as DotKey },
  { label: '系统通知', route: '/StudentHome/message/system_board', dotKey: '' as DotKey },
]

const shouldShowDot = (dotKey: DotKey) => messageNoticeStore.hasScopeUnread(dotKey)

const activeIndex = ref(0)

const updateActiveIndex = () => {
  if (route.path === '/StudentHome' || route.path === '/StudentHome/' || route.path === '/StudentHome/profile') {
    activeIndex.value = -1
    return
  }
  const idx = menuItems.findIndex(item => route.path.startsWith(item.route))
  activeIndex.value = idx !== -1 ? idx : -1
}

watch(() => route.path, updateActiveIndex, { immediate: true })

const isMessageRoute = computed(() => route.path.startsWith('/StudentHome/message'))
const currentTargetId = computed(() => Number(route.params.targetId || 0))

watch(
  () => route.path,
  (path) => {
    const matchedItem = menuItems.find((item) => path.startsWith(item.route))
    if (!matchedItem) return
    messageNoticeStore.clearScopeUnread(matchedItem.dotKey)
  },
  { immediate: true },
)

watch(
  () => route.path,
  async (path) => {
    if (!path.startsWith('/StudentHome/message')) return
    await chatSessionStore.fetchSessions()
  },
  { immediate: true },
)

onMounted(async () => {
  if (!route.path.startsWith('/StudentHome/message')) return
  await chatSessionStore.fetchSessions()
})

const handleMenuClick = (idx: number) => {
  activeIndex.value = idx
  const selected = menuItems[idx]
  if (selected) {
    messageNoticeStore.clearScopeUnread(selected.dotKey)
    router.push(selected.route)
    return
  }
  router.push('/')
}

const handleSessionClick = (targetId: number, targetName: string) => {
  router.push({
    path: `/StudentHome/message/chat/${targetId}`,
    query: { target_name: targetName },
  })
}
</script>

<style scoped>
.side-bar-container {
  display: flex;
  min-width: 240px;
  height: 100%;
}

.side-bar {
  width: 240px;
  background-color: #fff;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  border-right: 1px solid #f6e7d8; /* 增加分割线 */
  flex: 1 1 0;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
}

.menu-group {
  display: flex;
  flex-direction: column;
}

.group-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  cursor: pointer;
  color: #333;
  font-weight: 700;
  font-size: 15px;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-icon {
  width: 16px;
  height: 16px;
}

.arrow-icon {
  transition: transform 0.3s;
  font-size: 16px;
  color: #999;
  margin-left: 8px;
}

.is-rotated {
  transform: rotate(-90deg);
}

.menu-list {
  display: flex;
  flex-direction: column;
  margin-top: 5px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px 12px 42px;
  cursor: pointer;
  color: #666;
  font-size: 15px;
  transition: all 0.2s;
  border-radius: 16px;
  position: relative;
  margin: 0 6px;
}

.menu-item:hover {
  background-color: #fff7ed;
  color: #f97316;
}

.menu-item.active {
  background-color: #fff7ed;
  color: #f97316;
  border-right: 4px solid #f97316;
}

.red-dot-placeholder {
  display: inline-flex;
  width: 18px;
  height: 18px;
  align-items: center;
  justify-content: center;
  margin-left: -10px;
  margin-right: 2px;
}

.red-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff2222;
}

.contact-list {
  padding: 0 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
}

.contact-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: #fff7ed; /* 浅橙色 */
  border-radius: 12px;
  cursor: pointer;
  position: relative;
}

.contact-card.active {
  border: 1px solid #f6b65f;
}

.contact-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.contact-info {
  display: flex;
  flex-direction: column;
}

.contact-name {
  font-size: 14px;
  font-weight: 700;
  color: #333;
}

.contact-status {
  font-size: 12px;
  color: #888;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-badge {
  position: absolute;
  right: 10px;
  top: 8px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: #ff2222;
  color: #fff;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.contact-empty {
  text-align: center;
  color: #999;
  font-size: 13px;
  padding: 8px 0;
}
</style>

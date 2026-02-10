<template>
  <div class="side-bar-container">
    <div class="side-bar">
      <div class="menu-group">
        <div class="group-title" @click="isExpanded = !isExpanded">
          <div class="title-left">
            <img src="../../public/路径@2.png" style="width: 16px; height: 16px;">
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
              <span v-if="showDot[item.dotKey]" class="red-dot"></span>
            </span>
            <img :src="`../../public/路径@${4+idx}.png`" style="width: 16px; height: 16px;">
            <span>{{ item.label }}</span>
          </div>
        </div>
      </div>

      <!-- 联系人列表模拟 -->
      <div class="contact-list">
        <div class="contact-card">
          <img src="../../public/头像框@7.png" style="width: 32px; height: 32px; background-color: #f97316; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;"></img>
          <div class="contact-info">
            <div class="contact-name">张晓明</div>
            <div class="contact-status">在线</div>
          </div>
        </div>

        <div class="contact-card">
          <img src="../../public/头像框@7.png" style="width: 32px; height: 32px; background-color: #f97316; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;"></img>
          <div class="contact-info">
            <div class="contact-name">系统</div>
            <div class="contact-status">在线</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
const isExpanded = ref(true)

// 菜单项配置，dotKey加上类型断言
const menuItems = [
  {
    label: '帖子动态',
    route: '/StudentHome/message/activities',
    dotKey: 'post' as keyof typeof showDot,
  },
  {
    label: '招领进度',
    route: '/StudentHome/message/progress',
    dotKey: 'progress' as keyof typeof showDot,
  },
  {
    label: '系统公告',
    route: '/StudentHome/message/announce',
    dotKey: 'announce' as keyof typeof showDot,
  },
]

// 控制每个卡片红点显示
const showDot = reactive({
  post: true,        // 帖子动态
  progress: true,    // 招领进度
  announce: false    // 系统公告
})

// 当前高亮index
const activeIndex = ref(0)

// 根据当前路由自动高亮
const updateActiveIndex = () => {
  const idx = menuItems.findIndex(item => route.path.startsWith(item.route))
  activeIndex.value = idx !== -1 ? idx : 0
}

watch(() => route.path, updateActiveIndex, { immediate: true })

// 点击跳转
const handleMenuClick = (idx: number) => {
  activeIndex.value = idx
  router.push(menuItems[idx]?.route || '/')
}
</script>

<style scoped>
.side-bar-container {
  display: flex;
  background-color: #fff; /* 白色*/

}
.side-bar {
  width: 240px;
  background-color: #fff; /* 白色*/
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  border-right: 1px solid #f6e7d8; /* 增加分割线 */
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
  font-weight: bold;
  font-size: 15px;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 8px;
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
  padding: 12px 20px 12px 42px; /* 增加左缩进 */
  cursor: pointer;
  color: #666;
  font-size: 15px;
  transition: all 0.2s;
  border-radius: 16px;
  position: relative;
  background: transparent;
  margin: 0;
}

.menu-item:hover {
  background-color: #fff7ed;
  color: #f97316;
}

.menu-item.active {
  background-color: #fff7ed;
  color: #f97316;
  border-right: 4px solid #f97316;
  /* 关键：加白色外圈 */
  box-shadow: 0 0 0 6px #fff;
  z-index: 1;
  margin: 0 6px; /* 让白色空隙可见 */
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
  background-color: #fff7ed;
  border-radius: 12px;
  cursor: pointer;
  position: relative;
}

.contact-info {
  display: flex;
  flex-direction: column;
}

.contact-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.contact-status {
  font-size: 12px;
  color: #888;
}

/* 联系人卡片左侧红色数字气泡 */
.contact-card .contact-avatar {
  position: relative;
}
.contact-card .contact-avatar-badge {
  position: absolute;
  left: -8px;
  top: -8px;
  width: 18px;
  height: 18px;
  background: #ff2222;
  color: #fff;
  border-radius: 50%;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  z-index: 2;
}
</style>

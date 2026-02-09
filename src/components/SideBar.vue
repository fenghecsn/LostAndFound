<template>
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
        <div class="menu-item" :class="{ active: activeIndex === 0 }" @click="activeIndex = 0">
          <span class="red-dot-placeholder">
            <span v-if="showDot.post" class="red-dot"></span>
          </span>
          <img src="../../public/路径@4.png" style="width: 16px; height: 16px;">
          <span>帖子动态</span>
        </div>
        <div class="menu-item" :class="{ active: activeIndex === 1 }" @click="activeIndex = 1">
          <span class="red-dot-placeholder">
            <span v-if="showDot.progress" class="red-dot"></span>
          </span>
          <img src="../../public/路径@5.png" style="width: 16px; height: 16px;">
          <span>招领进度</span>
        </div>
        <div class="menu-item" :class="{ active: activeIndex === 2 }" @click="activeIndex = 2">
          <span class="red-dot-placeholder">
            <span v-if="showDot.announce" class="red-dot"></span>
          </span>
          <img src="../../public/路径@6.png" style="width: 16px; height: 16px;">
          <span>系统公告</span>
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
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
const isExpanded = ref(true)
const activeIndex = ref(0)
// 控制每个卡片红点显示
const showDot = reactive({
  post: true,        // 帖子动态
  progress: true,    // 招领进度
  announce: false    // 系统公告
})
</script>

<style scoped>
.side-bar {
  width: 240px;
  background-color: #fff; /* 侧边栏可以透明或白色，截图看不出明显背景，假设白色或跟随父级 */
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  font-size: 14px;
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
  font-size: 14px;
  transition: all 0.2s;
}

.menu-item:hover {
  background-color: #fdfdfd;
  color: #f97316;
}

.menu-item.active {
  background-color: #fff7ed; /* 浅橙色背景 */
  color: #f97316;
  border-right: 3px solid #f97316;
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
  background-color: #fff7ed; /* 卡片背景色 */
  border-radius: 12px;
  cursor: pointer;
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
</style>

<template>
  <div class="nav-bar">
    <div class="left-section">
      <div class="logo-circle">
        <img src="../../public/DIV@1x.png" style="width: 16px; height: 16px;"> <!-- 使用公共资源中的图片 -->
      </div>
      <span class="system-title">失物招领</span>
    </div>

    <div class="center-nav">
      <div class="nav-item">
        <img src="../../public/路径@1x.png" style="width: 16px; height: 16px;"> <!-- 使用公共资源中的图片 -->
        <span>首页</span>
      </div>
      <div class="nav-item">
        <img src="../../public/路径@2.png" style="width: 16px; height: 16px;"> <!-- 使用公共资源中的图片 -->
        <span>消息</span>
      </div>
      <div class="nav-item">
        <img src="../../public/路径@3.png" style="width: 16px; height: 16px;"> <!-- 使用公共资源中的图片 -->
        <span>个人中心</span>
      </div>
    </div>

    <div class="right-actions">
      <button class="publish-btn" style="background-color: #f97316; width: 40px;height: 22.4px;border-radius: 15%;">发布</button>
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
</style>

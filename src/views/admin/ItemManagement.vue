<template>
  <div class="item-mgmt">
    <div class="top-bar">
      <div class="search-wrapper">
        <el-icon class="search-icon"><Search /></el-icon>
        <input v-model="search" placeholder="搜索" class="clean-input" />
      </div>
      <button class="batch-btn">批量管理</button>
    </div>

    <div class="filter-section">
      <div class="filters">
        <div class="filter-row">
          <div 
            v-for="opt in typeOpts" 
            :key="opt" 
            class="pill" 
            :class="{ active: filters.type === opt }"
            @click="filters.type = opt"
          >
            {{ opt }}
          </div>
        </div>
        <div class="filter-row">
          <div 
            v-for="opt in statusOpts" 
            :key="opt" 
            class="pill" 
            :class="{ active: filters.status === opt }"
            @click="filters.status = opt"
          >
            {{ opt }}
          </div>
        </div>
        <div class="filter-row">
          <div 
            v-for="opt in timeOpts" 
            :key="opt" 
            class="pill" 
            :class="{ active: filters.time === opt }"
            @click="filters.time = opt"
          >
            {{ opt }}
          </div>
        </div>
      </div>
      
      <div class="illustration-box">
        <img src="@/assets/login.png" alt="Box Illustration" />
      </div>
    </div>

    <div class="card-grid">
      <div v-for="i in 6" :key="i" class="item-card">
        <div class="card-content">
          <div class="info-row">
            <span class="label">物品名称：</span>
            <span class="val">校园卡</span>
          </div>
          <div class="info-row">
            <span class="label">丢失时间：</span>
            <span class="val">2027.1.19 下午三点</span>
          </div>
          <div class="info-row">
            <span class="label">丢失地点：</span>
            <span class="val">新教301</span>
          </div>
          
          <div class="tags">
            <span class="tag tag-blue">校区: 朝晖</span>
            <span class="tag tag-orange">物品类型: 证件</span>
            <span class="tag tag-yellow">悬赏: 10元</span>
          </div>
          
          <div class="pub-time">2027.1.20 12:00发布</div>
        </div>

        <div class="card-imgs">
          <div class="img-box"></div>
          <div class="img-box"></div>
        </div>

        <div class="status-badge">已通过</div>
        
        <div class="more-options">...</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Search } from '@element-plus/icons-vue'

const search = ref('')
const filters = reactive({
  type: '全部帖子',
  status: '全部状态',
  time: '全部时间'
})

const typeOpts = ['全部帖子', '失物帖', '捡到帖']
const statusOpts = ['全部状态', '已通过', '已匹配', '已认领']
const timeOpts = ['全部时间', '0~3', '3~7', '7~15', '15~30', '>30']
</script>

<style scoped>
.item-mgmt {
  padding: 10px;
}

/* 顶部搜索 */
.top-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
}

.search-wrapper {
  position: relative;
  width: 400px;
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 18px;
}

.clean-input {
  width: 100%;
  padding: 10px 10px 10px 40px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
  font-size: 14px;
}

.batch-btn {
  background: white;
  border: 1px solid #ddd;
  padding: 8px 20px;
  border-radius: 20px;
  color: #333;
  cursor: pointer;
}

/* 筛选区 */
.filter-section {
  display: flex;
  justify-content: space-between;
  background-color: #FFFDF9; /* 米色背景 */
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.filters {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.filter-row {
  display: flex;
  gap: 15px;
}

.pill {
  background: white;
  padding: 5px 20px;
  border-radius: 15px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  border: 1px solid #eee;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.pill.active {
  background-color: #ffac6c;
  color: white;
  border-color: #ffac6c;
}

.illustration-box img {
  width: 200px;
  object-fit: contain;
}

/* 卡片网格 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.item-card {
  background: white;
  border: 1px solid #FFD6A8; /* 橙色边框 */
  border-radius: 8px;
  padding: 15px;
  display: flex;
  position: relative;
}

.card-content {
  flex: 1;
}

.info-row {
  font-size: 13px;
  margin-bottom: 5px;
  color: #333;
}

.label {
  color: #666;
}

.val {
  font-weight: 500;
}

.tags {
  display: flex;
  gap: 5px;
  margin: 10px 0;
  flex-wrap: wrap;
}

.tag {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
}

.tag-blue { background: #e0f2fe; color: #0ea5e9; }
.tag-orange { background: #ffedd5; color: #f97316; }
.tag-yellow { background: #fef9c3; color: #eab308; }

.pub-time {
  font-size: 10px;
  color: #aaa;
  margin-top: 15px;
}

.card-imgs {
  display: flex;
  gap: 5px;
  margin-left: 10px;
}

.img-box {
  width: 70px;
  height: 70px;
  background-color: #f0f0f0;
  border-radius: 4px;
}

.status-badge {
  position: absolute;
  right: 15px;
  bottom: 15px;
  color: #f56c6c; /* 红色字体 */
  font-size: 12px;
}

.more-options {
  position: absolute;
  right: 15px;
  top: 10px;
  color: #ffac6c;
  cursor: pointer;
  font-weight: bold;
}
</style>
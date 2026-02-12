<template>
  <div class="page-container">
    <div class="tabs-header">
      <div 
        class="tab-item" 
        :class="{ active: currentTab === 'history' }"
        @click="currentTab = 'history'"
      >
        历史区域公告
      </div>
      <div 
        class="tab-item" 
        :class="{ active: currentTab === 'publish' }"
        @click="currentTab = 'publish'"
      >
        发布区域公告
      </div>
      <div 
        class="tab-item" 
        :class="{ active: currentTab === 'system' }"
        @click="currentTab = 'system'"
      >
        系统公告
      </div>
    </div>

    <div class="content-area">
      
      <div v-if="currentTab === 'history'" class="history-list">
        <div class="intro-card">
          <h3>平台简介</h3>
          <p class="intro-text">
            亲爱的老师/同学：为提升失物招领效率，解决传统招领信息分散、响应滞后等问题，我们正式推出失物招领云平台...
          </p>
          <div class="intro-footer">
            <span class="status-pass">已通过</span>
            <span class="time">发布时间 2026.1.13 13:00</span>
          </div>
        </div>
      </div>

      <div v-if="currentTab === 'publish'" class="publish-form">
        <div class="form-item">
          <label>公告标题</label>
          <input 
            v-model="form.title" 
            type="text" 
            placeholder="请输入文字" 
            class="custom-input"
          />
        </div>
        <div class="form-item">
          <label>公告内容</label>
          <textarea 
            v-model="form.content" 
            rows="8" 
            placeholder="请输入文字" 
            class="custom-textarea"
          ></textarea>
        </div>
        <div class="form-actions">
          <button class="pub-btn" @click="handlePublish">发布</button>
        </div>
      </div>

      <div v-if="currentTab === 'system'" class="system-list">
        <div class="intro-card system-card" v-for="item in systemNotices" :key="item.id">
          <div class="card-header">
             <h3>{{ item.title }}</h3>
             <span class="system-tag">官方</span>
          </div>
          <p class="intro-text">{{ item.content }}</p>
          <div class="intro-footer">
            <span class="time">发布时间: {{ item.time }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const currentTab = ref('history') 
const form = ref({ title: '', content: '' })

// 系统公告数据 (硬编码)
const systemNotices = [
  { 
    id: 1, 
    title: '系统维护通知', 
    content: '为了提供更好的服务，系统将于本周六凌晨 02:00 - 04:00 进行服务器升级维护，届时将无法访问，请大家提前做好安排。', 
    time: '2026-02-10 10:00' 
  },
  { 
    id: 2, 
    title: '防诈骗安全提醒', 
    content: '近期发现有不法分子冒充失主进行诈骗，请各位同学在归还物品时务必核实对方身份（如学生证、身份证），切勿涉及金钱交易。', 
    time: '2026-01-15 09:00' 
  },
  {
    id: 3,
    title: '关于“物品有效期”的说明',
    content: '无人认领的物品将在平台展示 30 天，逾期将由管理处统一回收处理，请大家知悉。',
    time: '2026-01-01 12:00'
  }
]

const handlePublish = () => {
  if (!form.value.title || !form.value.content) {
    ElMessage.warning('请填写完整')
    return
  }
  ElMessage.success('发布成功')
  currentTab.value = 'history'
  form.value = { title: '', content: '' }
}
</script>

<style scoped>
.page-container {
  padding: 20px;
  background-color: #FFFDF9;
  min-height: 100%;
}

.tabs-header {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.tab-item {
  padding: 10px 25px;
  font-size: 16px;
  color: #999;
  cursor: pointer;
  background-color: transparent;
  font-weight: bold;
  border-radius: 20px;
  transition: all 0.3s;
}

.tab-item.active {
  color: white;
  background-color: #ffac6c;
}

/* 卡片样式 */
.intro-card {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
  margin-bottom: 20px;
  border: 1px solid #eee;
}

.system-card {
  border-left: 4px solid #f97316; /* 系统公告加个橙色竖条区分 */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.intro-card h3 {
  font-size: 18px;
  margin: 0;
  color: #333;
}

.system-tag {
  background: #fff7ed;
  color: #f97316;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.intro-text {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 15px;
}

.intro-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f5f5f5;
  padding-top: 15px;
}

.status-pass {
  color: #409eff;
  background: #ecf5ff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.time {
  color: #999;
  font-size: 12px;
}

/* 表单样式 */
.publish-form {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
  max-width: 800px;
}

.form-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 25px;
}

.form-item label {
  width: 80px;
  font-size: 14px;
  color: #333;
  padding-top: 10px;
}

.custom-input, 
.custom-textarea {
  flex: 1;
  background-color: #f2f3f5;
  border: none;
  padding: 12px;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
}

.form-actions { text-align: right; margin-top: 30px; }
.pub-btn {
  background-color: #3b82f6; color: white; border: none;
  padding: 10px 30px; border-radius: 4px; cursor: pointer;
}
</style>
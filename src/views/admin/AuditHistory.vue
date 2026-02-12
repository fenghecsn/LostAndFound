<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="title">审核记录</h2>
      <el-button class="back-btn" @click="$router.back()">返回</el-button>
    </div>

    <el-table 
      :data="historyList" 
      class="custom-table" 
      header-row-class-name="table-header"
    >
      <el-table-column prop="id" label="索引" width="80" align="center" />
      <el-table-column prop="claimTime" label="认领时间" width="180" />
      <el-table-column prop="name" label="物品名称" width="120" />
      <el-table-column label="图片" width="100">
        <template #default>
          <div class="img-placeholder">
            <el-icon><Picture /></el-icon>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="内容" show-overflow-tooltip />
      <el-table-column prop="opTime" label="操作时间" width="180" />
      <el-table-column label="历史操作" width="120">
        <template #default="{ row }">
          <span :class="row.status === '通过' ? 'status-pass' : 'status-reject'">
            {{ row.status }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center">
        <template #default>
          <el-button size="small" class="detail-btn">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination 
        background 
        layout="prev, pager, next" 
        :total="50" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Picture } from '@element-plus/icons-vue'

const historyList = ref([
  { 
    id: 1, 
    claimTime: '2026.1.13 13:00', 
    name: '卡包', 
    content: '俺的这个卡包上有一个小熊图案...', 
    opTime: '2026.1.13 13:00', 
    status: '通过' 
  },
  { 
    id: 2, 
    claimTime: '2026.1.13 13:00', 
    name: '校园卡', 
    content: '俺的这个卡上贴了一个...', 
    opTime: '2026.1.13 13:00', 
    status: '通过' 
  },
  { 
    id: 3, 
    claimTime: '2026.1.13 13:00', 
    name: '身份证', 
    content: '俺的这个身份证上有一点脏...', 
    opTime: '2026.1.13 13:00', 
    status: '驳回' 
  },
])
</script>

<style scoped>
.page-container {
  padding: 20px;
  background-color: #fff; /* 截图里背景偏白 */
  min-height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.title {
  font-size: 24px;
  color: #333;
  font-weight: normal; /* 截图字体不粗 */
}

.back-btn {
  background-color: #f97316;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 20px;
  font-size: 14px;
}

.back-btn:hover {
  background-color: #e8630c;
}

/* 表格样式复刻 */
.custom-table {
  width: 100%;
}

:deep(.table-header th) {
  background-color: #f5f5f5 !important;
  color: #666;
  font-weight: 600;
  height: 50px;
}

.img-placeholder {
  width: 40px;
  height: 40px;
  background-color: #f0f0f0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ccc;
}

.status-pass {
  color: #67c23a; /* 绿色 */
}

.status-reject {
  color: #f56c6c; /* 红色 */
}

.detail-btn {
  background-color: #f97316;
  color: white;
  border: none;
  border-radius: 15px; /* 胶囊按钮 */
  padding: 6px 15px;
}

.detail-btn:hover {
  background-color: #e8630c;
  color: white;
}

.pagination-wrapper {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

:deep(.el-pagination.is-background .el-pager li.is-active) {
  background-color: #f97316;
}
</style>
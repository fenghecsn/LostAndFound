<template>
  <div class="page-container">
    <div class="header">
      <h2 class="title">认领审核</h2>
      <el-input placeholder="搜索物品/申请人" class="search-input" :prefix-icon="Search" />
    </div>

    <div class="list-content">
      <div v-for="item in claimList" :key="item.id" class="claim-card">
        <img :src="item.image" class="item-img" />
        <div class="info">
          <div class="row-1">
            <span class="item-name">{{ item.itemName }}</span>
            <el-tag size="small">{{ item.itemType }}</el-tag>
          </div>
          <div class="row-proof">
            <span class="label">申请理由：</span>
            {{ item.proof }}
          </div>
          <div class="row-meta">
            <span>申请人: {{ item.claimer }}</span>
            <span>电话: {{ item.phone }}</span>
            <span>{{ item.time }}</span>
          </div>
        </div>
        <div class="actions">
          <el-button type="success" plain size="small" @click="handleVerify(item, true)">通过</el-button>
          <el-button type="danger" plain size="small" @click="handleVerify(item, false)">驳回</el-button>
        </div>
      </div>
      
      <div v-if="claimList.length === 0" class="empty">暂无待处理申请</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Check, Close, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 模拟认领数据
const claimList = ref([
  { id: 1, itemName: '校园卡', itemType: '证件', claimer: '王同学', phone: '188-5678-1234', proof: '卡面上有我的照片，学号 2026001', status: 0, time: '2026-02-11 14:00', image: 'https://via.placeholder.com/150' },
  { id: 2, itemName: '黑色耳机', itemType: '电子', claimer: '李四', phone: '139-0000-0000', proof: '耳机壳上有个小划痕', status: 0, time: '2026-02-11 12:30', image: 'https://via.placeholder.com/150' },
])

const handleVerify = (item: any, pass: boolean) => {
  ElMessageBox.prompt(pass ? '通过备注 (可选)' : '请输入驳回原因', pass ? '确认通过' : '确认驳回', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: pass ? /.*/ : /.+/,
    inputErrorMessage: '驳回原因不能为空'
  }).then(({ }) => {
    ElMessage.success(`操作成功：${pass ? '已通过' : '已驳回'}`)
    // 前端模拟移除
    claimList.value = claimList.value.filter(i => i.id !== item.id)
  })
}
</script>

<style scoped>
.page-container { padding: 10px; }
.header { display: flex; justify-content: space-between; margin-bottom: 20px; align-items: center; }
.title { font-size: 20px; font-weight: bold; color: #333; }
.search-input { width: 250px; }
:deep(.el-input__wrapper) { border-radius: 20px; box-shadow: 0 0 0 1px #FFD6A8 inset; }

.claim-card {
  display: flex; background: white; padding: 15px; border-radius: 12px;
  border: 1px solid #FFD6A8; margin-bottom: 15px; align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}
.item-img { width: 80px; height: 80px; border-radius: 8px; margin-right: 15px; object-fit: cover; background: #f5f5f5; }
.info { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.row-1 { display: flex; gap: 10px; align-items: center; }
.item-name { font-weight: bold; font-size: 16px; }
.row-proof { color: #666; font-size: 14px; background: #FFFDF9; padding: 8px; border-radius: 6px; }
.row-meta { font-size: 12px; color: #999; display: flex; gap: 15px; }
.actions { display: flex; flex-direction: column; gap: 10px; padding-left: 15px; border-left: 1px solid #eee; }
.empty { text-align: center; color: #999; padding: 40px; }
</style>
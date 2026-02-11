<template>
  <div class="audit-page">
    <div class="page-header">
      <div class="header-left">
        <h2 class="title">内容审核台</h2>
        <span class="subtitle">待处理事项</span>
      </div>
      <div class="header-right">
        <el-button 
          type="primary" 
          color="#f97316" 
          style="color:white; margin-right: 15px;"
          @click="$router.push('/admin/audit-history')"
        >
          查看审核记录
        </el-button>

        <el-input 
          v-model="queryParams.keyword" 
          placeholder="搜索物品 / 用户 / 手机号" 
          class="search-input"
          :prefix-icon="Search"
          clearable
          @keyup.enter="fetchData"
        />
      </div>
    </div>
    
    <div class="list-container" v-loading="loading">
      <div v-if="itemList.length === 0" class="empty-state">
        <img src="https://via.placeholder.com/200x150?text=All+Clear" alt="Empty" class="empty-img" />
        <p>太棒了！所有内容都已审核完毕 ~</p>
      </div>

      <div v-for="item in itemList" :key="item.id" class="audit-card">
        <div class="card-media">
          <el-image 
            v-if="item.images && item.images.length"
            :src="item.images[0]" 
            fit="cover" 
            class="main-img"
            :preview-src-list="item.images"
            preview-teleported
          />
          <div v-else class="no-img">
            <el-icon :size="32" color="#e0e0e0"><Picture /></el-icon>
            <span>无图</span>
          </div>
          <div v-if="item.images && item.images.length > 1" class="img-badge">+{{ item.images.length }}</div>
        </div>

        <div class="card-content">
          <div class="content-head">
            <el-tag :type="item.type === 1 ? 'warning' : 'success'" effect="dark" class="type-tag">
              {{ item.type === 1 ? '失物' : '招领' }}
            </el-tag>
            <h3 class="item-name">{{ item.name }}</h3>
            <span class="publish-time">{{ item.create_time }} 提交</span>
          </div>

          <div class="content-body">
            <p class="desc-text">{{ item.content }}</p>
          </div>

          <div class="content-foot">
            <div class="meta-row">
              <span class="meta-item"><el-icon><Location /></el-icon> {{ item.location }}</span>
              <span class="meta-item"><el-icon><Timer /></el-icon> {{ item.event_time }}</span>
            </div>
            <div class="meta-row secondary">
              <span class="meta-item"><el-icon><User /></el-icon> {{ item.username }}</span>
              <span class="meta-item"><el-icon><Phone /></el-icon> {{ item.contact }}</span>
            </div>
          </div>
        </div>

        <div class="card-actions">
          <el-button class="action-btn pass" circle size="large" @click="handlePass(item)">
            <el-icon><Check /></el-icon>
          </el-button>
          <span class="btn-label pass">通过</span>
          
          <div class="spacer"></div>
          
          <el-button class="action-btn reject" circle size="large" @click="openReject(item)">
            <el-icon><Close /></el-icon>
          </el-button>
          <span class="btn-label reject">驳回</span>
        </div>
      </div>
    </div>

    <el-dialog v-model="rejectDialogVisible" title="请选择驳回原因" width="450px" align-center destroy-on-close>
      <div class="dialog-body">
        <p class="dialog-tip">选择标签或输入原因，将反馈给用户修改：</p>
        <div class="tags-cloud">
          <el-tag 
            v-for="tag in rejectTags" 
            :key="tag" 
            class="choice-tag"
            :effect="rejectReason === tag ? 'dark' : 'plain'"
            size="large"
            @click="rejectReason = tag"
          >
            {{ tag }}
          </el-tag>
        </div>
        <el-input
          v-model="rejectReason"
          type="textarea"
          :rows="3"
          placeholder="手动输入详细原因..."
          resize="none"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rejectDialogVisible = false">取消</el-button>
          <el-button type="primary" color="#FF9E5E" style="color: white;" @click="confirmReject">确认驳回</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Check, Close, Picture, Location, User, Timer, Phone } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request' 

// --- 接口与类型定义 ---
interface AuditItem {
  id: number
  type: number 
  name: string
  content: string
  images: string[]
  location: string
  event_time: string
  username: string
  contact: string
  status: number 
  create_time: string
}

const loading = ref(false)
const itemList = ref<AuditItem[]>([])

// 筛选状态 (只查待审核 status=0)
const queryParams = reactive({
  page: 1,
  size: 20,
  status: 0, 
  keyword: ''
})

// 驳回相关
const rejectDialogVisible = ref(false)
const rejectReason = ref('')
const currentActionItem = ref<AuditItem | null>(null)
const rejectTags = ['图片模糊', '包含违规内容', '非本校物品', '联系方式缺失', '重复发布', '描述不符']

// --- 方法 ---

// 1. 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/admin/items', { params: queryParams })
    if (res.data && res.data.data) {
       itemList.value = res.data.data.list
    } else {
       throw new Error('No Data')
    }
  } catch (e) {
    console.warn('API未通，启用前端Mock数据')
    // 只显示 status 为 0 的数据
    itemList.value = mockData.filter(i => i.status === 0)
  } finally {
    loading.value = false
  }
}

// 2. 通过审核
const handlePass = (item: AuditItem) => {
  ElMessageBox.confirm(`确认通过 "${item.name}" 的发布申请吗？`, '通过确认', {
    confirmButtonText: '确认通过',
    cancelButtonText: '取消',
    type: 'success',
    icon: Check
  }).then(async () => {
    ElMessage.success('操作成功：已发布')
    // 移除当前项
    itemList.value = itemList.value.filter(i => i.id !== item.id)
    // 这里可以调用后端 API 更新状态
  })
}

// 3. 打开驳回弹窗
const openReject = (item: AuditItem) => {
  currentActionItem.value = item
  rejectReason.value = ''
  rejectDialogVisible.value = true
}

// 4. 确认驳回
const confirmReject = async () => {
  if (!rejectReason.value) return ElMessage.warning('请选择或输入驳回原因')
  ElMessage.info('操作成功：已驳回')
  rejectDialogVisible.value = false
  if (currentActionItem.value) {
    itemList.value = itemList.value.filter(i => i.id !== currentActionItem.value!.id)
    // 这里调用后端 API
  }
}

// --- Mock 数据 (只保留待审核的) ---
const mockData: AuditItem[] = [
  { id: 101, type: 1, name: '黑色折叠伞', content: '在图书馆三楼A区座位捡到的，伞柄上有个皮卡丘贴纸。', images: ['https://via.placeholder.com/150/FF9E5E/FFFFFF?text=Umbrella'], location: '图书馆', event_time: '2026-02-11', username: '陈同学', contact: '13812345678', status: 0, create_time: '10:00' },
  { id: 102, type: 2, name: '校园卡 (张三)', content: '二食堂门口捡到的，已经交给食堂阿姨了。', images: [], location: '二食堂', event_time: '2026-02-10', username: '王同学', contact: 'QQ:9876543', status: 0, create_time: '09:30' },
]

onMounted(() => fetchData())
</script>

<style scoped>
/* 全局容器 */
.audit-page { padding: 10px; }

/* 顶部样式 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}
.title { font-size: 22px; font-weight: bold; color: #333; margin: 0; }
.subtitle { font-size: 14px; color: #aaa; margin-left: 8px; font-weight: normal; }
.search-input { width: 320px; }
:deep(.el-input__wrapper) {
  border-radius: 20px;
  box-shadow: 0 0 0 1px #FFD6A8 inset !important;
}

/* 列表卡片 */
.audit-card {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #FFD6A8;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
  transition: transform 0.2s ease;
}
.audit-card:hover { transform: translateY(-3px); box-shadow: 0 6px 16px rgba(255, 133, 52, 0.1); }

/* 左侧图片 */
.card-media {
  position: relative;
  width: 140px;
  height: 140px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 20px;
  flex-shrink: 0;
  border: 1px solid #f5f5f5;
}
.main-img { width: 100%; height: 100%; }
.no-img { width: 100%; height: 100%; background: #f9f9f9; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ccc; font-size: 12px; gap: 5px; }
.img-badge { position: absolute; right: 0; bottom: 0; background: rgba(0,0,0,0.6); color: white; padding: 2px 6px; font-size: 12px; border-top-left-radius: 6px; }

/* 中间内容 */
.card-content { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.content-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.item-name { margin: 0; font-size: 18px; font-weight: bold; color: #333; }
.type-tag { border-radius: 6px; padding: 0 10px; }
.publish-time { margin-left: auto; color: #999; font-size: 12px; }

.content-body { flex: 1; margin-bottom: 12px; }
.desc-text { color: #555; font-size: 14px; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.content-foot { display: flex; flex-direction: column; gap: 6px; }
.meta-row { display: flex; gap: 20px; font-size: 13px; color: #666; align-items: center; }
.secondary { color: #999; font-size: 12px; }
.meta-item { display: flex; align-items: center; gap: 4px; }

/* 右侧按钮区 */
.card-actions { 
  width: 100px; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center;
  border-left: 1px solid #f0f0f0; 
  margin-left: 15px;
  padding-left: 15px;
}
.action-btn { width: 48px; height: 48px; font-size: 20px; margin-left: 0 !important; transition: all 0.2s; }
.action-btn.pass { background: #f0f9eb; border-color: #e1f3d8; color: #67c23a; }
.action-btn.pass:hover { background: #67c23a; color: white; transform: scale(1.1); }
.action-btn.reject { background: #fef0f0; border-color: #fde2e2; color: #f56c6c; }
.action-btn.reject:hover { background: #f56c6c; color: white; transform: scale(1.1); }

.spacer { height: 15px; }
.btn-label { font-size: 12px; margin-top: 4px; }
.btn-label.pass { color: #67c23a; }
.btn-label.reject { color: #f56c6c; }

/* 弹窗样式 */
.dialog-tip { margin-bottom: 15px; color: #666; }
.tags-cloud { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
.choice-tag { cursor: pointer; border-color: #FFD6A8; color: #666; transition: all 0.2s; }
.choice-tag:hover { color: #FF9E5E; background-color: #fdf6ec; border-color: #FF9E5E; }

/* 空状态 */
.empty-state { text-align: center; padding: 60px 0; color: #999; }
.empty-img { width: 120px; opacity: 0.5; margin-bottom: 15px; }
</style>
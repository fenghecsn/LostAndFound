<template>
  <div class="global-page">
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-icon orange"><el-icon><Trophy /></el-icon></span>
        <div class="stat-content">
          <p class="stat-label">总发布数</p>
          <p class="stat-value">{{ stats.total_items }}</p>
        </div>
      </div>
      <div class="stat-card">
        <span class="stat-icon green"><el-icon><CircleCheckFilled /></el-icon></span>
        <div class="stat-content">
          <p class="stat-label">已找回</p>
          <p class="stat-value">{{ stats.solved_items }}</p>
        </div>
      </div>
      <div class="stat-card">
        <span class="stat-icon yellow"><el-icon><WarningFilled /></el-icon></span>
        <div class="stat-content">
          <p class="stat-label">待处理</p>
          <p class="stat-value">{{ pendingCount }}</p>
        </div>
      </div>
      <div class="stat-card">
        <span class="stat-icon blue"><el-icon><UserFilled /></el-icon></span>
        <div class="stat-content">
          <p class="stat-label">活跃用户</p>
          <p class="stat-value">{{ stats.active_users }}</p>
        </div>
      </div>
    </div>

    <div class="summary-card">
      <div class="summary-title">
        <el-icon class="title-icon"><Setting /></el-icon>
        校失物招领信息总览
      </div>
      <el-button class="refresh-btn" :loading="baseLoading" @click="fetchBaseData">
        <el-icon><RefreshRight /></el-icon>
        刷新数据
      </el-button>
    </div>

    <div class="settings-card">
      <h3 class="section-title">系统参数设置</h3>

      <div class="row-two">
        <div class="field-block">
          <div class="field-label">物品类型分类</div>
          <el-input v-model="form.categoryText" />
          <div class="category-actions">
            <el-input
              v-model="newCategoryName"
              class="category-input"
              placeholder="输入新分类名称"
              maxlength="12"
              clearable
            />
            <el-button class="refresh-btn" :loading="categoryLoading" @click="handleAddCategory">添加分类</el-button>
          </div>
          <div class="category-tags">
            <el-tag
              v-for="item in categories"
              :key="item.id"
              closable
              effect="plain"
              type="warning"
              @close="handleDeleteCategory(item)"
            >
              {{ item.kind_name }}
            </el-tag>
          </div>
        </div>
        <div class="field-block">
          <div class="field-label">认领时效（天）</div>
          <el-input-number v-model="form.claimDays" :min="1" :max="365" style="width: 100%;" />
        </div>
      </div>

      <div class="field-label mt">信息发布权限</div>
      <div class="limit-row">
        <el-checkbox v-model="form.limitEnabled">发布频率限制一天最多发布</el-checkbox>
        <el-input-number v-model="form.maxPostsPerDay" :min="1" :max="20" />
        <span>个帖子</span>
      </div>

      <div class="field-label mt">内容规范 必填字段控制</div>
      <div class="rule-list">
        <span v-for="item in requiredRules" :key="item" class="rule-chip">
          <el-icon><Select /></el-icon>{{ item }}
        </span>
        <span class="rule-chip optional"><el-icon><CirclePlus /></el-icon>选项</span>
      </div>

      <div class="field-label mt">敏感词管理</div>
      <div class="rule-list">
        <span v-for="item in sensitiveRules" :key="item" class="rule-chip">
          <el-icon><Select /></el-icon>{{ item }}
        </span>
        <span class="rule-chip optional"><el-icon><CirclePlus /></el-icon>选项</span>
      </div>

      <div class="img-limit">
        <span>图片强制要求 最多</span>
        <el-input-number v-model="form.maxImages" :min="1" :max="9" />
        <span>张</span>
      </div>
      <p class="tip-text">校区、物品类型、资金帖子自带不用添加</p>

      <div class="btn-row">
        <el-button class="orange-btn" @click="previewVisible = true">预览效果</el-button>
        <el-button class="orange-btn" :loading="saveLoading" @click="handleSave">保存设置</el-button>
      </div>
    </div>

    <el-dialog v-model="previewVisible" width="1100px" destroy-on-close>
      <div class="preview-wrap">
        <div class="preview-top">
          <div class="left-tags">
            <span class="tag blue"><el-icon><Location /></el-icon>校区</span>
            <span class="tag orange"><el-icon><CollectionTag /></el-icon>物品类型</span>
            <span class="tag yellow"><el-icon><Coin /></el-icon>资金</span>
          </div>

          <div class="right-fields">
            <div class="line"><label>物品名称</label><el-input model-value="请输入文字" disabled /></div>
            <div class="line"><label>捡到/丢失时间</label><el-input model-value="请输入时间" disabled /></div>
            <div class="line"><label>捡到/丢失地点</label><el-input model-value="请输入文字" disabled /></div>
            <div class="line"><label>联系人</label><el-input model-value="请输入文字（非必填）" disabled /></div>
          </div>
        </div>

        <div class="line full"><label>联系方式</label><el-input model-value="请输入文字" disabled /></div>
        <div class="line full">
          <label>物品特征</label>
          <el-input type="textarea" :rows="3" model-value="请输入文字" disabled />
        </div>

        <div class="preview-images">
          <div class="img-placeholder"><el-icon><Picture /></el-icon></div>
          <div class="img-placeholder"><el-icon><Picture /></el-icon></div>
          <div class="img-placeholder add"><el-icon><Plus /></el-icon></div>
        </div>
        <p class="tip-text">照片最多上传4张（选填）</p>

        <div class="preview-btns">
          <el-button class="blue-btn">发布</el-button>
          <el-button class="blue-btn" @click="previewVisible = false">取消</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  CircleCheckFilled,
  CirclePlus,
  Coin,
  CollectionTag,
  Location,
  Picture,
  Plus,
  RefreshRight,
  Select,
  Setting,
  Trophy,
  UserFilled,
  WarningFilled,
} from '@element-plus/icons-vue'
import { addCategory, deleteCategory, getCategoryList, getSuperStats } from '@/api/super'

const previewVisible = ref(false)
const baseLoading = ref(false)
const saveLoading = ref(false)
const categoryLoading = ref(false)
const newCategoryName = ref('')
const categories = ref<Array<{ id: number; kind_name: string }>>([])

const stats = reactive({
  total_items: 0,
  solved_items: 0,
  active_users: 0,
  today_items: 0,
})

const form = reactive({
  categoryText: '电子产品,衣物,证件,书籍,其他',
  claimDays: 30,
  limitEnabled: true,
  maxPostsPerDay: 3,
  maxImages: 4,
})

const requiredRules = ['物品名称', '拾取/丢失地点', '拾取/丢失时间', '联系人', '联系方式', '物品特点']
const sensitiveRules = ['转账', '银行卡密码', '兼职招聘']

const pendingCount = computed(() => Math.max(stats.total_items - stats.solved_items, 0))

async function fetchBaseData() {
  baseLoading.value = true
  try {
    const [statsRes, catRes] = await Promise.allSettled([getSuperStats(), getCategoryList()])
    if (statsRes.status === 'fulfilled') {
      const s = statsRes.value.data?.data ?? statsRes.value.data ?? {}
      stats.total_items = Number(s.total_items ?? 0)
      stats.solved_items = Number(s.solved_items ?? 0)
      stats.active_users = Number(s.active_users ?? 0)
      stats.today_items = Number(s.today_items ?? 0)
    } else {
      ElMessage.error('统计数据获取失败')
    }

    if (catRes.status === 'fulfilled') {
      const c: any = catRes.value.data?.data ?? catRes.value.data ?? []
      const list = Array.isArray(c) ? c : (c?.list ?? [])
      categories.value = list
        .map((item: any) => ({
          id: Number(item.id ?? item.ID ?? 0),
          kind_name: String(item.kind_name ?? item.name ?? '').trim(),
        }))
        .filter((item: { id: number; kind_name: string }) => Boolean(item.kind_name))
      const names = categories.value.map((item) => item.kind_name)
      if (names.length > 0) form.categoryText = names.join(',')
    } else {
      ElMessage.warning('分类数据获取失败，已使用默认值')
    }
  } finally {
    baseLoading.value = false
  }
}

function syncCategoryText() {
  form.categoryText = categories.value.map((item) => item.kind_name).join(',')
}

async function handleAddCategory() {
  const name = newCategoryName.value.trim()
  if (!name) {
    ElMessage.warning('请输入分类名称')
    return
  }
  if (categoryLoading.value) return
  categoryLoading.value = true
  try {
    await addCategory({ name })
    ElMessage.success('分类添加成功')
    newCategoryName.value = ''
    await fetchBaseData()
    syncCategoryText()
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : '分类添加失败'
    ElMessage.error(err)
  } finally {
    categoryLoading.value = false
  }
}

async function handleDeleteCategory(item: { id: number; kind_name: string }) {
  if (!item.id) {
    ElMessage.warning('该分类无有效ID，无法删除')
    return
  }
  if (categoryLoading.value) return
  categoryLoading.value = true
  try {
    await deleteCategory(item.id)
    categories.value = categories.value.filter((cat) => cat.id !== item.id)
    syncCategoryText()
    ElMessage.success('分类删除成功')
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : '分类删除失败'
    ElMessage.error(err)
    await fetchBaseData()
  } finally {
    categoryLoading.value = false
  }
}

async function handleSave() {
  if (saveLoading.value) return
  saveLoading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 400))
    ElMessage.success('保存设置成功（前端演示）')
  } finally {
    saveLoading.value = false
  }
}

onMounted(fetchBaseData)
</script>

<style scoped>
.global-page {
  background: #fdf6ec;
  border: none;
  border-radius: 10px;
  padding: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 14px;
}

.stat-card {
  background: #fff;
  border: 1px solid #ececec;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.stat-icon.orange { color: #f59a23; background: #fff3e0; }
.stat-icon.green { color: #4f9b68; background: #eaf5ee; }
.stat-icon.yellow { color: #b79033; background: #fbf4df; }
.stat-icon.blue { color: #5e7ab1; background: #edf2fb; }

.stat-label {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
}

.stat-value {
  margin: 2px 0 0 0;
  color: #1f2937;
  font-size: 30px;
  font-weight: 700;
}

.summary-card {
  background: #fff;
  border: 1px solid #ececec;
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.summary-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1f2937;
  font-size: 15px;
  font-weight: 700;
}

.title-icon {
  color: #e6a23c;
}

.refresh-btn {
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #374151;
}

.category-actions {
  margin-top: 8px;
  display: flex;
  gap: 10px;
}

.category-input {
  max-width: 220px;
}

.category-tags {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.settings-card {
  background: #fff;
  border: 1px solid #ececec;
  border-radius: 10px;
  padding: 14px;
}

.section-title {
  margin: 0 0 12px 0;
  color: #1f2937;
  font-size: 16px;
  font-weight: 700;
}

.row-two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.field-label {
  font-size: 13px;
  color: #1f2937;
  margin-bottom: 6px;
  font-weight: 700;
}

.mt {
  margin-top: 12px;
}

.limit-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rule-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.rule-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #1f2937;
  font-size: 13px;
  font-weight: 500;
}

.rule-chip :deep(svg) {
  color: #e6a23c;
}

.rule-chip.optional :deep(svg) {
  color: #111827;
}

.img-limit {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #1f2937;
  font-size: 13px;
  font-weight: 600;
}

.tip-text {
  margin: 10px 0 0 0;
  color: #667085;
  font-size: 12px;
}

.btn-row {
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
  gap: 14px;
}

.orange-btn {
  background: #e6a23c;
  border-color: #e6a23c;
  color: #fff;
  min-width: 108px;
}

.preview-wrap {
  padding: 6px;
}

.preview-top {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 14px;
}

.left-tags {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tag {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 4px 12px;
  color: #fff;
}

.tag.blue { background: #6e92c8; }
.tag.orange { background: #cd9360; }
.tag.yellow { background: #c8a658; }

.right-fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.line {
  display: grid;
  grid-template-columns: 130px 1fr;
  align-items: center;
  gap: 8px;
}

.line label {
  font-size: 13px;
  color: #111827;
}

.line.full {
  margin-top: 8px;
}

.preview-images {
  margin-top: 12px;
  display: flex;
  gap: 18px;
}

.img-placeholder {
  width: 156px;
  height: 108px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #f3f4f6;
  color: #b8c0ca;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 38px;
}

.img-placeholder.add {
  background: #fff;
  color: #9ca3af;
}

.preview-btns {
  margin-top: 14px;
  display: flex;
  justify-content: center;
  gap: 40px;
}

.blue-btn {
  min-width: 100px;
  background: #409eff;
  border-color: #409eff;
  color: #fff;
}

@media (max-width: 960px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .row-two,
  .preview-top {
    grid-template-columns: 1fr;
  }
}
</style>


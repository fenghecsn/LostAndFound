<template>
  <div class="settings-page">
    <h2 class="page-title">系统设置</h2>

    <!-- 物品分类管理 -->
    <div class="settings-card">
      <h3><el-icon color="#e6a23c"><PriceTag /></el-icon> 物品分类管理</h3>
      <div class="category-section">
        <div class="category-add">
          <el-input
            v-model="newCategory"
            placeholder="输入新分类名称"
            style="width: 240px;"
            @keyup.enter="handleAddCategory"
          />
          <el-button type="primary" :loading="addLoading" @click="handleAddCategory">添加分类</el-button>
          <el-button plain @click="fetchCategories">
            <el-icon><Refresh /></el-icon> 刷新
          </el-button>
        </div>
        <div class="category-list" v-loading="catLoading">
          <el-tag
            v-for="cat in categoryList"
            :key="cat.id"
            closable
            size="large"
            type="warning"
            effect="plain"
            class="category-tag"
            @close="handleDeleteCategory(cat)"
          >
            {{ cat.name }}
          </el-tag>
          <el-empty v-if="!catLoading && categoryList.length === 0" description="暂无分类" :image-size="60" />
        </div>
        <p class="category-count" v-if="categoryList.length > 0">
          共 {{ categoryList.length }} 个分类
        </p>
      </div>
    </div>

    <!-- Mock 高级参数 -->
    <div class="settings-card">
      <h3><el-icon color="#409eff"><Setting /></el-icon> 高级系统参数</h3>
      <p class="settings-hint">以下参数为系统预设，修改后立即生效。</p>
      <el-form label-width="140px" class="mock-form">
        <el-form-item label="发布频率限制">
          <el-input-number v-model="mockParams.publishLimit" :min="1" :max="100" />
          <span class="form-hint">次/天/用户</span>
        </el-form-item>
        <el-form-item label="认领申请时效">
          <el-input-number v-model="mockParams.claimTimeout" :min="1" :max="365" />
          <span class="form-hint">天</span>
        </el-form-item>
        <el-form-item label="自动归档天数">
          <el-input-number v-model="mockParams.autoArchiveDays" :min="7" :max="365" />
          <span class="form-hint">天后自动归档无人认领物品</span>
        </el-form-item>
        <el-form-item label="内容最大字数">
          <el-input-number v-model="mockParams.maxContentLength" :min="50" :max="5000" :step="50" />
          <span class="form-hint">字</span>
        </el-form-item>
        <el-form-item label="图片上传上限">
          <el-input-number v-model="mockParams.maxImages" :min="1" :max="9" />
          <span class="form-hint">张/帖</span>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSaveMock">保存设置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { PriceTag, Setting, Refresh } from '@element-plus/icons-vue'
import { addCategory, deleteCategory, getCategoryList } from '@/api/super'

const catLoading = ref(false)
const addLoading = ref(false)
const newCategory = ref('')
const categoryList = ref<{ id: number; name: string }[]>([])

const mockParams = reactive({
  publishLimit: 5,
  claimTimeout: 30,
  autoArchiveDays: 30,
  maxContentLength: 1000,
  maxImages: 4,
})

/** 从后端获取分类列表 */
async function fetchCategories() {
  catLoading.value = true
  try {
    const res = await getCategoryList()
    const raw = res.data?.data ?? res.data ?? []
    const list = Array.isArray(raw) ? raw : (raw.list ?? raw.items ?? [])
    // API 可能返回 { id, kind_name } 或 { id, name } 或 { ID, kind_name }
    categoryList.value = list.map((item: any) => ({
      id: item.id ?? item.ID ?? 0,
      name: item.kind_name ?? item.name ?? '未知',
    }))
  } catch {
    ElMessage.error('获取分类列表失败')
    categoryList.value = []
  } finally {
    catLoading.value = false
  }
}

async function handleAddCategory() {
  const name = newCategory.value.trim()
  if (!name) {
    ElMessage.warning('请输入分类名称')
    return
  }
  if (categoryList.value.some(c => c.name === name)) {
    ElMessage.warning('该分类已存在')
    return
  }
  addLoading.value = true
  try {
    await addCategory({ name })
    ElMessage.success('分类添加成功')
    newCategory.value = ''
    await fetchCategories()
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : '添加失败'
    ElMessage.error(errMsg)
  } finally {
    addLoading.value = false
  }
}

async function handleDeleteCategory(cat: { id: number; name: string }) {
  try {
    await ElMessageBox.confirm(
      `确定要删除分类「${cat.name}」吗？删除后使用该分类的物品将不受影响。`,
      '删除分类',
      { type: 'warning', confirmButtonText: '确认删除', cancelButtonText: '取消' }
    )
    await deleteCategory(cat.id)
    ElMessage.success('已删除')
    await fetchCategories()
  } catch (error: unknown) {
    if (error === 'cancel' || error === 'close') return
    const errMsg = error instanceof Error ? error.message : '删除失败'
    ElMessage.error(errMsg)
  }
}

function handleSaveMock() {
  ElMessage.info('演示环境暂不支持修改底层参数')
}

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.settings-page { padding: 0; }
.page-title { font-size: 24px; font-weight: bold; color: #333; margin: 0 0 24px 0; }

.settings-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}
.settings-card h3 {
  display: flex; align-items: center; gap: 8px;
  font-size: 17px; color: #333; margin: 0 0 20px 0;
}
.settings-hint { font-size: 13px; color: #999; margin: -12px 0 20px 0; }

.category-section { padding: 0; }
.category-add { display: flex; gap: 12px; margin-bottom: 20px; align-items: center; }
.category-list { display: flex; flex-wrap: wrap; gap: 12px; min-height: 40px; }
.category-tag { font-size: 14px; }
.category-count { font-size: 13px; color: #999; margin-top: 16px; }

.mock-form { max-width: 600px; }
.form-hint { margin-left: 12px; font-size: 13px; color: #999; }
</style>
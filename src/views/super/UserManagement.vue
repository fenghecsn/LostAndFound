<template>
  <div class="user-page">
    <div class="page-header">
      <h2 class="page-title">用户管理</h2>
      <el-button type="danger" round @click="showCreateAdmin = true">
        <el-icon><Plus /></el-icon> 新增管理员
      </el-button>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索用户名 / 姓名"
        :prefix-icon="Search"
        clearable
        style="width: 280px;"
        @keyup.enter="handleSearch"
      />
      <el-select v-model="filterRole" placeholder="角色筛选" clearable style="width: 160px;" @change="handleSearch">
        <el-option label="全部角色" :value="undefined" />
        <el-option label="学生/老师" :value="1" />
        <el-option label="管理员" :value="2" />
        <el-option label="超级管理员" :value="3" />
      </el-select>
      <el-select v-model="filterActive" placeholder="状态筛选" clearable style="width: 140px;" @change="handleSearch">
        <el-option label="全部状态" :value="undefined" />
        <el-option label="正常" :value="true" />
        <el-option label="已禁用" :value="false" />
      </el-select>
    </div>

    <!-- 用户列表 -->
    <div class="table-wrapper">
      <el-table
        :data="userList"
        v-loading="loading"
        stripe
        :header-cell-style="{ background: '#fdf6ec', color: '#333', fontWeight: 'bold' }"
        style="width: 100%"
      >
        <el-table-column label="ID" prop="ID" width="70" align="center" />
        <el-table-column label="用户名" prop="username" width="160" align="center" />
        <el-table-column label="姓名" prop="name" width="120" align="center" />
        <el-table-column label="昵称" prop="nickname" width="120" align="center">
          <template #default="{ row }">{{ row.nickname || '--' }}</template>
        </el-table-column>
        <el-table-column label="角色" width="120" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.role === 3" type="danger" effect="dark" size="small">超级管理员</el-tag>
            <el-tag v-else-if="row.role === 2" type="warning" effect="dark" size="small">管理员</el-tag>
            <el-tag v-else type="info" effect="plain" size="small">学生/老师</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="手机号" prop="phone" width="140" align="center">
          <template #default="{ row }">{{ row.phone || '--' }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.is_active" type="success" size="small">正常</el-tag>
            <el-tag v-else type="danger" size="small">已禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="注册时间" width="170" align="center">
          <template #default="{ row }">
            {{ row.CreatedAt ? new Date(row.CreatedAt).toLocaleString('zh-CN') : '--' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.role !== 3"
              :type="row.is_active ? 'danger' : 'success'"
              size="small"
              round
              @click="handleToggleStatus(row)"
            >
              {{ row.is_active ? '禁用' : '启用' }}
            </el-button>
            <el-tag v-else type="info" size="small">不可操作</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next, total"
        @current-change="fetchUserList"
      />
    </div>

    <!-- 新增管理员弹窗 -->
    <el-dialog v-model="showCreateAdmin" title="新增管理员" width="460px" top="20vh">
      <el-form :model="adminForm" label-width="80px">
        <el-form-item label="工号">
          <el-input v-model="adminForm.username" placeholder="请输入工号" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="adminForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="初始密码">
          <el-input v-model="adminForm.password" type="password" show-password placeholder="请输入初始密码（必填）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateAdmin = false">取消</el-button>
        <el-button type="primary" :loading="createLoading" @click="handleCreateAdmin">确认创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { getUserList, createAdmin, updateUserStatus } from '@/api/super'

const loading = ref(false)
const createLoading = ref(false)
const userList = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchKeyword = ref('')
const filterRole = ref<number | undefined>(undefined)
const filterActive = ref<boolean | undefined>(undefined)
const showCreateAdmin = ref(false)

const adminForm = reactive({
  username: '',
  name: '',
  password: '',
})

async function fetchUserList() {
  loading.value = true
  try {
    const res = await getUserList({
      page: currentPage.value,
      pageSize: pageSize.value,
      role: filterRole.value,
      keyword: searchKeyword.value || undefined,
    })
    const resData = res.data?.data ?? res.data ?? {}
    userList.value = resData.list ?? resData.items ?? []
    total.value = resData.total ?? 0

    // 前端过滤状态（API 不支持 is_active 参数）
    if (filterActive.value !== undefined) {
      userList.value = userList.value.filter((u: any) => u.is_active === filterActive.value)
    }
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : '获取用户列表失败'
    ElMessage.error(errMsg)
    userList.value = []
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  currentPage.value = 1
  fetchUserList()
}

async function handleToggleStatus(row: any) {
  const action = row.is_active ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(
      `确定要${action}用户「${row.name || row.username}」吗？`,
      `${action}账号`,
      { type: 'warning' }
    )
    await updateUserStatus(row.ID || row.id, { is_active: !row.is_active })
    ElMessage.success(`已${action}`)
    fetchUserList()
  } catch (error: unknown) {
    if (error === 'cancel' || error === 'close') return
    const errMsg = error instanceof Error ? error.message : `${action}失败`
    ElMessage.error(errMsg)
  }
}

async function handleCreateAdmin() {
  if (!adminForm.username.trim() || !adminForm.name.trim() || !adminForm.password.trim()) {
    ElMessage.warning('请填写工号、姓名和初始密码')
    return
  }
  createLoading.value = true
  try {
    await createAdmin({
      username: adminForm.username,
      name: adminForm.name,
      password: adminForm.password,
    })
    ElMessage.success('管理员创建成功')
    showCreateAdmin.value = false
    adminForm.username = ''
    adminForm.name = ''
    adminForm.password = ''
    fetchUserList()
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : '创建失败'
    ElMessage.error(errMsg)
  } finally {
    createLoading.value = false
  }
}

onMounted(() => {
  fetchUserList()
})
</script>

<style scoped>
.user-page { padding: 0; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title { font-size: 24px; font-weight: bold; color: #333; margin: 0; }
.filter-bar { display: flex; gap: 12px; margin-bottom: 20px; }
.table-wrapper { background: #fff; border-radius: 8px; overflow: hidden; }
.pagination-wrapper { display: flex; justify-content: center; margin-top: 24px; }
</style>
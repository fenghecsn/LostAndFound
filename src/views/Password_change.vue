<template>
  <div class="force-wrapper">
    <div class="force-card">
      <div class="force-header">
        <div class="logo-circle"></div>
        <h2 class="force-title">强制修改密码</h2>
        <p class="force-subtitle">首次登录需修改初始密码</p>

        <div class="role-selector">
          <div
            class="role-item"
            :class="{ active: userStore.role === 1, disabled: userStore.role !== 1 }"
          >
            学生 / 老师
          </div>
          <div
            class="role-item"
            :class="{ active: userStore.role === 2, disabled: userStore.role !== 2 }"
          >
            失物招领管理员
          </div>
          <div
            class="role-item"
            :class="{ active: userStore.role === 3, disabled: userStore.role !== 3 }"
          >
            系统管理员
          </div>
        </div>
      </div>

      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="rules"
        label-position="top"
        class="force-form"
      >
        <el-form-item label="当前密码" prop="old_password">
          <el-input v-model="passwordForm.old_password" type="password" show-password placeholder="请输入当前密码" />
        </el-form-item>
        <el-form-item label="新密码" prop="new_password">
          <el-input v-model="passwordForm.new_password" type="password" show-password placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirm_password">
          <el-input v-model="passwordForm.confirm_password" type="password" show-password placeholder="请再次输入新密码" />
        </el-form-item>

        <el-button class="force-submit" type="primary" :loading="submitting" @click="handleChangePassword">
          修改密码
        </el-button>
      </el-form>

      <div class="force-footer">
        首次登录请使用身份证后六位作为初始密码<br />
        如遇问题请联系技术支持
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { changePasswordApi } from '@/api/user'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const router = useRouter()

const passwordFormRef = ref<FormInstance>()
const submitting = ref(false)
const passwordForm = reactive({
  old_password: '',
  new_password: '',
  confirm_password: ''
})

const rules: FormRules<typeof passwordForm> = {
  old_password: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '新密码长度至少 6 位', trigger: 'blur' }
  ],
  confirm_password: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (_, value, callback) => {
        if (value !== passwordForm.new_password) {
          callback(new Error('两次输入的新密码不一致'))
          return
        }
        callback()
      },
      trigger: 'blur'
    }
  ]
}

const getHomePathByRole = (role: number) => {
  return role === 2 || role === 3 ? '/admin' : '/StudentHome'
}

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return

  await passwordFormRef.value.validate(async (valid) => {
    if (!valid) return
    if (passwordForm.old_password === passwordForm.new_password) {
      ElMessage.warning('新密码不能与原密码相同')
      return
    }

    submitting.value = true
    try {
      const response = await changePasswordApi({
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password
      })

      if (response?.data?.code === 200) {
        userStore.setFirstLogin(false)
        ElMessage.success(response?.data?.msg || '密码修改成功')

        // 如果是学生/老师角色，跳转到公告栏进行强制阅读
        if (userStore.role === 1) {
          router.push('/StudentHome/message/notice_board?mandatory=true')
        } else {
          router.push(getHomePathByRole(userStore.role))
        }
        return
      }

      ElMessage.error(response?.data?.msg || '密码修改失败')
    } catch {
      ElMessage.error('密码修改失败，请稍后重试')
    } finally {
      submitting.value = false
    }
  })
}
</script>

<style scoped>
.force-wrapper {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffac6c;
  padding: 20px;
  box-sizing: border-box;
}

.force-card {
  width: 460px;
  background: #fff;
  border-radius: 16px;
  padding: 34px 30px 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.force-header {
  text-align: center;
  margin-bottom: 20px;
}

.logo-circle {
  width: 56px;
  height: 56px;
  background-color: #f97316;
  border-radius: 50%;
  margin: 0 auto 16px;
}

.force-title {
  margin: 0;
  font-size: 34px;
  font-weight: 700;
  color: #2c3440;
}

.force-subtitle {
  margin: 10px 0 0;
  color: #667085;
  font-size: 16px;
}

.force-form {
  margin-top: 10px;
}

.force-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.force-form :deep(.el-form-item__label) {
  font-weight: 600;
  color: #344054;
  margin-bottom: 8px;
}

.force-form :deep(.el-input__wrapper) {
  border-radius: 10px;
  min-height: 42px;
}

.force-submit {
  width: 100%;
  height: 44px;
  margin-top: 6px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  --el-color-primary: #f97316;
  --el-color-primary-light-3: #fb923c;
  --el-color-primary-dark-2: #ea580c;
  --el-button-hover-bg-color: #ea580c;
}

.force-footer {
  text-align: center;
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid #f1f3f5;
  color: #98a2b3;
  font-size: 12px;
  line-height: 1.7;
}

.role-selector {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.role-item {
  font-size: 12px;
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.2s;
  background-color: #f5f5f5;
  color: #999;
}

.role-item.active {
  background-color: #f97316;
  color: white;
}

.role-item.disabled {
  background-color: #f5f5f5;
  color: #bbb;
  cursor: not-allowed;
}

</style>

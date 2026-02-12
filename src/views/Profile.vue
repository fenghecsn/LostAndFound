<template>
	<div class="profile-page">
		<el-card class="profile-card" shadow="never">
			<template #header>
				<div class="card-header">
					<span>个人中心</span>
				</div>
			</template>

			<el-descriptions :column="1" border class="mb-16">
				<el-descriptions-item label="用户名">{{ profile.username || userStore.username }}</el-descriptions-item>
				<el-descriptions-item label="姓名">{{ profile.name || '-' }}</el-descriptions-item>
				<el-descriptions-item label="手机号">{{ profile.phone || '-' }}</el-descriptions-item>
			</el-descriptions>

			<el-form
				ref="passwordFormRef"
				:model="passwordForm"
				:rules="rules"
				label-width="100px"
			>
				<el-form-item label="原密码" prop="old_password">
					<el-input v-model="passwordForm.old_password" type="password" show-password />
				</el-form-item>
				<el-form-item label="新密码" prop="new_password">
					<el-input v-model="passwordForm.new_password" type="password" show-password />
				</el-form-item>
				<el-form-item label="确认新密码" prop="confirm_password">
					<el-input v-model="passwordForm.confirm_password" type="password" show-password />
				</el-form-item>

				<el-form-item>
					<el-button type="primary" :loading="submitting" @click="handleChangePassword">
						保存新密码
					</el-button>
				</el-form-item>
			</el-form>
		</el-card>
	</div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { changePasswordApi, getUserInfoApi } from '@/api/user'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const router = useRouter()

const profile = reactive({
	username: '',
	name: '',
	phone: ''
})

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

const loadProfile = async () => {
	if (!userStore.username) return
	const response = await getUserInfoApi({ username: userStore.username })
	if (response?.data?.code === 200) {
		profile.username = response.data.data?.username || ''
		profile.name = response.data.data?.name || ''
		profile.phone = response.data.data?.phone || ''
	}
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
				ElMessage.success(response.data.msg || '密码修改成功')
				router.push(getHomePathByRole(userStore.role))
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

onMounted(async () => {
	try {
		await loadProfile()
	} catch {
		// noop
	}
})
</script>

<style scoped>
.profile-page {
	max-width: 720px;
	margin: 0 auto;
}

.profile-card {
	border: none;
}

.card-header {
	font-size: 18px;
	font-weight: 600;
}

.mb-16 {
	margin-bottom: 16px;
}
</style>

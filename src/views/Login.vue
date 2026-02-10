<template>
  <div class="login-wrapper">
    <div class="content-container">
      <!-- 左侧插画区域 -->
      <div class="illustration-section">
        <img src="../../public/6.png">
      </div>

      <!-- 右侧登录卡片 -->
      <div class="login-card">
        <div class="card-header">
          <div class="logo-circle">
            <span class="logo-icon"></span>
          </div>
          <h2 class="title">校园失物招领系统</h2>
          <p class="subtitle">Welcome to Lost and Found System</p>
        </div>

        <form class="login-form" @submit.prevent>
          <div class="form-group">
            <label for="username">{{ currentRole === 'student' ? '学号 / 工号' : '账号' }}</label>
            <input
              type="text"
              id="username"
              v-model="loginForm.username"
              :placeholder="currentRole === 'student' ? '请输入学号或工号' : '请输入账号'"
              class="input-field"
            />
          </div>

          <div class="form-group">
            <label for="password">密码</label>
            <input
              type="password"
              id="password"
              v-model="loginForm.password"
              placeholder="请输入密码"
              class="input-field"
            />
          </div>

          <div class="form-actions">
            <label class="checkbox-label">
              <input type="checkbox" />
              <span>记住我</span>
            </label>
            <a href="#" class="forgot-pwd">忘记密码?</a>
          </div>

          <button type="submit" class="submit-btn" @click="handleLogin">登录系统</button>

          <div class="role-selector">
            <div
              class="role-item"
              :class="{ active: currentRole === 'student' }"
              @click="setRole('student', 1)"
            >
              学生 / 老师
            </div>
            <div
              class="role-item"
              :class="{ active: currentRole === 'lost_admin' }"
              @click="setRole('lost_admin', 2)"
            >
              失物招领管理员
            </div>
            <div
              class="role-item"
              :class="{ active: currentRole === 'system_admin' }"
              @click="setRole('system_admin', 3)"
            >
              系统管理员
            </div>
          </div>
        </form>

        <div class="card-footer">
          <p>首次登录请使用身份证后六位作为初始密码</p>
          <p>如遇问题请联系技术支持</p>
        </div>
      </div>
    </div>

    <footer class="copyright">
      © 2026 校园失物招领系统. 用心找回每一份珍贵.
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { loginApi } from '../api/user.ts'
import { reactive } from 'vue'
const loginForm = reactive({
  role: 1, // 默认角色为学生/老师
  username: '',
  password: ''
})
// 路由实例
const router = useRouter()
const currentRole = ref('student')
const setRole = (role: string, roleValue: number) => {
  currentRole.value = role
  loginForm.role = roleValue
}
const handleLogin = async () => {
  try {
    const response = await loginApi(loginForm)
    console.log('后端登录返回的完整数据:', response.data)
    if (response.data.code === 200) {
      // 调用新的 action，直接传入后端返回的 data 对象

      ElMessage.success('登录成功！')
      router.push('/StudentHome')
    }
    else {
      ElMessage.error(response.data.msg || '登录失败')
    }

  } catch (error) {
    ElMessage.error('账号或密码错误')
  }
}
</script>

<style scoped>
/* 基础变量 */
:root {
  --primary-color: #f97316;
  --bg-color: #ffab8f;
  --text-dark: #333;
  --text-light: #999;
}

.login-wrapper {
  /* 使用 fixed 定位脱离 #app 的 max-width 限制，强制铺满全屏 */
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #ffac6c;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

  /* 允许在高度不足时滚动 */
  overflow-y: auto;
  min-width: 1000px; /* 保证最小宽度，不做手机适配 */
}


.content-container {
  display: flex;
  align-items: center;
  justify-content: flex-end; /* 让内容整体向右靠 */
  gap:0;
  width: 100%;
  max-width: 1400px;
  padding: 0 40px;
  transform-origin: center center;
}

/* 左侧插画简单模拟 */

.illustration-section {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10vw; /* 让登录框更靠近中间 */
}

.illustration-placeholder {
  position: relative;
  width: 320px;
  height: 240px;
  /* 这里的样式是为了模拟截图的视觉占位，实际应该放img标签 */
}


/* 右侧登录卡片 */
.login-card {
  width: 420px; /* 稍微加宽一点 */
  background: #ffffff;
  border-radius: 16px;
  padding: 40px 50px; /* 内部留白加大 */
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08); /* 阴影加重一点 */
  display: flex;
  flex-direction: column;
}

.card-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo-circle {
  width: 56px;
  height: 56px;
  background-color: #f97316;
  border-radius: 50%;
  margin: 0 auto 16px;
}

.title {
  color: #333;
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 8px;
}

.subtitle {
  color: #888;
  font-size: 14px;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 24px;
  text-align: left;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 600;
}

.input-field {
  width: 100%;
  padding: 14px;
  border: 1px solid #f0f0f0;
  border-radius: 6px; /* 圆角稍微小一点，更像截图 */
  background-color: #f9f9f9;
  font-size: 14px;
  color: #333;
  outline: none;
  transition: all 0.2s;
}

.input-field:focus {
  border-color: #f97316;
  background-color: #fff;
  box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.1);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  font-size: 13px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: #666;
}

.forgot-pwd {
  color: #f97316;
  text-decoration: none;
}
.forgot-pwd:hover {
  text-decoration: underline;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background-color: #f97316;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 28px;
}

.submit-btn:hover {
  background-color: #e8630c;
}

.role-selector {
  display: flex;
  justify-content: center;
  gap: 15px; /* 间距控制 */
  margin-bottom: 24px;
}

.role-item {
  font-size: 12px;
  color: #666;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.2s;
}

.role-item.active {
  background-color: #f97316;
  color: white;
}
.role-item:not(.active):hover {
  color: #f97316;
  background-color: #fff7ed;
}

.card-footer {
  text-align: center;
  border-top: 1px solid #f5f5f5;
  padding-top: 20px;
}

.card-footer p {
  color: #999;
  font-size: 11px;
  line-height: 1.6;
  margin: 0;
}

.copyright {
  position: absolute;
  bottom: 24px;
  color: rgba(51, 51, 51, 0.5);
  font-size: 12px;
  text-align: center;
  width: 100%;
}

/* 针对较小屏幕的笔记本适配（非手机） */
@media (max-height: 800px) {
  .login-wrapper {
    padding: 10px;
  }
  .content-container {
    transform: scale(0.9); /* 整体缩放 */
  }
  .copyright {
    bottom: 10px;
  }
}

@media (max-width: 1200px) {
  .content-container {
     gap: 5vw;
  }
}
</style>

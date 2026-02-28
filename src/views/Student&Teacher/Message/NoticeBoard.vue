<template>
  <div class="notice-board-bg">
    <div class="notice-board-card">
      <div class="notice-title-wrap">
        <div class="notice-title">公告栏</div>
      </div>
      <div class="notice-divider"></div>

      <div class="notice-content">
        <div class="section-title">平台简介</div>
        <p>亲爱的老师/同学： 为提升失物招领效率，解决传统招领信息分散、响应滞后等问题，我们正式推出失物招领云平台。该平台集信息登记、智能匹配、实时通知于一体，让您的遗失物品"有踪可循"，拾获物品"有处可交"。</p>

        <div class="section-header">[使用指南]</div>
        <p>首次登录：请立即修改初始密码，建议设置包含字母、数字、符号的强密码</p>
        <p>发布流程：填写信息 → 上传照片 → 提交审核 → 等待通过 → 智能匹配</p>
        <p>认领流程：查找信息 → 提交申请 → 等待审核 → 确认身份 → 线下交接</p>

        <div class="section-header">[重要提醒]</div>
        <p class="warn-text">⚠️ 信息安全：请妥善保管个人账号，切勿将密码告知他人</p>
        <p class="warn-text">⚠️ 照片规范：招领照片必须清晰展示物品特征，模糊照片将被驳回审核</p>
        <p class="warn-text">⚠️ 审核时效：工作时段内提交的信息一般在2小时内完成审核</p>
        <p class="warn-text">⚠️ 文明使用：禁止发布虚假、恶意信息，违者将禁封账号并通报所在单位</p>
        <p class="warn-text">⚠️ 隐私保护：平台已隐藏敏感信息，双方沟通请注意人身财产安全，尽量选择公共场所交接</p>

        <div class="section-header">[技术支持]</div>
        <p>信息中心 电话：010-12345678 邮箱：it@xxx.edu.cn</p>
        <p>失物招领中心：学生事务大厅3号窗口 电话：010-87654321</p>
        <p>值班时间：工作日 8:30-17:30（节假日另行通知）</p>
        <p>请广大师生积极使用并广泛宣传，共同营造互帮互助的校园氛围！</p>
      </div>

      <div class="notice-footer">
        <span class="footer-publisher">管理员发布</span>
        <span class="footer-time">发布时间2026.1.13 13:00</span>
      </div>

      <div class="notice-confirm-btn">
        <button
          v-if="isMandatory"
          class="confirm-btn"
          :disabled="!isChecked"
          @click="handleConfirm"
        >
          确认接收
        </button>
        <button
          v-else
          class="confirm-btn confirmed"
          disabled
        >
          已确认
        </button>
      </div>

      <!-- 强制模式下保留勾选逻辑 -->
      <label v-if="isMandatory" class="hidden-check-wrap">
        <input type="checkbox" v-model="isChecked" />
        我已阅读并同意
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isChecked = ref(false)
const isMandatory = ref(false)

const getHomePathByRole = (role: number) => {
  if (role === 3) return '/super'
  if (role === 2) return '/admin'
  return '/StudentHome'
}

onMounted(() => {
  // 检查是否为强制必读模式
  if (route.query.mandatory === 'true') {
    isMandatory.value = true
    // 强制模式下不自动勾选，等待用户操作
  } else {
    // 只是查看模式，默认已同意
    isMandatory.value = false
    isChecked.value = true
  }
})

const handleConfirm = () => {
  if (!isChecked.value) return

  if (isMandatory.value) {
    // 标记公告已确认
    userStore.setNoticeConfirmed(true)
    ElMessage.success('欢迎使用失物招领云平台')
    // 根据角色跳转到对应主页
    router.replace(getHomePathByRole(userStore.role))
  }
}
</script>

<style scoped>
.notice-board-bg {
  min-height: 80vh;
  background: #f7f3ee;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 12px 3px 8px;
}

.notice-board-card {
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
  padding: 0 48px 36px;
  max-width: 1500px;
  width: 90vw;
  aspect-ratio: 3 / 2;
  overflow-y: auto;
  position: relative;
}

.notice-title-wrap {
  display: flex;
  justify-content: center;
  padding-top: 28px;
  padding-bottom: 16px;
}

.notice-title {
  background: #f5a623;
  color: #fff;
  font-size: 28px;
  font-weight: bold;
  border-radius: 28px;
  padding: 8px 36px;
  letter-spacing: 4px;
}

.notice-divider {
  height: 2px;
  background: linear-gradient(90deg, transparent, #f5a623, transparent);
  margin-bottom: 24px;
}

.notice-content {
  font-size: 15px;
  color: #333;
  line-height: 1.9;
}

.notice-content p {
  margin: 0 0 2px;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  color: #111;
  margin-bottom: 8px;
}

.section-header {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  margin-top: 16px;
  margin-bottom: 4px;
}

.warn-text {
  color: #d48806;
}

.notice-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 28px;
  padding-top: 12px;
  border-top: 1px solid #e0e0e0;
  font-size: 14px;
  color: #888;
}

.footer-publisher {
  color: #666;
}

.footer-time {
  color: #888;
}

.notice-confirm-btn {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.confirm-btn {
  min-width: 160px;
  height: 46px;
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 2px;
  border: 2px solid #3463d7;
  border-radius: 6px;
  background: #fff;
  color: #3463d7;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0 28px;
}

.confirm-btn:hover:not(:disabled) {
  background: #3463d7;
  color: #fff;
}

.confirm-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.confirm-btn.confirmed {
  border-color: #67c23a;
  color: #67c23a;
}

.hidden-check-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 10px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

@media (max-width: 600px) {
  .notice-board-card {
    padding: 0 20px 24px;
  }

  .notice-title {
    font-size: 22px;
    padding: 6px 24px;
  }

  .notice-content {
    font-size: 14px;
  }

  .confirm-btn {
    font-size: 16px;
    min-width: 130px;
    height: 40px;
  }
}
</style>

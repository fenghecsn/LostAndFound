<template>
  <div class="notice-board-bg">
    <div class="notice-board-card">
      <div class="notice-title">公告栏</div>
      <div class="notice-content">
        <h3>平台简介</h3>
        <p>亲爱的老师/同学：为提升失物招领效率，解决传统招领信息分散、响应滞后等问题，我们正式推出失物招领云平台。该平台集信息登记、智能匹配、实时通知于一体，让您的遗失物品“码码可循，拾获物品有处可交”。</p>
        <h4>【使用指南】</h4>
        <ul>
          <li>首次登录：请妥善修改初始密码，建议设置包含字母、数字、符号的强密码</li>
          <li>发布招领：填写物品信息→上传照片→提交审核→等待审核→物品通过审核后自动在平台展示</li>
          <li>认领流程：查找信息→提交申请→等待审核→确认身份→线下交接</li>
        </ul>
        <h4>【重要提醒】</h4>
        <ul class="warn-list">
          <li>⚠️ 信息安全：请妥善保管个人账号，切勿将密码告知他人</li>
          <li>⚠️ 图片规范：招领照片必须清晰展示物品特征，模糊照片将被驳回审核</li>
          <li>⚠️ 审核时效：工作日内的招领审核一般在2小时内完成</li>
          <li>⚠️ 物归原主：禁止发布虚假、恶意信息，违者将被封禁并通报所在单位</li>
          <li>⚠️ 线下交付：平台已脱敏隐藏联系方式，双方沟通请注意人身财产安全，尽量选择公共场所交接</li>
        </ul>
        <h4>【技术支持】</h4>
        <p>平台电话：010-12345678 邮箱：it@xxx.edu.cn<br>
        失物招领中心：学生事务大厅3号窗口 电话：010-87654321<br>
        值班时间：工作日 8:30-17:30（节假日另有通知）<br>
        请广大师生积极使用并广泛宣传，共同营造互帮互助的校园氛围！</p>
      </div>
      <div class="notice-confirm">
        <label class="confirm-check"><input type="checkbox"> 我已阅读并同意</label>
      </div>
      <div class="notice-confirm-btn">
        <button class="confirm-btn">确认接收</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 静态内容，无逻辑
</script>

<style scoped>
.notice-board-bg {
  min-height: 100vh;
  background: #f7f3ee;
  display: flex;
  align-items: center;
  justify-content: center;
}
.notice-board-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  padding: 36px 38px 24px;
  max-width: 800px;
  width: 100%;
  margin: 40px auto;
  position: relative;
}
.notice-title {
  position: absolute;
  left: 50%;
  top: -32px;
  transform: translateX(-50%);
  background: #ffab6c;
  color: #fff;
  font-size: 32px;
  font-weight: bold;
  border-radius: 32px;
  padding: 8px 38px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.notice-content {
  margin-top: 18px;
  font-size: 16px;
  color: #222;
}
.notice-content h3 {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}
.notice-content h4 {
  font-size: 16px;
  font-weight: bold;
  margin: 18px 0 8px 0;
}
.notice-content ul {
  margin: 0 0 0 18px;
  padding: 0;
  font-size: 15px;
}
.warn-list li {
  color: #e67c04;
  margin-bottom: 2px;
}
.notice-confirm {
  margin-top: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
.notice-confirm-btn {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}
.confirm-btn {
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 32px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.confirm-btn:hover {
  background: #ffab6c;
}
</style>

<template>
  <div class="dashboard">
    <h2 class="page-title">数据总览</h2>
    
    <div class="stats-grid">
      <div class="stat-card orange">
        <div class="label">发布总量</div>
        <div class="value">10,086</div>
        <div class="trend">↑ 较上周 +12%</div>
      </div>
      <div class="stat-card green">
        <div class="label">匹配成功数</div>
        <div class="value">1,086</div>
        <div class="trend">● 成功率 10.7%</div>
      </div>
      <div class="stat-card yellow">
        <div class="label">待审核</div>
        <div class="value">245</div>
        <div class="trend">需尽快处理</div>
      </div>
    </div>

    <div class="chart-section">
      <div class="chart-card">
        <h3>物品类型分布</h3>
        <div class="bar-group">
          <div class="bar-item">
            <span class="bar-label">电子产品</span>
            <div class="bar-track"><div class="bar-fill" style="width: 40%"></div></div>
            <span class="bar-num">40%</span>
          </div>
          <div class="bar-item">
            <span class="bar-label">证件类</span>
            <div class="bar-track"><div class="bar-fill" style="width: 30%"></div></div>
            <span class="bar-num">30%</span>
          </div>
          <div class="bar-item">
            <span class="bar-label">书籍/文具</span>
            <div class="bar-track"><div class="bar-fill" style="width: 20%"></div></div>
            <span class="bar-num">20%</span>
          </div>
        </div>
      </div>
      
      <div class="chart-card">
        <h3>丢失地点排行</h3>
        <ul class="rank-list">
          <li><span class="rank">1</span> 屏峰校区 - 图书馆</li>
          <li><span class="rank">2</span> 朝晖校区 - 食堂</li>
          <li><span class="rank">3</span> 莫干山校区 - 教学楼</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 这是一个纯展示页面，暂时不需要逻辑
</script>

<style scoped>
.dashboard { padding: 10px; }
.page-title { font-size: 20px; font-weight: bold; margin-bottom: 20px; }

.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
.stat-card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); color: white; }
.stat-card.orange { background: linear-gradient(135deg, #FF9E5E, #f97316); }
.stat-card.green { background: linear-gradient(135deg, #81C784, #4CAF50); }
.stat-card.yellow { background: linear-gradient(135deg, #FFD54F, #FFC107); }

.label { font-size: 14px; opacity: 0.9; margin-bottom: 5px; }
.value { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
.trend { font-size: 12px; opacity: 0.8; }

.chart-section { display: flex; gap: 20px; }
.chart-card { flex: 1; background: white; padding: 20px; border-radius: 12px; border: 1px solid #eee; }
.chart-card h3 { font-size: 16px; margin-bottom: 20px; border-left: 4px solid #f97316; padding-left: 10px; }

.bar-item { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }
.bar-label { width: 70px; font-size: 13px; color: #666; }
.bar-track { flex: 1; height: 10px; background: #f0f0f0; border-radius: 5px; overflow: hidden; }
.bar-fill { height: 100%; background: #FF9E5E; border-radius: 5px; }
.bar-num { width: 40px; font-size: 12px; color: #999; }

.rank-list { list-style: none; padding: 0; }
.rank-list li { display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #f9f9f9; font-size: 14px; color: #555; }
.rank { display: inline-block; width: 24px; height: 24px; background: #f5f5f5; color: #999; text-align: center; line-height: 24px; border-radius: 50%; margin-right: 15px; font-weight: bold; font-size: 12px; }
.rank-list li:nth-child(1) .rank { background: #FFE4BA; color: #f97316; }
.rank-list li:nth-child(2) .rank { background: #E0E0E0; color: #666; }
.rank-list li:nth-child(3) .rank { background: #EAD6C6; color: #8D6E63; }
</style>
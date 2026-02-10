<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { getItems, type Item, type ItemQuery } from '@/api/items'
import { ElMessage } from 'element-plus'

// --- State ---
const loading = ref(false)
const itemList = ref<Item[]>([])
const total = ref(0)

// Filters State
const queryParams = reactive<ItemQuery>({
  page: 1,
  size: 10,
  keyword: '',
  type: undefined,
  campus: undefined,
  status: undefined,
  // These are not strictly in the API spec provided but required by UI
  time_range: undefined,
  category: undefined
})

// --- Constants for Filter Options ---
const filterOptions = {
  types: [
    { label: '全部帖子', value: undefined },
    { label: '失物帖', value: 1 },
    { label: '捡到帖', value: 2 },
  ],
  campuses: [
    { label: '全部校区', value: undefined },
    { label: '朝晖', value: '朝晖' },
    { label: '屏峰', value: '屏峰' },
    { label: '莫干山', value: '莫干山' },
  ],
  statuses: [
    { label: '全部状态', value: undefined },
    { label: '已通过', value: 1 },
    { label: '已匹配', value: 2 },
    { label: '已认领', value: 3 },
  ],
  times: [
    { label: '全部时间', value: undefined },
    { label: '0~3', value: '0-3' },
    { label: '3~7', value: '3-7' },
    { label: '7~15', value: '7-15' },
    { label: '15~30', value: '15-30' },
    { label: '>30', value: '30+' },
  ],
  categories: [
    { label: '全部类型', value: undefined },
    { label: '书籍', value: '书籍' },
    { label: '衣服', value: '衣服' },
    { label: '电子', value: '电子' },
    { label: '证件', value: '证件' },
    { label: '其他', value: '其他' },
  ]
}

// --- Methods ---
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getItems(queryParams)
    // Adjust based on actual axios response structure (usually res.data)
    if (res.data) {
        itemList.value = res.data.list
        total.value = res.data.total
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  queryParams.page = 1
  fetchData()
}

const handlePageChange = (page: number) => {
  queryParams.page = page
  fetchData()
}

const getStatusText = (status: number) => {
  switch(status) {
    case 1: return '已通过'
    case 2: return '已匹配'
    case 3: return '已认领'
    default: return '未知'
  }
}

const getStatusColor = (status: number) => {
    switch(status) {
        case 2: return 'rgb(245, 108, 108)' // Red for matched? Design shows red text
        case 1: return 'rgb(245, 108, 108)' // Design shows red text for passed too? No, usually green or passed is default.
                                            // Design image shows "已通过" in Red, "已匹配" in Red.
                                            // Let's stick to a generic red/theme color for status text as per design.
        default: return 'rgb(245, 108, 108)'
    }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="student-view">
    <!-- Top: Search -->
    <div class="search-container">
        <el-input
            v-model="queryParams.keyword"
            placeholder="搜索"
            class="search-input"
            :prefix-icon="Search"
            @keyup.enter="handleFilterChange"
        />
    </div>

    <!-- Middle: Filters + Illustration -->
    <el-row class="filter-illustration-section">
      <!-- Left: Filters -->
      <el-col :span="16">
        <div class="filter-section">
            <!-- Row 1: Type -->
            <div class="filter-row">
                <div class="filter-options">
                    <div
                        v-for="opt in filterOptions.types"
                        :key="String(opt.value)"
                        class="filter-pill"
                        :class="{ active: queryParams.type === opt.value }"
                        @click="queryParams.type = opt.value; handleFilterChange()"
                    >
                        {{ opt.value === undefined ? '全部帖子' : opt.label }}
                    </div>
                </div>
            </div>

            <!-- Row 2: Campus -->
            <div class="filter-row">
                <div class="filter-options">
                    <div
                        v-for="opt in filterOptions.campuses"
                        :key="String(opt.value)"
                        class="filter-pill"
                        :class="{ active: queryParams.campus === opt.value }"
                        @click="queryParams.campus = opt.value; handleFilterChange()"
                    >
                        {{ opt.value === undefined ? '全部校区' : opt.label }}
                    </div>
                </div>
            </div>

            <!-- Row 3: Status -->
            <div class="filter-row">
                 <div class="filter-options">
                    <div
                        v-for="opt in filterOptions.statuses"
                        :key="String(opt.value)"
                        class="filter-pill"
                        :class="{ active: queryParams.status === opt.value }"
                        @click="queryParams.status = opt.value; handleFilterChange()"
                    >
                         {{ opt.value === undefined ? '全部状态' : opt.label }}
                    </div>
                </div>
            </div>

             <!-- Row 4: Time -->
             <div class="filter-row">
                 <div class="filter-options">
                    <div
                        v-for="opt in filterOptions.times"
                        :key="String(opt.value)"
                        class="filter-pill"
                        :class="{ active: queryParams.time_range === opt.value }"
                        @click="queryParams.time_range = opt.value; handleFilterChange()"
                    >
                         {{ opt.value === undefined ? '全部时间' : opt.label }}
                    </div>
                </div>
            </div>

              <!-- Row 5: Category -->
              <div class="filter-row">
                 <div class="filter-options">
                    <div
                        v-for="opt in filterOptions.categories"
                        :key="String(opt.value)"
                        class="filter-pill"
                        :class="{ active: queryParams.category === opt.value }"
                        @click="queryParams.category = opt.value; handleFilterChange()"
                    >
                         {{ opt.value === undefined ? '全部类型' : opt.label }}
                    </div>
                </div>
            </div>
        </div>
      </el-col>

      <!-- Right: Illustration -->
      <el-col :span="8">
        <div class="illustration-container" style="max-width: 250px;max-height: 250px;border-radius: 50%;">
            <img src="/6副.png" alt="Illustration" class="side-image" />
        </div>
      </el-col>
    </el-row>

    <!-- Bottom: List -->
    <div class="list-section" v-loading="loading">
        <div v-if="itemList.length === 0" class="empty-state">暂无数据</div>
        <div v-else class="card-grid">
            <div v-for="item in itemList" :key="item.id" class="item-card">
                <div class="card-header">
                    <div class="info-row">
                        <span class="label">物品名称:</span>
                        <span class="value">{{ item.name }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">{{ item.type === 1 ? '丢失时间' : '拾取时间' }}:</span>
                        <span class="value">{{ item.event_time }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">{{ item.type === 1 ? '丢失地点' : '拾取地点' }}:</span>
                        <span class="value">{{ item.location }}</span>
                    </div>
                        <el-button class="more-btn" circle size="small">...</el-button>
                </div>

                <div class="card-body">
                    <div class="tags-col">
                        <el-tag size="small" effect="plain" class="custom-tag location-tag">校区: {{ item.campus || '未知' }}</el-tag>
                        <el-tag size="small" effect="plain" type="warning" class="custom-tag type-tag">物品类型: {{ item.category || '未知' }}</el-tag>
                        <el-tag v-if="item.reward" size="small" effect="plain" type="warning" class="custom-tag reward-tag">悬赏: {{ item.reward }}元</el-tag>
                    </div>
                    <div class="images-col">
                            <el-image
                            style="width: 80px; height: 80px; border-radius: 4px;"
                            :src="item.cover_image"
                            fit="cover"
                        >
                            <template #error>
                                <div class="image-slot">
                                    <el-icon><img src="" alt="fail"/></el-icon>
                                </div>
                            </template>
                        </el-image>
                    </div>
                </div>

                <div class="card-footer">
                    <span class="date">{{ item.create_time || '2027.1.20 12:00发布' }}</span>
                    <span class="status" :style="{ color: getStatusColor(item.status) }">{{ getStatusText(item.status) }}</span>
                </div>
            </div>
        </div>
            <el-pagination
            v-if="total > 0"
            layout="prev, pager, next"
            :total="total"
            :page-size="queryParams.size"
            @current-change="handlePageChange"
            style="margin-top: 20px; justify-content: center;"
        />
    </div>
  </div>
</template>

<style scoped>
.student-view {
    padding: 20px;
    background-color: #FFFDF9; /* Match background color roughly */
    min-height: 100vh;
}

.search-container {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
}

.search-input {
    width: 400px;
}
:deep(.el-input__wrapper) {
    border-radius: 20px;
    box-shadow: 0 0 0 1px #dcdfe6 inset;
}

.filter-section {
    margin-bottom: 30px;
}

.filter-row {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
}

.filter-options {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
}

.filter-pill {
    padding: 6px 20px;
    border-radius: 20px;
    cursor: pointer;
    background-color: #fff;
    color: #606266;
    font-size: 14px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05); /* Soft shadow */
    transition: all 0.3s;
    border: 1px solid #eee;
}

.filter-pill:hover {
    color: #FF9E5E;
}

.filter-pill.active {
    background: linear-gradient(90deg, #FFAA6F 0%, #FF8534 100%); /* Orange Gradient */
    color: white;
    box-shadow: 0 2px 6px rgba(255, 133, 52, 0.4);
    border: none;
}

.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

.item-card {
    background: white;
    border-radius: 8px;
    border: 1px solid #FFD6A8;
    padding: 15px;
    position: relative;
    box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}

.card-header {
    position: relative;
    margin-bottom: 10px;
}

.more-btn {
    position: absolute;
    top: 0;
    right: 0;
    border: none;
    color: #FFD6A8;
    background: rgba(255, 214, 168, 0.2);
}

.info-row {
    margin-bottom: 5px;
    font-size: 14px;
    color: #333;
}

.info-row .label {
    color: #666;
    margin-right: 5px;
}

.card-body {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
}

.tags-col {
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: flex-start;
}

.custom-tag {
    border-radius: 12px;
}
.location-tag {
    color: #409EFF;
    background: #ecf5ff;
    border-color: #d9ecff;
}
.type-tag, .reward-tag {
    color: #e6a23c;
    background: #fdf6ec;
    border-color: #faecd8;
}


.card-footer {
    border-top: 1px solid #eee;
    padding-top: 8px;
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #999;
}

.status {
    font-weight: bold;
}

.illustration-container {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fff;
    border-radius: 50%;
    aspect-ratio: 1;
    width: 90%;
    margin: 0 auto;
}
.side-image {
    max-width: 80%;
    height: auto;
}
</style>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { getItemDetail, getItems, type Item, type ItemQuery, type RawItemFromApi } from '@/api/ResearchItems'
import { ElMessage } from 'element-plus'
import ItemDetailDialog from '@/components/ItemDetailDialog.vue'
import ClaimApplyDialog from '@/components/ClaimApplyDialog.vue'
import { claimItemApi } from '@/api/Claim'
import { uploadImageApi } from '@/api/Img'
import { extractUploadedUrl } from '@/utils/imageUpload'
// --- 状态管理 ---
const loading = ref(false)
const itemList = ref<Item[]>([])
const total = ref(0)
const detailVisible = ref(false)
const currentItem = ref<Item | null>(null)
const applyVisible = ref(false)
const applyMode = ref<'picked' | 'mine'>('picked')

// 筛选参数状态
const queryParams = reactive<ItemQuery>({
    page_num: 1,
    page_size: 12,
    location:"", // 搜索关键词
    lost_or_found: undefined,
    campus: undefined,
    status: undefined,
    days: undefined,
    category: undefined
})

// --- 筛选项常量 ---
const statusFilterOptions: Array<{ label: string; value: ItemQuery['status'] }> = [
    { label: '全部状态', value: undefined },
    { label: '待审核', value: 'pending' },
    { label: '已通过', value: 'approved' },
    { label: '已匹配', value: 'matched' },
    { label: '已认领', value: 'claimed' },

]

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
    statuses: statusFilterOptions,
    times: [
        { label: '全部时间', value: undefined },
        { label: '0~3', value: 3},
        { label: '3~7', value: 7 },
        { label: '7~15', value: 15 },
        { label: '15~30', value: 30 },
        { label: '>30', value: 999 },
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

// --- 方法区 ---
const normalizeType = (type: RawItemFromApi['type'], fallback: Item['type'] = 1): Item['type'] => {
    if (type === 'lost') return 1
    if (type === 'found') return 2
    if (type === 1 || type === 2) return type
    return fallback
}

const normalizeStatus = (status: RawItemFromApi['status'], fallback: Item['status'] = 1): Item['status'] => {
    if (status === 'pending') return 'pending'
    if (status === 'approved') return 'approved'
    if (status === 'displaying') return 1
    if (status === 'matched') return 2
    if (status === 'claimed') return 3
    if (status === 'rejected') return 'rejected'
    if (typeof status === 'number') return status
    if (status === 'archived') return 'archived'
    return fallback
}

const normalizeItem = (raw: RawItemFromApi, fallback?: Item): Item => {
    const images = [raw?.img1, raw?.img2, raw?.img3, raw?.img4].filter((value): value is string => Boolean(value))
    const fallbackSafe = fallback || ({} as Item)

    return {
        ...fallbackSafe,
        ...raw,
        id: raw.id ?? raw.ID ?? fallbackSafe.id ?? 0,
        name: raw.name || raw.title || fallbackSafe.name || '未命名物品',
        type: normalizeType(raw.type, fallbackSafe.type ?? 1),
        status: normalizeStatus(raw.status, fallbackSafe.status ?? 1),
        event_time: raw.event_time || raw.time || fallbackSafe.event_time || '',
        create_time: raw.create_time || raw.CreatedAt || fallbackSafe.create_time || '',
        cover_image: raw.cover_image || raw.img1 || fallbackSafe.cover_image || '',
        reward: raw.reward ?? raw.bounty ?? fallbackSafe.reward,
        contact_method: raw.contact_method || raw.contact_phone || fallbackSafe.contact_method,
        contact_person: raw.contact_person || raw.contact_name || fallbackSafe.contact_person,
        images: raw.images?.filter(Boolean) || (images.length > 0 ? images : (fallbackSafe.images || []))
    }
}

const buildQueryParams = (params: ItemQuery): ItemQuery => {
    const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
    return Object.fromEntries(entries) as ItemQuery
}

const getDayRangeByFilter = (days: number | undefined): { min: number; max: number | null } | null => {
    if (days === undefined) return null
    if (days === 3) return { min: 0, max: 3 }
    if (days === 7) return { min: 3, max: 7 }
    if (days === 15) return { min: 7, max: 15 }
    if (days === 30) return { min: 15, max: 30 }
    if (days === 999) return { min: 30, max: null }
    return null
}

const fetchData = async () => {
    loading.value = true
    try {
        const res = await getItems(buildQueryParams(queryParams))
        if (Number(res?.data?.code) !== 200) {
            itemList.value = []
            total.value = 0
            ElMessage.warning(res?.data?.msg || '获取数据失败')
            return
        }

        const list = Array.isArray(res.data?.data?.list) ? res.data.data.list : []
        const normalized = list.map((item) => normalizeItem(item))
        const dayRange = getDayRangeByFilter(queryParams.days)

        if (dayRange) {
            const now = Date.now()
            const filteredByDays = normalized.filter((item) => {
                const t = new Date(item.create_time || item.event_time || '').getTime()
                if (!t || Number.isNaN(t)) return false
                const diffDays = Math.floor((now - t) / (24 * 3600 * 1000))
                if (diffDays < dayRange.min) return false
                if (dayRange.max !== null && diffDays >= dayRange.max) return false
                return true
            })
            itemList.value = filteredByDays
            total.value = filteredByDays.length
            return
        }

        itemList.value = normalized
        total.value = Number(res.data?.data?.total || normalized.length)
    } catch (error) {
        console.error(error)
        ElMessage.error('获取数据失败')
    } finally {
        loading.value = false
    }
}

// 筛选项变更
const handleFilterChange = () => {
    queryParams.page_num = 1
    fetchData()
}

// 分页变更
const handlePageChange = (page: number) => {
    queryParams.page_num = page
    fetchData()
}

const openDetailDialog = async (item: Item) => {
    currentItem.value = item
    detailVisible.value = true

    try {
        const res = await getItemDetail(item.id)
        if (Number(res?.data?.code) === 200 && res?.data?.data) {
            currentItem.value = normalizeItem(res.data.data, item)
            return
        }
        ElMessage.warning(res?.data?.msg || '获取详情失败，已显示基础信息')
    } catch (error) {
        console.error(error)
        ElMessage.warning('获取详情失败，已显示基础信息')
    }
}

const handleDialogAction = (item: Item) => {
    applyMode.value = item.type === 1 ? 'picked' : 'mine'
    applyVisible.value = true
    detailVisible.value = false
}

const handleApplySubmit = async (payload: { content: string; file: File | null; mode: 'picked' | 'mine' }) => {
    if (!payload.content) {
        ElMessage.warning('请先填写申请信息')
        return
    }
    try {
        let imageUrl: string | undefined

        if (payload.file) {
            const formData = new FormData()
            formData.append('file', payload.file)

            const uploadRes = await uploadImageApi(formData)
            imageUrl = extractUploadedUrl(uploadRes)
            if (!imageUrl) {
                ElMessage.error('图片上传成功但未返回可用链接')
                return
            }
        }

        const claimRes = await claimItemApi({
            item_id: currentItem.value?.id ?? 0,
            proof: payload.content,
            img1: imageUrl || '',
            img2: '',
            img3: '',
            img4: '',
        })
        if (Number(claimRes?.data?.code) !== 200) {
            ElMessage.error(claimRes?.data?.msg || '提交申请失败')
            return
        }
        const actionText = payload.mode === 'picked' ? '已提交“我捡到了”申请' : '已提交“是我的”申请'
        ElMessage.success(actionText)
        applyVisible.value = false
    } catch (error) {
        console.error(error)
        ElMessage.error('提交申请失败，请稍后重试')
    }
}

// 状态文本映射
const getStatusText = (status: number | string) => {
    switch(status) {
        case 'pending':
            return '待审核'
        case 'approved':
            return '已通过'
        case 1:
        case 'displaying':
            return '已通过'
        case 2:
        case 'matched':
            return '已匹配'
        case 3:
        case 'claimed':
            return '已认领'
        case 'archived':
            return '已归档'
        case 'rejected':
            return '已拒绝'
        default:
            return '未知'
    }
}

// 状态颜色映射
const getStatusColor = (status: number | string) => {
    switch(status) {
                case 'pending':
                        return 'rgb(230, 162, 60)'
        case 2:
        case 'matched':
                        return 'rgb(245, 108, 108)'
                case 'approved':
        case 3:
        case 'claimed':
                        return 'rgb(103, 194, 58)'
                case 'rejected':
                        return 'rgb(245, 108, 108)'
        case 1:
        case 'displaying':
        case 'archived':
        default:
                        return 'rgb(245, 108, 108)'
    }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="student-view">
    <!-- 搜索 -->
    <div class="search-container">
        <el-input
            v-model="queryParams.location"
            placeholder="搜索"
            class="search-input"
            :prefix-icon="Search"
            @keyup.enter="handleFilterChange"
        />
    </div>

    <!-- 过滤器和插图 -->
    <el-row class="filter-illustration-section">
      <!-- 筛选 -->
      <el-col :span="16">
        <div class="filter-section">
            <!-- 第一行: 帖子类型 -->
            <div class="filter-row">
                <div class="filter-options">
                    <div
                        v-for="opt in filterOptions.types"
                        :key="String(opt.value)"
                        class="filter-pill"
                        :class="{ active: queryParams.lost_or_found === opt.value }"
                        @click="queryParams.lost_or_found = opt.value; handleFilterChange()"
                    >
                        {{ opt.value === undefined ? '全部帖子' : opt.label }}
                    </div>
                </div>
            </div>

            <!-- 第二行: 校区 -->
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

            <!-- 第三行: 状态 -->
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

             <!-- 第四行: 时间 -->
             <div class="filter-row">
                 <div class="filter-options">
                    <div
                        v-for="opt in filterOptions.times"
                        :key="String(opt.value)"
                        class="filter-pill"
                        :class="{ active: queryParams.days === opt.value }"
                        @click="queryParams.days = opt.value; handleFilterChange()"
                    >
                         {{ opt.value === undefined ? '全部时间' : opt.label }}
                    </div>
                </div>
            </div>

              <!-- 第五行: 类型 -->
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

      <!-- 右侧: 插图 -->
      <el-col :span="8">
        <div class="illustration-container" style="max-width: 250px;max-height: 250px;border-radius: 50%;">
            <img src="/6副.png" alt="Illustration" class="side-image" />
        </div>
      </el-col>
    </el-row>

    <!-- 帖子列表 -->
    <div class="list-section" v-loading="loading">
        <div v-if="itemList.length === 0" class="empty-state">暂无数据</div>
        <div v-else class="card-grid">
            <div v-for="item in itemList" :key="item.id" class="item-card" @click="openDetailDialog(item)">
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
                        <el-button class="more-btn" circle size="small" @click.stop="openDetailDialog(item)">...</el-button>
                </div>

                <div class="card-body">
                    <div class="tags-col">
                        <el-tag size="small" effect="plain" class="custom-tag location-tag">校区: {{ item.campus || '未知' }}</el-tag>
                        <el-tag size="small" effect="plain" type="warning" class="custom-tag type-tag">物品类型: {{ item.category || '未知' }}</el-tag>
                        <el-tag v-if="item.reward" size="small" effect="plain" type="warning" class="custom-tag reward-tag" style="color: #FFD700;">悬赏: {{ item.reward }}元</el-tag>
                    </div>
                    <div class="images-col">
                            <el-image
                            style="width: 140px; height: 80px; border-radius: 4px;"
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
                    <span class="date">{{ item.create_time || '？？发布' }}</span>
                    <span class="status" :style="{ color: getStatusColor(item.status) }">{{ getStatusText(item.status) }}</span>
                </div>
            </div>
        </div>
            <el-pagination
            v-if="total > 0"
            layout="prev, pager, next"
            :total="total"
            :page-size="queryParams.page_size"
            @current-change="handlePageChange"
            style="margin-top: 20px; justify-content: center;"
        />
    </div>

    <ItemDetailDialog
        v-model="detailVisible"
        :item="currentItem"
        @action="handleDialogAction"
    />

    <ClaimApplyDialog
        v-model="applyVisible"
        :mode="applyMode"
        @submit="handleApplySubmit"
    />
  </div>
</template>

<style scoped>
.student-view {
    padding: 20px;
    background-color: #FFFDF9;
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
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    transition: all 0.3s;
    border: 1px solid #eee;
}

.filter-pill:hover {
    color: #FF9E5E;
}

.filter-pill.active {
    background: linear-gradient(90deg, #FFAA6F 0%, #FF8534 100%);
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
    cursor: pointer;
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
    align-items: flex-start;
}

.tags-col {
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: flex-start;
    flex: 1;
    min-width: 0;
    margin-right: 10px;
}

.custom-tag {
    border-radius: 12px;
    max-width: 100%;
}
:deep(.el-tag__content) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
}

.images-col {
    flex-shrink: 0;
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

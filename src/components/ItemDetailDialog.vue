<script setup lang="ts">
import { computed } from 'vue'
import { Location, Tickets, Coin } from '@element-plus/icons-vue'
import type { Item } from '@/api/ResearchItems'
// 主页物品详情弹窗组件

interface Props {
  modelValue: boolean
  item: Item | null
  hideAction?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'action', item: Item): void
}>()

const close = () => {
  emit('update:modelValue', false)
}

const isLostPost = computed(() => props.item?.type === 1 || props.item?.type === 'lost')
const isMatchedPost = computed(() => props.item?.status === 2 || props.item?.status === 'matched')

const timeLabel = computed(() => isLostPost.value ? '丢失时间' : '拾取时间')
const locationLabel = computed(() => isLostPost.value ? '丢失地点' : '拾取地点')
const actionLabel = computed(() => isLostPost.value ? '我捡到了' : '是我的')

const imageList = computed(() => {
  const sources = props.item?.images?.filter(Boolean) ?? []
  const legacyImages = [props.item?.img1, props.item?.img2, props.item?.img3, props.item?.img4].filter((value): value is string => Boolean(value))
  sources.push(...legacyImages)
  if (props.item?.cover_image) {
    sources.unshift(props.item.cover_image)
  }
  return [...new Set(sources)].slice(0, 4)
})

const handleAction = () => {
  if (!props.item) {
    return
  }
  emit('action', props.item)
}
</script>

<template>
  <teleport to="body">
    <div v-if="modelValue && item" class="detail-mask" @click.self="close">
      <div class="detail-dialog">
        <div class="content-top">
          <div class="info-lines">
            <div class="line"><span class="label">物品名称：</span><span>{{ item.name || '未知' }}</span></div>
            <div class="line"><span class="label">{{ timeLabel }}：</span><span>{{ item.event_time || item.time || '未知' }}</span></div>
            <div class="line"><span class="label">{{ locationLabel }}：</span><span>{{ item.location || '未知' }}</span></div>
            <div class="line"><span class="label">联系方式：</span><span>{{ '你没有权限知道' }}</span></div>
            <div class="line"><span class="label">联系人：</span><span>{{'你没有权限知道' }}</span></div>
            <div class="line"><span class="label">物品特征：</span><span class="feature">{{ item.description || '暂无描述' }}</span></div>
          </div>
          <button
            v-if="!isMatchedPost && !props.hideAction"
            class="action-btn"
            type="button"
            @click="handleAction"
          >
            {{ actionLabel }}
          </button>
        </div>

        <div class="divider"></div>

        <div class="content-bottom">
          <div class="meta-col">
            <div class="meta-pill campus">
              <el-icon><Location /></el-icon>
              <span>校区：{{ item.campus || '未知' }}</span>
            </div>
            <div class="meta-pill category">
              <el-icon><Tickets /></el-icon>
              <span>物品类型：{{ item.category || '未知' }}</span>
            </div>
            <div class="meta-pill reward">
              <el-icon><Coin /></el-icon>
              <span>悬赏：{{ item.reward ? `${item.reward}元` : '无' }}</span>
            </div>
          </div>

          <div class="images-grid">
            <div v-for="index in 4" :key="index" class="image-box">
              <el-image
                v-if="imageList[index - 1]"
                :src="imageList[index - 1]"
                fit="cover"
                class="image"
              />
              <div v-else class="placeholder">暂无图片</div>
            </div>
          </div>
        </div>

        <div class="dialog-footer">
          <span class="date">{{ item.create_time || item.CreatedAt || '' }}</span>
          <span v-if="isMatchedPost" class="matched-status">已匹配</span>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.detail-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2100;
}

.detail-dialog {
  width: min(860px, 92vw);
  max-height: 86vh;
  overflow: auto;
  background: #fff;
  border-radius: 10px;
  padding: 24px 22px 14px;
  color: #555;
}

.content-top {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.info-lines {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 16px;
  line-height: 1.2;
  flex: 1;
  min-width: 0;
}

.line {
  display: flex;
  align-items: flex-start;
}

.label {
  color: #666;
  margin-right: 6px;
  white-space: nowrap;
}

.feature {
  word-break: break-all;
}

.action-btn {
  border: none;
  height: 48px;
  min-width: 160px;
  border-radius: 20px;
  background: linear-gradient(90deg, #ffb266 0%, #ff8b2f 100%);
  color: #fff;
  font-size: 22px;
  font-weight: 600;
  cursor: pointer;
  padding: 0 20px;
  flex-shrink: 0;
}

.divider {
  margin: 12px 0 12px;
  border-top: 1px solid #ddd;
}

.content-bottom {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 12px;
}

.meta-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 14px;
  width: fit-content;
  max-width: 100%;
}

.meta-pill span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.campus {
  color: #2fa8ef;
  background: #d9efff;
}

.category {
  color: #e18f35;
  background: #fce0bf;
}

.reward {
  color: #c58d1a;
  background: #fbe8af;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.image-box {
  background: #f3f3f3;
  aspect-ratio: 16 / 10;
}

.image {
  width: 100%;
  height: 100%;
}

.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c9c9c9;
  font-size: 18px;
}

.dialog-footer {
  margin-top: 8px;
  min-height: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #bbb;
  font-size: 14px;
}

.matched-status {
  color: #f56c6c;
  font-weight: 600;
}

@media (max-width: 768px) {
  .detail-dialog {
    width: 94vw;
    padding: 16px 14px 10px;
  }

  .content-top {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
    min-width: 0;
    font-size: 16px;
    height: 42px;
  }

  .content-bottom {
    grid-template-columns: 1fr;
  }

  .info-lines,
  .meta-pill,
  .dialog-footer {
    font-size: 14px;
  }
}
</style>

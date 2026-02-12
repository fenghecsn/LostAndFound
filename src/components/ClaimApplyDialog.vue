<script setup lang="ts">
import { computed, ref, watch } from 'vue'
// 主页认领申请弹窗组件

type ApplyMode = 'picked' | 'mine'

interface Props {
  modelValue: boolean
  mode: ApplyMode
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'picked' as 'picked' | 'mine',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', payload: { content: string; file: File | null; mode: 'picked' | 'mine' }): void
}>()

const content = ref('')
const uploadFile = ref<File | null>(null)

const close = () => {
  emit('update:modelValue', false)
}

const count = computed(() => content.value.length)

const helperTextTop = computed(() => {
  if (props.mode === 'picked') {
    return '需填写物品名称、类型、拾取地点、拾取时间、物品特征、联系人及联系电话'
  }
  return '需填写物品额外特征或相关证明信息'
})

const helperTextBottom = computed(() => {
  if (props.mode === 'picked') {
    return '必须上传物品清晰照片便于失主确认'
  }
  return '上传能证明这个物品是你的物品的照片'
})

const handleFileChange = (uploadFileInfo: { raw?: File }) => {
  uploadFile.value = uploadFileInfo.raw ?? null
}

const submit = () => {
  emit('submit', {
    content: content.value.trim(),
    file: uploadFile.value,
    mode: props.mode,
  })
}

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      content.value = ''
      uploadFile.value = null
    }
  },
)
</script>

<template>
  <teleport to="body">
    <div v-if="modelValue" class="apply-mask" @click.self="close">
      <div class="apply-dialog">
        <h3 class="title">认领申请：请填写信息</h3>

        <div class="input-panel">
          <el-input
            v-model="content"
            type="textarea"
            maxlength="1000"
            resize="none"
            placeholder="请输入文字"
            :rows="6"
            class="text-input"
          />
          <div class="counter">{{ count }}/1000</div>
        </div>

        <div class="helper-top">{{ helperTextTop }}</div>

        <el-upload
          class="upload-area"
          drag
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleFileChange"
          accept="image/*"
        >
          <div class="plus">+</div>
        </el-upload>

        <div class="helper-bottom">{{ helperTextBottom }}</div>

        <div class="actions">
          <el-button class="btn cancel" @click="close">取消</el-button>
          <el-button class="btn submit" type="primary" @click="submit">发送申请</el-button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.apply-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.58);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2200;
}

.apply-dialog {
  width: min(760px, 90vw);
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px 20px;
}

.title {
  margin: 0 0 14px;
  font-size: 22px;
  color: #222;
  font-weight: 700;
}

.input-panel {
  position: relative;
  background: #f6e7ce;
  border-radius: 12px;
  padding: 12px 12px 30px;
}

.text-input :deep(.el-textarea__inner) {
  min-height: 140px !important;
  border: none;
  background: transparent;
  box-shadow: none;
  font-size: 16px;
  color: #666;
  line-height: 1.5;
}

.counter {
  position: absolute;
  right: 12px;
  bottom: 8px;
  color: #666;
  font-size: 13px;
  font-weight: 500;
}

.helper-top {
  margin: 10px 0 10px;
  color: #c6cedd;
  font-size: 14px;
  font-weight: 600;
}

.upload-area {
  width: 160px;
}

.upload-area :deep(.el-upload-dragger) {
  width: 160px;
  height: 140px;
  border: 2px solid #e2e2e2;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.plus {
  color: #8e8e8e;
  font-size: 56px;
  line-height: 1;
  margin-top: -4px;
}

.helper-bottom {
  margin: 10px 0 0 2px;
  color: #c6cedd;
  font-size: 14px;
  font-weight: 600;
  width: 260px;
  line-height: 1.2;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
}

.btn {
  min-width: 96px;
  height: 36px;
  border-radius: 8px;
  font-size: 16px;
}

@media (max-width: 768px) {
  .apply-dialog {
    width: 94vw;
    padding: 16px 14px;
  }

  .title {
    font-size: 18px;
  }

  .text-input :deep(.el-textarea__inner) {
    min-height: 120px !important;
    font-size: 16px;
  }

  .counter,
  .helper-top,
  .helper-bottom {
    font-size: 14px;
  }

  .upload-area,
  .upload-area :deep(.el-upload-dragger) {
    width: 140px;
    height: 120px;
  }

  .plus {
    font-size: 42px;
  }

  .actions {
    margin-top: 12px;
    gap: 12px;
  }

  .btn {
    min-width: 88px;
    font-size: 14px;
    height: 34px;
  }
}
</style>

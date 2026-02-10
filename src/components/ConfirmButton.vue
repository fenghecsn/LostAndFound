<template>
  <button class="confirm-button" type="button" @click="open">
    <span>{{ label }}</span>
  </button>

  <teleport to="body">
    <div v-if="visible" class="confirm-mask" @click.self="close">
      <div class="confirm-dialog">
        <div class="confirm-title">{{ title }}</div>
        <div class="confirm-text">{{ message }}</div>
        <div class="confirm-actions">
          <button class="confirm-btn cancel" type="button" @click="close">{{ cancelText }}</button>
          <button class="confirm-btn primary" type="button" @click="confirm">{{ confirmText }}</button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  label?: string
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '删除',
  title: '二次确认',
  message: '确定执行该操作吗？',
  confirmText: '确认',
  cancelText: '取消',
})

const emit = defineEmits<{ (e: 'confirm'): void }>()

const visible = ref(false)

const open = () => {
  visible.value = true
}

const close = () => {
  visible.value = false
}

const confirm = () => {
  emit('confirm')
  close()
}
</script>

<style scoped>
.confirm-button {
  background: #f97316;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}

.confirm-button:hover {
  background: #ea6a0f;
}

.confirm-button:active {
  transform: scale(0.98);
}

.confirm-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.confirm-dialog {
  width: 320px;
  background: #fff;
  border-radius: 12px;
  padding: 18px 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.confirm-title {
  font-size: 16px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.confirm-text {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.confirm-btn {
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 14px;
}

.confirm-btn.cancel {
  background: #f2f2f2;
  color: #666;
}

.confirm-btn.primary {
  background: #f97316;
  color: #fff;
}
</style>

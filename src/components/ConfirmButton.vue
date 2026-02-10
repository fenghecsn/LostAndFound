<template>
  <button
    class="confirm-button"
    :class="{ 'is-armed': armed }"
    type="button"
    @click="handleClick"
  >
    <span v-if="!armed">{{ label }}</span>
    <span v-else>{{ confirmLabel }}</span>
  </button>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'

interface Props {
  label?: string
  confirmLabel?: string
  timeoutMs?: number
}

const props = withDefaults(defineProps<Props>(), {
  label: '删除',
  confirmLabel: '再次点击确认',
  timeoutMs: 2000,
})

const emit = defineEmits<{ (e: 'confirm'): void }>()

const armed = ref(false)
let timer: number | undefined

const reset = () => {
  armed.value = false
  if (timer) {
    window.clearTimeout(timer)
    timer = undefined
  }
}

const handleClick = () => {
  if (!armed.value) {
    armed.value = true
    timer = window.setTimeout(reset, props.timeoutMs)
    return
  }
  reset()
  emit('confirm')
}

onBeforeUnmount(reset)
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

.confirm-button.is-armed {
  background: #ef4444;
}
</style>

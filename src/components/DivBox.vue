<script setup lang="ts">
import { useDraggable } from '@vueuse/core'
import { type PropType, computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useEditorStore } from '@/stores/editor'

const props = defineProps({
  position: {
    type: Object as PropType<{ left: number, top: number }>,
    default: () => ({ left: 0, top: 0 }),
  },
  rect: {
    type: Object as PropType<{ width: number, height: number }>,
    default: () => ({ width: 50, height: 50 }),
  },
  background: {
    type: Object as PropType<Base.DivBox['background']>,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
  isResizable: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['close', 'update:position', 'update:isDragging'])

const { editorSelectedMenu } = storeToRefs(useEditorStore())

const el = ref<HTMLElement | null>(null)

const isInteractive = computed(() => editorSelectedMenu.value.key === 'pointer')

const backgroundStr = computed(() => {
  return props.background?.map((bg) => {
    return `${bg.image} ${bg.x}px ${bg.y}px / ${bg.w}px ${bg.h}px`
  }).join(',') || ''
})

useDraggable(el, {
  initialValue: { x: props.position.left, y: props.position.top },
  onStart(_position, e) {
    // console.log('onStart', _position)
    e.stopPropagation()
    if (!isInteractive.value)
      return false
    // prevent conflict with resize event
    if (_position.x > props.rect.width - 10 || _position.y > props.rect.height - 10)
      return false
    emit('update:isDragging', true)
  },
  onMove(_position, e) {
    // console.log('onMove', _position, e.offsetX, e.offsetY)
    if (!isInteractive.value)
      return false
    const x = e.clientX - el.value!.parentElement!.offsetLeft - props.rect.width / 2
    const y = e.clientY - el.value!.parentElement!.offsetTop - props.rect.height / 2
    emit('update:position', { x, y })
    e.stopPropagation()
  },
  onEnd(_position, e) {
    // console.log('onEnd', _position)
    emit('update:isDragging', false)
    // e.stopPropagation()
  },
})

function onClose() {
  emit('close')
}
</script>

<template>
  <div
    ref="el"
    :style="{ left: `${position.left}px`, top: `${position.top}px`, width: `${rect.width}px`, height: `${rect.height}px`, background: backgroundStr }"
    class="absolute box-content h-50 w-50 bg-no-repeat!"
    :class="[isInteractive && isSelected ? 'border border-solid border-green!' : '']"
  >
    <!-- close handle -->
    <div
      v-show="isInteractive && isSelected"
      class="i-ph-x-circle-fill absolute right-0 top-0 z-10 translate-x-1/2 translate-y--1/2 hover:color-green"
      @click.stop="onClose"
    />

    <!-- resize handle -->
    <div v-show="isInteractive && isResizable && isSelected" id="resize" class="h-full w-full resize overflow-hidden" />
  </div>
</template>

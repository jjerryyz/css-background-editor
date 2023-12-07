<script setup lang="ts">
import { useDraggable } from '@vueuse/core';
import { onMounted, onUnmounted, ref, type PropType } from 'vue';

const props = defineProps({
  position: {
    type: Object as PropType<{ left: number; top: number }>,
    default: () => ({ left: 0, top: 0 })
  },
  rect: {
    type: Object as PropType<{ width: number; height: number }>,
    default: () => ({ width: 50, height: 50 })
  },
  background: {
    type: String,
    default: '',
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
})

const el = ref<HTMLElement | null>(null)
const resizeEl = ref<HTMLElement | null>(null)

const emit = defineEmits(['close', 'update:position', 'update:rect']);

useDraggable(el, {
  initialValue: { x: props.position.left, y: props.position.top },
  onStart(_position, e) {
    // console.log('onStart', _position)
    e.stopPropagation()
    // prevent conflict with resize event
    if (_position.x > props.rect.width - 10 || _position.y > props.rect.height - 10) {
      return false
    }
  },
  onMove(_position, e) {
    // console.log('onMove', _position, e.offsetX, e.offsetY)
    emit('update:position', { left: _position.x, top: _position.y })
    e.stopPropagation()
  }
})


const resizeObserver = new ResizeObserver((entries) => {
  const entry = entries[0]
  // console.log('entry', entry)
  const { contentRect: { width: w, height: h } } = entry;

  if (w > 10 && h > 10) {
    emit('update:rect', { width: w, height: h })
  }
});

onMounted(() => {
  resizeObserver.observe(resizeEl.value!);
})
onUnmounted(() => {
  if (resizeEl.value) {
    resizeObserver.unobserve(resizeEl.value!);
  }
})

const onClose = () => {
  // console.log('onClose')
  emit('close')
}

</script>



<template>
  <div ref="el"
    :style="{ left: position.left + 'px', top: position.top + 'px', width: rect.width + 'px', height: rect.height + 'px', background }"
    class="box-content absolute w-50 h-50 bg-no-repeat!" :class="[isSelected ? 'border border-solid border-green!' : '']">
    <div v-show="isSelected"
      class="i-ph-x-circle-fill absolute z-10 right-0 top-0 hover:color-green translate-y--1/2 translate-x-1/2"
      @click.stop="onClose" />
    <div v-show="isSelected" ref="resizeEl" class="w-full h-full resize overflow-hidden" />
  </div>
</template>
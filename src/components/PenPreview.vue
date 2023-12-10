<script setup lang="ts">
import { useEditorStore } from '@/stores/editor'

defineProps<{ left: number, top: number }>()

const editorStore = useEditorStore()
</script>

<template>
  <div
    :style="{ left: `${left}px`, top: `${top}px`, width: `${editorStore.penSize}px`, height: `${editorStore.penSize}px`, background: editorStore.penPreviewBg }"
    class="pointer-events-none h-10 w-10 border-[0.5px] border-slate-4 border-solid bg-slate"
  />
</template>

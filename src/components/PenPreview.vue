<script setup lang="ts">
import { useEditorStore } from '@/stores/editor';

defineProps<{ left: number; top: number }>()

const editorStore = useEditorStore()

</script>

<template>
  <div
    :style="{ left: left + 'px', top: top + 'px', width: editorStore.penSize + 'px', height: editorStore.penSize + 'px', background: editorStore.penPreviewBg }"
    class="w-10 h-10 bg-slate border-[0.5px] border-solid border-slate-4 pointer-events-none"></div>
</template>
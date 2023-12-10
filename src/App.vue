<script setup lang="ts">
import PanelBoard from './components/PanelBoard.vue'
import PropEditor from '@/components/PropEditor.vue'
import DivLayer from '@/components/DivBoxLayer.vue'
</script>

<template>
  <div class="border-0 border-b border-slate-4 border-solid py-2">
    Css Editor
  </div>
  <div class="h-full w-full flex">
    <DivLayer />

    <PanelBoard />

    <PropEditor />
  </div>
</template>

<style scoped></style>

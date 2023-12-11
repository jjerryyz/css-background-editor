<script setup lang="ts">
import PanelBoard from './components/PanelBoard.vue'
import { useShortcut } from './composables/shortcut'
import PropEditor from '@/components/PropEditor.vue'

useShortcut()
</script>

<template>
  <div class="border-0 border-b border-slate-4 border-solid py-2">
    Css Editor
  </div>
  <div class="h-full w-full flex">
    <PanelBoard />

    <PropEditor />
  </div>
</template>

<style scoped></style>

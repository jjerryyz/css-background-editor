<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useBoardStore } from '@/stores/board'

const boardStore = useBoardStore()
const { divBoxConfigs } = storeToRefs(boardStore)
</script>

<template>
  <div class="mt-4 h-full flex-1 border border-slate-4 rounded-10 border-solid p-2 hover:border-green">
    <div v-for="(item, index) in divBoxConfigs" :key="index">
      {{ item }}
    </div>
  </div>
</template>

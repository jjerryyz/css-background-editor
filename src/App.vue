<script setup lang="ts">

import PropEditor from '@/components/PropEditor.vue';
import Board from './components/Board.vue';



</script>

<template>
  <div class="py-2 border-0 border-b border-solid border-slate-4">Css Editor</div>
  <div class=" h-full w-full flex">
    <Board />
    <PropEditor />
  </div>
</template>

<style scoped></style>

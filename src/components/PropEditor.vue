<script setup lang="ts">
import { useEditorStore } from '@/stores/editor';
import { storeToRefs } from 'pinia';
import PropEditorPen from './PropEditorPen.vue';
import { editorMenus } from '@/constants/editorMenus';
import { useBoardStore } from '@/stores/board';
import PenPreview from '@/components/PenPreview.vue';

const boardStore = useBoardStore();
const { divBoxConfigs } = storeToRefs(boardStore);

const editorStore = useEditorStore()
const { editorSelectedMenuIndex } = storeToRefs(editorStore)

const clearCanvas = () => {
  divBoxConfigs.value = [];
}

</script>

<template>
  <div class="mt-4 p-4 h-full flex-1 border border-solid border-slate-4 rounded-10 hover:border-green">
    <div>
      <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        @click="clearCanvas">Clear</button>
    </div>

    <div class="flex items-center">
      <span class="w-[6em]">preview: </span>
      <PenPreview :left="0" :top="0" />
    </div>

    <div class="my-2 p-4 border-[0.5px] border-solid border-slate-4 rounded flex items-center flex-wrap gap-2 ">
      <div v-for="(item, index) in editorMenus" :key="index"
        :class="['fn-div', editorSelectedMenuIndex === index ? 'bg-green-700' : '']"
        @click="editorSelectedMenuIndex = index">
        <div :class="['fn-div-icon', item.icon]"></div>
      </div>
    </div>

    <PropEditorPen />
  </div>
</template>

<style scoped>
.fn-div {
  @apply : relative flex items-center justify-center w-8 h-8 border-[0.5px] border-solid border-slate-5 rounded font-300 hover:border-green-700;
}

.fn-div-icon {
  @apply: p-8 text-8 w-full h-full pointer-events-none;
}
</style>

<script setup lang="ts">
import { useEditorStore } from '@/stores/editor';
import { storeToRefs } from 'pinia';
import PropEditorPointer from './PropEditorPointer.vue';
import PropEditorPen from './PropEditorPen.vue';
import { editorMenus } from '@/stores/editor';
import { useBoardStore } from '@/stores/board';

import { onKeyStroke } from '@vueuse/core';

const boardStore = useBoardStore();
const { divBoxConfigs } = storeToRefs(boardStore);

const editorStore = useEditorStore()
const { editorSelectedMenuIndex, editorSelectedMenu } = storeToRefs(editorStore)

const clearCanvas = () => {
  divBoxConfigs.value = [];
}

onKeyStroke(['1', '2', '3'], (e) => {

  const index = Number(e.key) - 1;

  editorSelectedMenuIndex.value = index;
  boardStore.onSwitchMenu()

  e.preventDefault();
}, { dedupe: true })

onKeyStroke('Backspace', (e) => {
  console.log('Backspace')
  if (editorSelectedMenu.value.key == 'pointer') {
    boardStore.onClose();
  }
  e.preventDefault();
}, { dedupe: true })

onKeyStroke('c', (e) => {
  if (!e.ctrlKey) return;
  console.log('Copy', boardStore.currentDivBoxIndex)
  if (boardStore.currentDivBoxIndex != -1) {
    const divBox = boardStore.divBoxConfigs[boardStore.currentDivBoxIndex];
    const content = JSON.stringify(divBox);
    // set system clipboard
    navigator.clipboard.writeText(content).then(() => {
      console.log('copy success')
    }, () => {
      console.log('copy fail')
    });
  }
  e.preventDefault();
}, { dedupe: true })

onKeyStroke('v', (e) => {
  if (!e.ctrlKey) return;
  console.log('Paste')
  navigator.clipboard.readText().then((content) => {
    console.log('paste success', content)
    const divBox: Base.DivBox = JSON.parse(content);
    boardStore.drawDivBox({
      width: divBox.width,
      height: divBox.height,
      background: divBox.background,
      isResizable: divBox.isResizable,
    })
  }, () => {
    console.log('paste fail')
  });
  e.preventDefault();
}, { dedupe: true })

</script>

<template>
  <div class="mt-4 p-4 h-full flex-1 border border-solid border-slate-4 rounded-10 hover:border-green">
    <div>
      <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        @click="clearCanvas">Clear</button>
    </div>

    <!-- <div class="flex items-center">
      <span class="w-[6em]">preview: </span>
      <PenPreview :left="0" :top="0" />
    </div> -->

    <div class="my-2 p-4 border-[0.5px] border-solid border-slate-4 rounded flex items-center flex-wrap gap-2 ">
      <div v-for="(item, index) in editorMenus" :key="index"
        :class="['flex flex-col', 'fn-div', editorSelectedMenuIndex === index ? 'bg-green-700' : '']"
        @click="editorSelectedMenuIndex = index">
        <div :class="['fn-div-icon', item.icon]"></div>
        <div class="absolute right-[1px] bottom-0 pointer-events-none text-sm">{{ index + 1 }}</div>
      </div>
    </div>

    <PropEditorPointer v-if="editorSelectedMenu.key == 'pointer'" />

    <PropEditorPen v-if="editorSelectedMenu.key == 'div'" />
  </div>
</template>

<style scoped>
.fn-div {
  @apply : relative flex items-center justify-center w-8 h-8 border-[0.5px] border-solid border-slate-5 rounded font-300 hover:border-green-700;
}

.fn-div-icon {
  @apply: p-8 text-8 pointer-events-none;
}
</style>

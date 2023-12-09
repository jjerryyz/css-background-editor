<script setup lang="ts">
import { useBoardStore } from '@/stores/board';
import { useEditorStore } from '@/stores/editor';
import { storeToRefs } from 'pinia';

const editorStore = useEditorStore();
const { penImageType, penSize, linearGradientObj, radialGradientObj } = storeToRefs(editorStore)

const { divBoxConfigs, isPointerSelecting, pointerSelectDivStyleObj } = storeToRefs(useBoardStore());

const combineDivBoxes = (e: MouseEvent) => {
  const selected = divBoxConfigs.value.filter(item => item.selected);
  if (selected.length <= 1) return;

  const wrapperDiv: Base.DivBox = {
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    background: [],
    selected: true,
    isResizable: false
  }

  let left = Number.MAX_VALUE, right = 0, top = Number.MAX_VALUE, bottom = 0;
  selected.forEach(item => {
    left = Math.min(item.left, left);
    right = Math.max(item.left + item.width, right);
    top = Math.min(item.top, top);
    bottom = Math.max(item.top + item.height, bottom);
  })
  console.log('combineDivBoxes', left, right, top, bottom)

  wrapperDiv.left = left;
  wrapperDiv.top = top;
  wrapperDiv.width = Math.max(right - left, 0);
  wrapperDiv.height = Math.max(bottom - top, 0);

  selected.forEach(item => {
    item.background.forEach(bg => {
      wrapperDiv.background.push({
        ...bg,
        x: item.left - wrapperDiv.left,
        y: item.top - wrapperDiv.top,
      })
    })
  })

  divBoxConfigs.value = divBoxConfigs.value.filter(item => !item.selected);
  divBoxConfigs.value.push(wrapperDiv);
}

</script>


<template>
  <div>
    <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      @click="combineDivBoxes">combine</button>
  </div>
</template>
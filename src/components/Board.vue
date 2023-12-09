<script setup lang="ts">
import { useBoardStore } from '@/stores/board';
import { useEditorStore } from '@/stores/editor';
import { align2Grid, align2Range } from '@/utils/ui';
import { useDebounceFn } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { computed, onUnmounted, watch } from 'vue';
import DivBox from './DivBox.vue';
import PenPreview from './PenPreview.vue';

const boardStore = useBoardStore()
const { align2Board } = boardStore;

const { isClick, isPointerSelecting, pointerSelectDivStyleObj, pressOffset, offset, canvasEl, divBoxConfigs, currentDivBoxIndex } = storeToRefs(boardStore)

const editorStore = useEditorStore();
const { pen, penSize, editorSelectedMenu, } = storeToRefs(editorStore)

let hoveringTarget: HTMLElement | null = null;

const backgroundStyle = computed(() => pen.value.join(','));


const pointerSelectDivStyle = computed(() => {
  return {
    left: `${pointerSelectDivStyleObj.value.left}px`,
    top: `${pointerSelectDivStyleObj.value.top}px`,
    width: `${pointerSelectDivStyleObj.value.width}px`,
    height: `${pointerSelectDivStyleObj.value.height}px`,
  }
})

const isDivBoxPointless = computed(() => {
  switch (editorSelectedMenu.value.key) {
    case 'pointer':
      return isPointerSelecting.value;
    case 'div':
      return hoveringTarget === canvasEl.value;
    case 'pen':
      return true;
    default:
      return true;
  }
})


const resizeObserver = new ResizeObserver((entries) => {
  const entry = entries[0]
  // console.log('entry', entry)
  const { contentRect: { width: w, height: h } } = entry;

  if (w > 10 && h > 10) {
    const item = divBoxConfigs.value[currentDivBoxIndex.value];

    if (!item.isResizable) return;

    item.width = w;
    item.height = h;

    item.background[0].w = w;
    item.background[0].h = h;
  }
});

watch(currentDivBoxIndex, (newIndex, oldIndex) => {

  if (oldIndex != -1) {
    const lastEl = document.querySelector(`#divbox_${oldIndex} #resize`);
    lastEl && resizeObserver.unobserve(lastEl)
  }

  if (newIndex != -1) {
    const newEl = document.querySelector(`#divbox_${newIndex} #resize`);
    newEl && resizeObserver.observe(newEl);
  }
})


onUnmounted(() => {
  resizeObserver.disconnect();
})


const checkDivBoxSelected = useDebounceFn(() => {
  for (let i = 0; i < divBoxConfigs.value.length; i++) {
    const item = divBoxConfigs.value[i];
    const { left, top, width, height } = item;
    const rect = pointerSelectDivStyleObj.value;

    if (rect.left < left && rect.left + rect.width > left + width && rect.top < top && rect.top + rect.height > top + height) {
      item.selected = true;
    } else {
      item.selected = false;
    }
  }
}, 10)


const onUpdatePosition = (item: any, position: any) => {
  // console.log('onUpdatePosition', item, position)
  item.left = align2Board(align2Grid(position.left) - item.width / 2);
  item.top = align2Board(align2Grid(position.top) - item.height / 2);
}

const handleSelectDivBox = (e: PointerEvent) => {
  const target = e.target as HTMLElement;
  const targetId = target.id;
  // handle click divbox
  let index = -1;
  if (targetId == 'resize') {
    index = +target.parentElement!.id.split('_')[1];
  } else {
    index = +targetId.split('_')[1];
  }

  currentDivBoxIndex.value = index;

  if (e.ctrlKey) {
    // ctrl key to toggle index divbox's select
    divBoxConfigs.value[index].selected = !divBoxConfigs.value[index].selected
    return;
  }

  divBoxConfigs.value.forEach((item, i) => {
    item.selected = i === index;
  })

}


const onPointerDown = (e: MouseEvent) => {
  isClick.value = true;

  offset.value.x = e.offsetX;
  offset.value.y = e.offsetY;

  pressOffset.value = { x: e.offsetX, y: e.offsetY };

  switch (editorSelectedMenu.value.key) {
    case 'pointer': {
      break;
    }
    case 'div': {
      // clear select box
      if (currentDivBoxIndex.value != -1) {
        currentDivBoxIndex.value = -1;
      }
      boardStore.drawDivBox();
      break;
    }
    default:
      break;
  }

}


const onPointerMove = (e: PointerEvent) => {
  if (isClick.value) {
    isPointerSelecting.value = true;
  } else {
    isPointerSelecting.value = false;
  }

  hoveringTarget = e.target as HTMLElement;

  offset.value.x = e.offsetX;
  offset.value.y = e.offsetY;

  switch (editorSelectedMenu.value.key) {
    case 'pointer': {
      // check if divBox is Selected
      if (isPointerSelecting.value && hoveringTarget == canvasEl.value) {
        checkDivBoxSelected();
      } else if (hoveringTarget.id == 'resize' || hoveringTarget.id!.startsWith('divbox_')) {
        // TODO: select divbox when draging
      }
      break;
    }
    case 'div': {
      break;
    }
    case 'pen':
      if (isClick.value) {
        boardStore.drawDivBox()
      }
    default:
      break;
  }

}

const onPointerUp = (e: PointerEvent) => {
  // console.log('onPointerUp', e)

  const target = e.target as HTMLElement;
  const targetId = target.id;

  switch (editorSelectedMenu.value.key) {
    case 'pointer': {
      // handle pointer select
      if (isPointerSelecting.value) {
        checkDivBoxSelected();
        break;
      }
      // handle click board
      if (target == canvasEl.value) {
        divBoxConfigs.value.forEach(item => item.selected = false)
      } else if (targetId == 'resize' || targetId!.startsWith('divbox_')) {
        handleSelectDivBox(e);
      }

      break;
    }
    default:
      break;
  }
  isClick.value = false;
  isPointerSelecting.value = false;
}

const onPointerLeave = (e: MouseEvent) => {
  isPointerSelecting.value = false;
  hoveringTarget = null;
  isClick.value = false;
  offset.value.x = 0;
  offset.value.y = 0;
}


</script>


<template>
  <!-- Canvas -->
  <div id="canvas" @pointerdown="onPointerDown" @pointermove="onPointerMove" @pointerleave="onPointerLeave"
    @pointerup="onPointerUp" :style="{ background: backgroundStyle, backgroundRepeat: 'no-repeat' }" ref="canvasEl"
    class="m-4 h-full flex-[3] box-content overflow-hidden border border-solid border-slate-4 rounded-10 hover:border-green relative bg-grid">

    <DivBox v-for="(item, index) in divBoxConfigs" :id="'divbox_' + index" :is-selected="item.selected"
      :is-resizable="item.isResizable" :key="index" :rect="{ width: item.width, height: item.height }"
      :position="{ left: item.left, top: item.top }" @update:position="onUpdatePosition(item, $event)"
      :background="item.background" @close="boardStore.onClose()"
      :class="[isDivBoxPointless ? 'pointer-events-none' : '']" />

    <PenPreview v-if="hoveringTarget && editorSelectedMenu.key === 'div'" class="absolute"
      :left="align2Board(align2Grid(offset.x) - penSize / 2)" :top="align2Board(align2Grid(offset.y) - penSize / 2)" />


    <div v-if="isPointerSelecting" class="pointer-events-none absolute border border-solid border-green"
      :style="pointerSelectDivStyle" />

    <div>offset{{ offset.x }}, {{ offset.y }}</div>

  </div>
</template>

<style scoped >
.bg-grid {
  background-image: repeating-linear-gradient(0deg, transparent, transparent 9.5px, #000 9.5px, #000 10px),
    repeating-linear-gradient(90deg, transparent, transparent 9.5px, #000 9.5px, #000 10px);
}
</style>
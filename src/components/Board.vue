<script setup lang="ts">
import { useBoardStore } from '@/stores/board';
import { editorMenus, useEditorStore } from '@/stores/editor';
import { storeToRefs } from 'pinia';
import { computed, nextTick, onUnmounted, ref, watch } from 'vue';
import DivBox from './DivBox.vue';
import PenPreview from './PenPreview.vue';
import { align2Grid, align2Zero } from '@/utils/ui'
import { useDebounceFn } from '@vueuse/core'

const boardStore = useBoardStore()
const { isClick, isPointerSelecting, pressOffset, offset, canvasEl, divBoxConfigs, currentDivBoxIndex } = storeToRefs(boardStore)

const editorStore = useEditorStore();
const { pen, penSize, editorSelectedMenu, editorSelectedMenuIndex } = storeToRefs(editorStore)

let hoveringTarget: HTMLElement | null = null;

const backgroundStyle = computed(() => pen.value.join(','));

const pointerSelectDivStyleObj = computed(() => {
  let { x: left, y: top } = pressOffset.value;
  const { x, y } = offset.value;

  const width = Math.abs(x - left);
  const height = Math.abs(y - top);

  if (x < left) {
    left = x;
  }
  if (y < top) {
    top = y;
  }

  return { left: left, top: top, width: width, height: height }
})

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
    item.width = w;
    item.height = h;

    const image = editorStore.getPenImage();
    const background = `${image} 0 0 / ${item.width}px ${item.height}px`
    item.background = background;
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

const drawADiv = () => {

  const image = editorStore.getPenImage();
  const background = `${image} 0 0 / ${penSize.value}px ${penSize.value}px`

  divBoxConfigs.value.push({
    left: align2Zero(align2Grid(offset.value.x) - penSize.value / 2),
    top: align2Zero(align2Grid(offset.value.y) - penSize.value / 2),
    width: penSize.value,
    height: penSize.value,
    background,
    selected: false
  })

  nextTick(() => {
    currentDivBoxIndex.value = - 1;
    editorSelectedMenuIndex.value = 0;
    isClick.value = false;
  })

}


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
  item.left = align2Grid(position.left) - item.width / 2;
  item.top = align2Grid(position.top) - item.height / 2;
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
      drawADiv();
      break;
    }
    default:
      break;
  }

}


const onPointerMove = (e: MouseEvent) => {
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
      if (isPointerSelecting.value) {
        checkDivBoxSelected();
      }
      break;
    }
    case 'div': {
      break;
    }
    case 'pen':
      if (isClick.value) {
        drawADiv()
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
        // handle click divbox
        let index = 0;
        if (targetId == 'resize') {
          index = +target.parentElement!.id.split('_')[1];
        } else {
          index = +targetId.split('_')[1];
        }

        if (e.ctrlKey) {
          // ctrl key to toggle index divbox's select
          divBoxConfigs.value[index].selected = !divBoxConfigs.value[index].selected
          return;
        }

        divBoxConfigs.value.forEach((item, i) => {
          item.selected = i === index;
        })
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

    <DivBox v-for="(item, index) in divBoxConfigs" :id="'divbox_' + index" :is-selected="item.selected" :key="index"
      :rect="{ width: item.width, height: item.height }" :position="{ left: item.left, top: item.top }"
      @update:position="onUpdatePosition(item, $event)" :background="item.background" @close="boardStore.onClose()"
      :class="[isDivBoxPointless ? 'pointer-events-none' : '']" />

    <PenPreview v-if="hoveringTarget && editorSelectedMenu.key === 'div'" class="absolute"
      :left="align2Zero(align2Grid(offset.x) - penSize / 2)" :top="align2Zero(align2Grid(offset.y) - penSize / 2)" />


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
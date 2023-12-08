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
const { isClick, isPointerSelecting, pressOffset, offset, canvas, divBoxConfigs, currentDivBoxIndex } = storeToRefs(boardStore)

const isHovering = ref(false)

const editorStore = useEditorStore();
const { pen, penSize, editorSelectedMenu, editorSelectedMenuIndex } = storeToRefs(editorStore)


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
    left: align2Zero(offset.value.x - penSize.value / 2),
    top: align2Zero(offset.value.y - penSize.value / 2),
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
  if (!isPointerSelecting.value) return false;
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

const onClickDivBox = (index: number, e: KeyboardEvent) => {

  if (divBoxConfigs.value.filter(item => item.selected).length > 1) {
    if (e.ctrlKey) {

    }
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
      drawADiv();
      break;
    }
    default:
      break;
  }

}


const onPointerMove = (e: MouseEvent) => {
  isHovering.value = true;

  const target = e.target as HTMLElement;

  offset.value.x = e.offsetX;
  offset.value.y = e.offsetY;

  switch (editorSelectedMenu.value.key) {
    case 'pointer': {
      if (isClick.value) {
        // check if divBox is Selected
        checkDivBoxSelected();
      }
      break;
    }
    case 'div': {
      if (target.id !== canvas.value!.id) {
        isHovering.value = false;
        return;
      }
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

const onPointerUp = (e: MouseEvent) => {
  isClick.value = false;

  switch (editorSelectedMenu.value.key) {
    case 'pointer': {
      checkDivBoxSelected();
      break;
    }
    default:
      break;
  }
}

const onPointerLeave = (e: MouseEvent) => {
  isHovering.value = false;
  isClick.value = false;
  offset.value.x = 0;
  offset.value.y = 0;
}


</script>


<template>
  <!-- Canvas -->
  <div id="canvas" @pointerdown="onPointerDown" @pointermove="onPointerMove" @pointerleave="onPointerLeave"
    @pointerup="onPointerUp" :style="{ background: backgroundStyle, backgroundRepeat: 'no-repeat' }" ref="canvas"
    class="m-4 h-full flex-[3] box-content overflow-hidden border border-solid border-slate-4 rounded-10 hover:border-green relative bg-grid">

    <DivBox v-for="(item, index) in divBoxConfigs" :id="'divbox_' + index" :is-selected="item.selected" :key="index"
      :rect="{ width: item.width, height: item.height }" :position="{ left: item.left, top: item.top }"
      @update:position="onUpdatePosition(item, $event)" :background="item.background" @close="boardStore.onClose()"
      @click="onClickDivBox(index, $event)" :class="[isPointerSelecting ? 'pointer-events-none' : '']" />

    <PenPreview v-if="editorSelectedMenu.key === 'div' && isHovering" class="absolute"
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
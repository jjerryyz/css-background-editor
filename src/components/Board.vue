<script setup lang="ts">
import { useBoardStore } from '@/stores/board';
import { useEditorStore } from '@/stores/editor';
import { storeToRefs } from 'pinia';
import { computed, nextTick, ref } from 'vue';
import DivBox from './DivBox.vue';

const { isClick, offset, canvas, divBoxConfigs } = storeToRefs(useBoardStore())

const isHovering = ref(false)

const editorStore = useEditorStore();
const { pen, penSize, editorSelectedMenu, } = storeToRefs(editorStore)


const backgroundStyle = computed(() => pen.value.join(','));

const currentDivBoxIndex = ref(-1);

const drawADiv = (e: MouseEvent) => {

  const image = editorStore.getPenImage();
  const background = `${image} 0 0 / ${penSize.value}px ${penSize.value}px`

  divBoxConfigs.value.push({
    left: e.offsetX - penSize.value / 2,
    top: e.offsetY - penSize.value / 2,
    width: penSize.value,
    height: penSize.value,
    background
  })

  nextTick(() => {
    currentDivBoxIndex.value = divBoxConfigs.value.length - 1;
  })

  // const image = editorStore.getPenImage();

  // console.log('image', image)

  // pen.value.push(`${image} ${realX}px ${realY}px / ${penSize.value}px ${penSize.value}px`)
}


const onUpdatePosition = (item: any, position: any) => {
  item.left = position.left - item.width / 2;
  item.top = position.top - item.height / 2;
}

const onUpdateRect = (item: any, rect: any) => {
  item.width = rect.width;
  item.height = rect.height;

  const image = editorStore.getPenImage();
  const background = `${image} 0 0 / ${item.width}px ${item.height}px`
  item.background = background;
}

const onPointerDown = (e: MouseEvent) => {
  isClick.value = true;
  if (currentDivBoxIndex.value != -1) {
    currentDivBoxIndex.value = -1;
    return;
  }
  drawADiv(e);
}

const onPointerMove = (e: MouseEvent) => {
  isHovering.value = true;

  const target = e.target as HTMLElement;

  let offsetX = e.offsetX;
  let offsetY = e.offsetY;

  if (target.id !== canvas.value!.id) {
    isHovering.value = false;
    return;
  }

  offset.value.x = offsetX;
  offset.value.y = offsetY;

  if (editorSelectedMenu.value.key === 'pen') {
    if (isClick.value) {
      drawADiv(e)
    }
  }
}

const onPointerLeave = (e: MouseEvent) => {
  isHovering.value = false;
  isClick.value = false;
  offset.value.x = 0;
  offset.value.y = 0;
}

const onPointerUp = (e: MouseEvent) => {
  isClick.value = false;
}

const onClose = (item: any) => {
  console.log('onClose', item)
  const index = divBoxConfigs.value.indexOf(item);
  console.log('index', index)
  if (index != -1) {
    divBoxConfigs.value.splice(index, 1);
    currentDivBoxIndex.value = -1
  }
}

</script>


<template>
  <!-- Canvas -->
  <div id="canvas" @pointerdown="onPointerDown" @pointermove="onPointerMove" @pointerleave="onPointerLeave"
    @pointerup="onPointerUp" :style="{ background: backgroundStyle, backgroundRepeat: 'no-repeat' }" ref="canvas"
    class="m-4 h-full flex-[3] border border-solid border-slate-4 rounded-10 hover:border-green relative">
    <DivBox v-for="(item, index) in divBoxConfigs" :is-selected="currentDivBoxIndex === index" :key="index"
      :rect="{ width: item.width, height: item.height }" @update:rect="onUpdateRect(item, $event)"
      :position="{ left: item.left, top: item.top }" @update:position="onUpdatePosition(item, $event)"
      :background="item.background" @close="onClose(item)" @click="currentDivBoxIndex = index" />

    <div v-if="isHovering" class="pointer-events-none absolute border border-solid border-slate-4"
      :style="{ left: offset.x - penSize / 2 + 'px', top: offset.y - penSize / 2 + 'px', width: penSize + 'px', height: penSize + 'px' }">
    </div>

  </div>
</template>
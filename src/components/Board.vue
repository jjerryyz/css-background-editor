<script setup lang="ts">
import { useBoardStore } from '@/stores/board';
import { useEditorStore } from '@/stores/editor';
import { storeToRefs } from 'pinia';
import { computed, nextTick, onUnmounted, ref, watch } from 'vue';
import DivBox from './DivBox.vue';
import PenPreview from './PenPreview.vue';
import { align2Grid, align2Zero } from '@/utils/ui'

const { isClick, offset, canvas, divBoxConfigs } = storeToRefs(useBoardStore())

const isHovering = ref(false)

const editorStore = useEditorStore();
const { pen, penSize, editorSelectedMenu, } = storeToRefs(editorStore)


const backgroundStyle = computed(() => pen.value.join(','));

const currentDivBoxIndex = ref(-1);

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

watch(currentDivBoxIndex, (index, oldIndex) => {
  if (oldIndex != -1) {
    const lastEl = document.querySelector(`#divbox_${oldIndex} #resize`);
    resizeObserver.unobserve(lastEl!)
  }

  if (index != -1) {
    const newEl = document.querySelector(`#divbox_${index} #resize`);
    resizeObserver.observe(newEl!);
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
    background
  })

  nextTick(() => {
    currentDivBoxIndex.value = divBoxConfigs.value.length - 1;
  })

}


const onUpdatePosition = (item: any, position: any) => {
  // console.log('onUpdatePosition', item, position)
  item.left = align2Grid(position.left) - item.width / 2;
  item.top = align2Grid(position.top) - item.height / 2;
}


const onPointerDown = (e: MouseEvent) => {
  isClick.value = true;
  updateOffset(e);
  drawADiv();
}


const updateOffset = (e: MouseEvent) => {
  offset.value.x = align2Grid(e.offsetX);
  offset.value.y = align2Grid(e.offsetY);
}

const onPointerMove = (e: MouseEvent) => {
  isHovering.value = true;

  const target = e.target as HTMLElement;

  if (target.id !== canvas.value!.id) {
    isHovering.value = false;
    return;
  }

  updateOffset(e);

  if (editorSelectedMenu.value.key === 'pen') {
    if (isClick.value) {
      drawADiv()
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
  // console.log('onClose', item)
  const index = divBoxConfigs.value.indexOf(item);
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
    class="m-4 h-full flex-[3] box-content overflow-hidden border border-solid border-slate-4 rounded-10 hover:border-green relative bg-grid">

    <DivBox v-for="(item, index) in divBoxConfigs" :id="'divbox_' + index" :is-selected="currentDivBoxIndex === index"
      :key="index" :rect="{ width: item.width, height: item.height }" :position="{ left: item.left, top: item.top }"
      @update:position="onUpdatePosition(item, $event)" :background="item.background" @close="onClose(item)"
      @click="currentDivBoxIndex = index" />

    <PenPreview class="absolute" v-show="isHovering" :left="align2Zero(offset.x - penSize / 2)"
      :top="align2Zero(offset.y - penSize / 2)" />
    <div>offset{{ offset.x }}, {{ offset.y }}</div>

  </div>
</template>

<style scoped >
.bg-grid {
  background-image: repeating-linear-gradient(0deg, transparent, transparent 9.5px, #000 9.5px, #000 10px),
    repeating-linear-gradient(90deg, transparent, transparent 9.5px, #000 9.5px, #000 10px);
}
</style>
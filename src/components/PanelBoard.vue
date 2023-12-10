<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { computed, onUnmounted, ref, watch } from 'vue'
import DivBox from './DivBox.vue'
import PenPreview from './PenPreview.vue'
import { useEditorStore } from '@/stores/editor'
import { useBoardStore } from '@/stores/board'

const boardStore = useBoardStore()
const { align2Board, align2NearestBox } = boardStore

const { isClick, isPointerSelecting, pointerSelectDivStyleObj, pressOffset, offset, canvasEl, divBoxConfigs, currentDivBoxIndex, alignLineHStyle, alignLineVStyle } = storeToRefs(boardStore)

const editorStore = useEditorStore()
const { pen, penSize, editorSelectedMenu } = storeToRefs(editorStore)

let hoveringTarget: HTMLElement | null = null

const backgroundStyle = computed(() => pen.value.join(','))

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
      return isPointerSelecting.value
    case 'div':
      return hoveringTarget === canvasEl.value
    case 'pen':
      return true
    default:
      return true
  }
})

const resizeObserver = new ResizeObserver((entries) => {
  const entry = entries[0]
  // console.log('entry', entry)
  const { contentRect: { width: w, height: h } } = entry

  if (w > 10 && h > 10) {
    const item = divBoxConfigs.value[currentDivBoxIndex.value]

    if (!item.isResizable)
      return

    item.width = w
    item.height = h

    item.background[0].w = w
    item.background[0].h = h
  }
})

watch(currentDivBoxIndex, (newIndex, oldIndex) => {
  if (oldIndex !== -1) {
    const lastEl = document.querySelector(`#divbox_${oldIndex} #resize`)
    lastEl && resizeObserver.unobserve(lastEl)
  }

  if (newIndex !== -1) {
    const newEl = document.querySelector(`#divbox_${newIndex} #resize`)
    newEl && resizeObserver.observe(newEl)
  }
})

onUnmounted(() => {
  resizeObserver.disconnect()
})

const checkDivBoxSelected = useDebounceFn(() => {
  for (let i = 0; i < divBoxConfigs.value.length; i++) {
    const item = divBoxConfigs.value[i]
    const { left, top, width, height } = item
    const rect = pointerSelectDivStyleObj.value

    if (rect.left < left && rect.left + rect.width > left + width && rect.top < top && rect.top + rect.height > top + height)
      item.selected = true
    else
      item.selected = false
  }
}, 10)

function onUpdatePosition(divBox: Base.DivBox, position: { x: number, y: number, e: PointerEvent }) {
  // find the nearest divBox
  let x = 0; let y = 0

  alignLineHStyle.value = undefined
  alignLineVStyle.value = undefined
  if (position.e.ctrlKey) {
    const { x: _x, y: _y } = align2NearestBox(position, divBox)
    x = _x
    y = _y
  }
  else {
    x = position.x
    y = position.y
  }

  divBox.left = align2Board(x)
  divBox.top = align2Board(y)
}

function onDragEnd() {
  alignLineHStyle.value = undefined
  alignLineVStyle.value = undefined
}

function handleSelectDivBox(e: PointerEvent) {
  const target = e.target as HTMLElement
  const targetId = target.id
  // handle click divbox
  let index = -1
  if (targetId === 'resize')
    index = +target.parentElement!.id.split('_')[1]
  else
    index = +targetId.split('_')[1]

  currentDivBoxIndex.value = index

  if (e.ctrlKey) {
    // ctrl key to toggle index divbox's select
    divBoxConfigs.value[index].selected = !divBoxConfigs.value[index].selected
    return
  }

  divBoxConfigs.value.forEach((item, i) => {
    item.selected = i === index
  })
}

function updateOffset(e: MouseEvent) {
  offset.value.x = e.clientX - canvasEl.value!.getBoundingClientRect().left
  offset.value.y = e.clientY - canvasEl.value!.getBoundingClientRect().top
}

function onPointerDown(e: MouseEvent) {
  isClick.value = true

  updateOffset(e)

  pressOffset.value = { x: offset.value.x, y: offset.value.y }

  switch (editorSelectedMenu.value.key) {
    case 'pointer': {
      break
    }
    case 'div': {
      // clear select box
      // if (currentDivBoxIndex.value !== -1)
      //   currentDivBoxIndex.value = -1

      // boardStore.drawDivBox()
      break
    }
    default:
      break
  }
}

function onPointerMove(e: PointerEvent) {
  if (isClick.value)
    isPointerSelecting.value = true
  else
    isPointerSelecting.value = false

  hoveringTarget = e.target as HTMLElement

  updateOffset(e)

  switch (editorSelectedMenu.value.key) {
    case 'pointer': {
      // check if divBox is Selected
      if (isPointerSelecting.value && hoveringTarget === canvasEl.value) {
        checkDivBoxSelected()
      }
      else if (hoveringTarget.id === 'resize' || hoveringTarget.id!.startsWith('divbox_')) {
        // TODO: select divbox when draging
      }
      break
    }
    case 'div': {
      break
    }
    case 'pen':
      if (isClick.value)
        boardStore.drawDivBox()

      break
    default:
  }
}

function onPointerUp(e: PointerEvent) {
  // console.log('onPointerUp', e)

  const target = e.target as HTMLElement
  const targetId = target.id

  updateOffset(e)

  switch (editorSelectedMenu.value.key) {
    case 'pointer': {
      // handle pointer select
      if (isPointerSelecting.value) {
        checkDivBoxSelected()
        break
      }
      // handle click board
      if (target === canvasEl.value)
        divBoxConfigs.value.forEach(item => item.selected = false)
      else if (targetId === 'resize' || targetId!.startsWith('divbox_'))
        handleSelectDivBox(e)

      break
    }
    case 'div': {
      if (isPointerSelecting) {
        boardStore.drawDivBox({
          left: pointerSelectDivStyleObj.value.left,
          top: pointerSelectDivStyleObj.value.top,
          width: pointerSelectDivStyleObj.value.width,
          height: pointerSelectDivStyleObj.value.height,
        })
      }

      break
    }
    default:
      break
  }
  isClick.value = false
  isPointerSelecting.value = false
}

function onPointerLeave() {
  isPointerSelecting.value = false
  hoveringTarget = null
  isClick.value = false
  offset.value.x = 0
  offset.value.y = 0
}
</script>

<template>
  <!-- Canvas -->
  <div
    id="canvas" ref="canvasEl" :style="{ background: backgroundStyle, backgroundRepeat: 'no-repeat' }" class="bg-grid relative m-4 box-content h-full flex-[3] overflow-hidden border border-slate-4 rounded-10 border-solid hover:border-green"
    @pointerdown="onPointerDown" @pointermove="onPointerMove" @pointerleave="onPointerLeave"
    @pointerup="onPointerUp"
  >
    <DivBox
      v-for="(item, index) in divBoxConfigs" :id="`divbox_${index}`" :key="index"
      :is-selected="item.selected" :is-resizable="item.isResizable" :rect="{ width: item.width, height: item.height }" :position="{ left: item.left, top: item.top }"
      :background="item.background" :class="[isDivBoxPointless ? 'pointer-events-none' : '']"
      @darg-end="onDragEnd" @update:position="onUpdatePosition(item, $event)"
      @close="boardStore.onClose()"
    />

    <!-- align line -->
    <div v-if="editorSelectedMenu.key === 'pointer' && alignLineHStyle" :style="alignLineHStyle" class="pointer-events-none absolute bg-red" />
    <div v-if="editorSelectedMenu.key === 'pointer' && alignLineVStyle" :style="alignLineVStyle" class="pointer-events-none absolute bg-red" />

    <div
      v-if="isPointerSelecting" class="pointer-events-none absolute border border-green border-solid"
      :style="pointerSelectDivStyle"
    />

    <div>offset{{ offset.x }}, {{ offset.y }}</div>
  </div>
</template>

<style scoped>
.bg-grid {
  background-image: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 9.5px,
      #000 9.5px,
      #000 10px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 9.5px,
      #000 9.5px,
      #000 10px
    );
}
</style>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { computed, onUnmounted, ref, watch } from 'vue'
import DivBox from './DivBox.vue'
import PenPreview from './PenPreview.vue'
import { useEditorStore } from '@/stores/editor'
import { useBoardStore } from '@/stores/board'

const boardStore = useBoardStore()
const { align2Board } = boardStore

const { isClick, isPointerSelecting, pointerSelectDivStyleObj, pressOffset, offset, canvasEl, divBoxConfigs, currentDivBoxIndex } = storeToRefs(boardStore)

const editorStore = useEditorStore()
const { pen, penSize, editorSelectedMenu } = storeToRefs(editorStore)

let hoveringTarget: HTMLElement | null = null

const alignLineHStyle = ref<{ left: string, top: string, width: string, height: string }>()
const alignLineVStyle = ref<{ left: string, top: string, width: string, height: string }>()

const isDragging = ref(false)

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

function onUpdatePosition(divBox: Base.DivBox, position: { x: number, y: number }) {
  // find the nearest divBox
  let x = position.x
  let y = position.y
  alignLineHStyle.value = undefined
  alignLineVStyle.value = undefined
  if (divBoxConfigs.value.length > 1) {
    const gap = 10
    for (let i = 0; i < divBoxConfigs.value.length; i++) {
      const item = divBoxConfigs.value[i]
      if (divBox === item)
        continue

      const { left, top, width, height } = item
      const right = left + width
      const bottom = top + height

      let match: 'left' | 'right' | 'top' | 'bottom' | '' = ''
      let matchV: 'top' | 'bottom' | '' = ''

      if (Math.abs(left - position.x) < gap) {
        x = left
        match = 'left'
      }
      else if (Math.abs(right - position.x) < gap) {
        x = right
        match = 'left'
      }
      else if (Math.abs(left - (position.x + divBox.width)) < gap) {
        x = left - divBox.width
        match = 'right'
      }
      else if (Math.abs(right - (position.x + divBox.width)) < gap) {
        x = right - divBox.width
        match = 'right'
      }

      if (Math.abs(top - position.y) < gap) {
        y = top
        matchV = 'top'
      }
      else if (Math.abs(bottom - position.y) < gap) {
        y = bottom
        matchV = 'top'
      }
      else if (Math.abs(top - (position.y + divBox.height)) < gap) {
        y = top - divBox.height
        matchV = 'bottom'
      }
      else if (Math.abs(bottom - (position.y + divBox.height)) < gap) {
        y = bottom - divBox.height
        matchV = 'bottom'
      }

      if (match) {
        alignLineHStyle.value = {
          left: `${match === 'right' ? x + divBox.width : x}px`,
          top: `${y}px`,
          width: `1px`,
          height: `100px`,
        }
      }
      if (matchV) {
        alignLineVStyle.value = {
          left: `${x}px`,
          top: `${matchV === 'bottom' ? y + divBox.height : y}px`,
          width: `100px`,
          height: `1px`,
        }
      }
      // if (match || matchV)
      //   break
    }
  }

  divBox.left = align2Board(x)
  divBox.top = align2Board(y)
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
      if (currentDivBoxIndex.value !== -1)
        currentDivBoxIndex.value = -1

      boardStore.drawDivBox()
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
      @update:is-dragging="isDragging = $event" @update:position="onUpdatePosition(item, $event)"
      @close="boardStore.onClose()"
    />

    <!-- align line -->
    <div v-if="editorSelectedMenu.key === 'pointer' && isDragging" :style="alignLineHStyle" class="pointer-events-none absolute bg-red" />
    <div v-if="editorSelectedMenu.key === 'pointer' && isDragging" :style="alignLineVStyle" class="pointer-events-none absolute bg-red" />

    <PenPreview
      v-if="hoveringTarget && editorSelectedMenu.key === 'div'" class="absolute"
      :left="align2Board(offset.x - penSize / 2)" :top="align2Board(offset.y - penSize / 2)"
    />

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

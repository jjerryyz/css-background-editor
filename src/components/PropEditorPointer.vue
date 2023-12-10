<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useBoardStore } from '@/stores/board'

const { divBoxConfigs } = storeToRefs(useBoardStore())

// eslint-disable-next-line unused-imports/no-unused-vars
function combineDivBoxes(e: MouseEvent) {
  const selected = divBoxConfigs.value.filter(item => item.selected)
  if (selected.length <= 1)
    return

  const wrapperDiv: Base.DivBox = {
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    background: [],
    selected: true,
    isResizable: false,
  }

  let left = Number.MAX_VALUE; let right = 0; let top = Number.MAX_VALUE; let bottom = 0
  selected.forEach((item) => {
    left = Math.min(item.left, left)
    right = Math.max(item.left + item.width, right)
    top = Math.min(item.top, top)
    bottom = Math.max(item.top + item.height, bottom)
  })
  console.log('combineDivBoxes', left, right, top, bottom)

  wrapperDiv.left = left
  wrapperDiv.top = top
  wrapperDiv.width = Math.max(right - left, 0)
  wrapperDiv.height = Math.max(bottom - top, 0)

  selected.forEach((item) => {
    item.background.forEach((bg) => {
      wrapperDiv.background.push({
        ...bg,
        x: item.left - wrapperDiv.left,
        y: item.top - wrapperDiv.top,
      })
    })
  })

  divBoxConfigs.value = divBoxConfigs.value.filter(item => !item.selected)
  divBoxConfigs.value.push(wrapperDiv)
}
</script>

<template>
  <div>
    <button
      class="rounded bg-green-500 px-4 py-2 text-white font-bold hover:bg-green-700"
      @click="combineDivBoxes"
    >
      combine
    </button>
  </div>
</template>

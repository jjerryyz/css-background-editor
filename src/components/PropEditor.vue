<script setup lang="ts">
import { onKeyStroke } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import PropEditorPen from './PropEditorPen.vue'
import PropEditorPointer from './PropEditorPointer.vue'
import { editorMenus, useEditorStore } from '@/stores/editor'

import { useBoardStore } from '@/stores/board'

const boardStore = useBoardStore()
const { divBoxConfigs } = storeToRefs(boardStore)

const editorStore = useEditorStore()
const { editorSelectedMenuIndex, editorSelectedMenu } = storeToRefs(editorStore)

function clearCanvas() {
  divBoxConfigs.value = []
}

onKeyStroke(['1', '2', '3', 'Backspace', 'c', 'v', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'], (e) => {
  if (e.target !== document.body)
    return

  switch (e.key) {
    case '1':
    case '2':
    case '3': {
      const index = Number(e.key) - 1
      editorSelectedMenuIndex.value = index
      boardStore.onSwitchMenu()
      break
    }
    case 'Backspace': {
      console.log('Backspace')
      if (editorSelectedMenu.value.key === 'pointer')
        boardStore.onClose()
      break
    }
    case 'c': {
      if (!e.ctrlKey)
        return
      console.log('Copy', boardStore.currentDivBoxIndex)
      if (boardStore.currentDivBoxIndex !== -1) {
        const divBox = boardStore.divBoxConfigs[boardStore.currentDivBoxIndex]
        const content = JSON.stringify(divBox)
        // set system clipboard
        navigator.clipboard.writeText(content).then(() => {
          console.log('copy success')
        }, () => {
          console.log('copy fail')
        })
      }
      break
    }
    case 'v': {
      if (!e.ctrlKey)
        return
      console.log('Paste')
      navigator.clipboard.readText().then((content) => {
        console.log('paste success', content)
        const divBox: Base.DivBox = JSON.parse(content)
        boardStore.drawDivBox({
          width: divBox.width,
          height: divBox.height,
          background: divBox.background,
          isResizable: divBox.isResizable,
        })
      }, () => {
        console.log('paste fail')
      })
      break
    }
    case 'ArrowUp':
    case 'ArrowDown':
    case 'ArrowLeft':
    case 'ArrowRight': {
      if (boardStore.currentDivBoxIndex !== -1) {
        const divBox = boardStore.divBoxConfigs[boardStore.currentDivBoxIndex]
        const step = 2
        if (e.key === 'ArrowUp')
          divBox.top -= step
        else if (e.key === 'ArrowDown')
          divBox.top += step
        else if (e.key === 'ArrowLeft')
          divBox.left -= step
        else if (e.key === 'ArrowRight')
          divBox.left += step
      }
      break
    }
  }

  e.preventDefault()
}, { dedupe: true })
</script>

<template>
  <div class="mt-4 h-full flex-1 border border-slate-4 rounded-10 border-solid p-4 hover:border-green">
    <div>
      <button class="rounded bg-green-500 px-4 py-2 text-white font-bold hover:bg-green-700" @click="clearCanvas">
        Clear
      </button>
    </div>

    <div class="my-2 flex flex-wrap items-center gap-2 border-[0.5px] border-slate-4 rounded border-solid p-4">
      <div
        v-for="(item, index) in editorMenus" :key="index" class="fn-div flex flex-col"
        :class="[editorSelectedMenuIndex === index ? 'bg-green-700' : '']" @click="editorSelectedMenuIndex = index"
      >
        <div class="fn-div-icon" :class="[item.icon]" />
        <div class="pointer-events-none absolute bottom-0 right-[1px] text-sm">
          {{ index + 1 }}
        </div>
      </div>
    </div>

    <PropEditorPointer v-if="editorSelectedMenu.key === 'pointer'" />

    <PropEditorPen v-if="editorSelectedMenu.key === 'div'" />
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

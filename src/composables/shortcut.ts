import { storeToRefs } from 'pinia'
import { onKeyStroke } from '@vueuse/core'
import { useBoardStore } from '@/stores/board'
import { useEditorStore } from '@/stores/editor'

export function useShortcut() {
  const boardStore = useBoardStore()

  const editorStore = useEditorStore()
  const { editorSelectedMenuIndex, editorSelectedMenu } = storeToRefs(editorStore)

  onKeyStroke(['1', '2', '3', 'Backspace', 'c', 'v', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ''], (e) => {
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
}

import { defineStore, storeToRefs } from 'pinia'
import { computed, nextTick, ref } from 'vue'
import { useEditorStore } from './editor'
import { align2Range } from '@/utils/ui'

export const useBoardStore = defineStore('board', () => {
  const editorStore = useEditorStore()

  const { penSize, editorSelectedMenuIndex } = storeToRefs(editorStore)

  const canvasEl = ref<HTMLDivElement>()

  const divBoxConfigs = ref<Base.DivBox[]>([])

  const isClick = ref(false)

  const isPointerSelecting = ref(false)

  const offset = ref({ x: 0, y: 0 })

  const pressOffset = ref({ x: 0, y: 0 })

  const currentDivBoxIndex = ref(-1)

  const pointerSelectDivStyleObj = computed(() => {
    let { x: left, y: top } = pressOffset.value
    const { x, y } = offset.value

    const width = Math.abs(x - left)
    const height = Math.abs(y - top)

    if (x < left)
      left = x

    if (y < top)
      top = y

    return { left, top, width, height }
  })

  const align2Board = (value: number) => align2Range(value, [0, canvasEl.value!.offsetWidth])

  const drawDivBox = (options: Partial<Base.DivBox> = {}) => {
    const image = editorStore.getPenImage()!
    const background: Base.DivBox['background'] = [{ image, x: 0, y: 0, w: penSize.value, h: penSize.value }]

    divBoxConfigs.value.push({
      left: align2Board(offset.value.x - penSize.value / 2),
      top: align2Board(offset.value.y - penSize.value / 2),
      width: penSize.value,
      height: penSize.value,
      background,
      selected: false,
      isResizable: true,
      ...options,
    })

    nextTick(() => {
      currentDivBoxIndex.value = -1
      editorSelectedMenuIndex.value = 0
      isClick.value = false
    })
  }

  const onClose = () => {
    // console.log('onClose', item)
    switch (editorStore.editorSelectedMenu.key) {
      case 'div':
        if (currentDivBoxIndex.value !== -1) {
          divBoxConfigs.value.splice(currentDivBoxIndex.value, 1)
          currentDivBoxIndex.value = -1
        }
        break
      case 'pointer': {
        divBoxConfigs.value = divBoxConfigs.value.filter(item => !item.selected)
        break
      }
      default:
        break
    }
  }

  const onSwitchMenu = () => {
    isClick.value = false
    divBoxConfigs.value.forEach(item => item.selected = false)
    currentDivBoxIndex.value = -1
  }

  return { canvasEl, divBoxConfigs, isClick, isPointerSelecting, pointerSelectDivStyleObj, pressOffset, offset, currentDivBoxIndex, align2Board, drawDivBox, onClose, onSwitchMenu }
})

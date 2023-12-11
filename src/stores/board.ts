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

  const hoveringTarget = ref<HTMLElement>()

  const align2Board = (value: number) => align2Range(value, [0, canvasEl.value!.offsetWidth])

  const alignLineHStyle = ref<{ left: string, top: string, width: string, height: string }>()
  const alignLineVStyle = ref<{ left: string, top: string, width: string, height: string }>()

  const align2NearestBox = (position: { x: number, y: number }, divBox: Base.DivBox) => {
    let x = position.x
    let y = position.y
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
    return { x, y }
  }

  const drawDivBox = (options: Partial<Base.DivBox> = {}) => {
    const image = editorStore.getPenImage()!

    const background: Base.DivBox['background'] = [{
      image,
      x: 0,
      y: 0,
      w: options.width ? options.width : penSize.value,
      h: options.height ? options.height : penSize.value,
    }]

    divBoxConfigs.value.push({
      left: options.left ? options.left : align2Board(offset.value.x - penSize.value / 2),
      top: options.top ? options.top : align2Board(offset.value.y - penSize.value / 2),
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

  return { canvasEl, hoveringTarget, divBoxConfigs, isClick, isPointerSelecting, pointerSelectDivStyleObj, pressOffset, offset, currentDivBoxIndex, alignLineHStyle, alignLineVStyle, align2NearestBox, align2Board, drawDivBox, onClose, onSwitchMenu }
})

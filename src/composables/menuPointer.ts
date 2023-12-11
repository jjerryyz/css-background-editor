import { useDebounceFn } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { useBoardStore } from '@/stores/board'

export function useMenuPointer() {
  const boardStore = useBoardStore()

  const { isPointerSelecting, hoveringTarget, pointerSelectDivStyleObj, canvasEl, divBoxConfigs, currentDivBoxIndex } = storeToRefs(boardStore)

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

  const onPointerDown = (e: PointerEvent) => {
    // console.log('e')
  }
  const onPointerMove = (e: PointerEvent) => {
    // check if divBox is Selected
    if (isPointerSelecting.value && hoveringTarget.value === canvasEl.value) {
      checkDivBoxSelected()
    }
    else if (hoveringTarget.value?.id === 'resize' || hoveringTarget.value?.id.startsWith('divbox_')) {
      // TODO: select divbox when draging
    }
  }
  const onPointerUp = (e: PointerEvent) => {
    const target = e.target as HTMLElement
    const targetId = target.id
    // handle pointer select
    if (isPointerSelecting.value) {
      checkDivBoxSelected()
      return
    }
    // handle click board
    if (target === canvasEl.value)
      divBoxConfigs.value.forEach(item => item.selected = false)
    else if (targetId === 'resize' || targetId!.startsWith('divbox_'))
      handleSelectDivBox(e)
  }

  return { onPointerDown, onPointerMove, onPointerUp }
}

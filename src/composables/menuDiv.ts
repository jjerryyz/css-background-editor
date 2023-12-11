import { storeToRefs } from 'pinia'
import { useBoardStore } from '@/stores/board'

export function useMenuDiv() {
  const boardStore = useBoardStore()

  const { isPointerSelecting, pointerSelectDivStyleObj } = storeToRefs(boardStore)

  const onPointerDown = (e: PointerEvent) => {
    // clear select box
    // if (currentDivBoxIndex.value !== -1)
    //   currentDivBoxIndex.value = -1

    // boardStore.drawDivBox()

  }
  const onPointerMove = (e: PointerEvent) => {}
  const onPointerUp = (e: PointerEvent) => {
    if (isPointerSelecting) {
      boardStore.drawDivBox({
        left: pointerSelectDivStyleObj.value.left,
        top: pointerSelectDivStyleObj.value.top,
        width: pointerSelectDivStyleObj.value.width,
        height: pointerSelectDivStyleObj.value.height,
      })
    }
  }

  return { onPointerDown, onPointerMove, onPointerUp }
}

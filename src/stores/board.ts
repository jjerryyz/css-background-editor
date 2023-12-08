import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useEditorStore } from "./editor";
import { align2Grid } from "@/utils/ui";

export const useBoardStore = defineStore("board", () => {

  const editor = useEditorStore();

  const canvas = ref<HTMLDivElement>()

  const divBoxConfigs = ref<{ left: number, top: number; width: number; height: number, background: string, selected: boolean }[]>([]);

  const isClick = ref(false);

  const isPointerSelecting = computed(() => {
    const moveOffsetX = Math.abs(pressOffset.value.x - offset.value.x);
    const moveOffsetY = Math.abs(pressOffset.value.y - offset.value.y);
    // console.log('isPointerSelecting', moveOffsetX, moveOffsetY);
    if (moveOffsetX < 0.1 && moveOffsetY < 0.1) return false;

    return isClick.value && editor.editorSelectedMenu.key === 'pointer';
  });

  const offset = ref({ x: 0, y: 0 })

  const pressOffset = ref({ x: 0, y: 0 });

  const currentDivBoxIndex = ref(-1);

  const onClose = () => {
    // console.log('onClose', item)
    switch (editor.editorSelectedMenu.key) {
      case 'div':
        if (currentDivBoxIndex.value != -1) {
          divBoxConfigs.value.splice(currentDivBoxIndex.value, 1);
          currentDivBoxIndex.value = -1
        }
        break;
      case 'pointer': {
        divBoxConfigs.value = divBoxConfigs.value.filter(item => !item.selected)
        break;
      }
      default:
        break;
    }
  }

  const onSwitchMenu = () => {
    isClick.value = false;
  }

  return { canvas, divBoxConfigs, isClick, isPointerSelecting, pressOffset, offset, currentDivBoxIndex, onClose, onSwitchMenu }
})
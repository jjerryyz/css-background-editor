import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useEditorStore } from "./editor";
import { align2Grid } from "@/utils/ui";

export const useBoardStore = defineStore("board", () => {

  const editor = useEditorStore();

  const canvasEl = ref<HTMLDivElement>()

  const divBoxConfigs = ref<{ left: number, top: number; width: number; height: number, background: string, selected: boolean }[]>([]);

  const isClick = ref(false);

  const isPointerSelecting = ref(false);

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
    divBoxConfigs.value.forEach(item => item.selected = false);
    currentDivBoxIndex.value = -1;
  }

  return { canvasEl, divBoxConfigs, isClick, isPointerSelecting, pressOffset, offset, currentDivBoxIndex, onClose, onSwitchMenu }
})
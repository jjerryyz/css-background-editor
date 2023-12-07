import { defineStore } from "pinia";
import { reactive, ref } from "vue";

export const useBoardStore = defineStore("board", () => {
  const canvas = ref<HTMLDivElement>()

  const divBoxConfigs = ref<{ left: number, top: number; width: number; height: number, background: string }[]>([]);

  const isClick = ref(false);
  const offset = ref({ x: 0, y: 0 })

  return { canvas, divBoxConfigs, isClick, offset }
})
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const getSafeStop = (stop: number) => {
  // fix  round edges
  return stop === 100
    ? 100 : stop == 0
      ? 0 : stop - 0.5
}
export const editorMenus = [
  { key: 'pointer', icon: 'i-mynaui-mouse-pointer', hint: 'mouse' },
  { key: 'pen', icon: 'i-ph-pen', hint: 'pen mode' },
  { key: 'div', icon: 'i-ph-square', hint: 'div mode' },
]

export const useEditorStore = defineStore('editor', () => {

  const editorSelectedMenuIndex = ref(0)
  const editorSelectedMenu = computed(() => editorMenus[editorSelectedMenuIndex.value]);

  const penImageType = ref<'linear-gradient' | 'radial-gradient'>('linear-gradient');

  const linearGradientObj = ref({
    deg: 0,
    color: '#15803d',
    stop: 50
  })

  const radialGradientObj = ref({
    shape: 'circle',
    shapeSize: '',
    position: 'center',
    color: '#15803d',
    stop: 50
  })

  // const penImage = ref('linear-gradient(rgb(255,0,0), rgb(255,0,0))');
  const penSize = ref(100);

  const pen = ref<string[]>([])

  const penPreviewBg = computed(() => {
    return getPenImage();
  });

  const getPenImage = () => {
    let image = ''
    if (penImageType.value === 'linear-gradient') {
      const { deg, stop, color } = linearGradientObj.value;
      const stopVal = getSafeStop(stop)
      image = `linear-gradient(
      ${deg}deg, 
      ${color}, ${stopVal}%, 
      transparent ${stop}%
      )`
    } else if (penImageType.value === 'radial-gradient') {
      const { shape: _shape, shapeSize, position, stop, color } = radialGradientObj.value;
      let shape = _shape;
      if (shape == 'size') {
        shape = shapeSize;
      }
      if (!shape) return;
      const stopVal = getSafeStop(stop)
      image = `radial-gradient(
      ${shape} at ${position}, 
      ${color} ${stopVal}%, 
      transparent ${stop}%
      )`
    }
    return image;
  }


  return { editorSelectedMenuIndex, penImageType, linearGradientObj, radialGradientObj, penSize, pen, penPreviewBg, editorSelectedMenu, getPenImage }
})

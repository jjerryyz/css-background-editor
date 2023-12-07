<script setup lang="ts">
import { useEditorStore } from '@/stores/editor';
import { storeToRefs } from 'pinia';

const editorStore = useEditorStore();
const { penImageType, penSize, linearGradientObj, radialGradientObj } = storeToRefs(editorStore)

</script>



<template>
  <div class="">
    <span class="w-[6em]">pen image: </span>
    <select v-model="penImageType">
      <option value="linear-gradient">linear-gradient</option>
      <option value="radial-gradient">radial-gradient</option>
    </select>

    <!-- linear gradient -->
    <div v-if="penImageType === 'linear-gradient'">
      <div class="flex items-center">
        <span class="w-[6em]">deg: </span>
        <input type="number" min="0" max="260" v-model="linearGradientObj.deg" />
      </div>
      <div class="flex items-center">
        <span class="w-[6em]">color: </span>
        <input type="color" v-model="linearGradientObj.color" />
      </div>
      <div class="flex items-center">
        <span class="w-[6em]">stop position: </span>
        <input type="number" min="0" max="100" v-model="linearGradientObj.stop" />
      </div>

    </div>
    <!-- radial gradient -->
    <div v-else-if="penImageType === 'radial-gradient'">
      <div class="flex items-center">
        <span class="w-[6em]">shape: </span>
        <select v-model="radialGradientObj.shape">
          <option value="circle">circle</option>
          <option value="ellipse">ellipse</option>
          <option value="size">size</option>
        </select>
        <input class="ml-2" v-if="radialGradientObj.shape === 'size'" v-model="radialGradientObj.shapeSize" />
      </div>
      <div class="flex items-center">
        <span class="w-[6em]">position: </span>
        <input v-model="radialGradientObj.position" />
      </div>
      <div class="flex items-center">
        <span class="w-[6em]">color: </span>
        <input type="color" v-model="radialGradientObj.color" />
      </div>
      <div class="flex items-center">
        <span class="w-[6em]">stop position: </span>
        <input type="number" min="0" max="100" v-model="radialGradientObj.stop" />
      </div>
    </div>

  </div>
  <div class="my-4 border-0 border-solid border-t-1 border-slate-4"></div>

  <div class="flex items-center">
    <span class="w-[6em]">pen size: </span>
    <input type="number" min="0" max="200" v-model="penSize" />
  </div>
</template>
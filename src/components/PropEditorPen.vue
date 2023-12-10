<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useEditorStore } from '@/stores/editor'

const editorStore = useEditorStore()
const { penImageType, penSize, linearGradientObj, radialGradientObj } = storeToRefs(editorStore)
</script>

<template>
  <div>
    <span class="w-[6em]">pen image: </span>
    <select v-model="penImageType">
      <option value="linear-gradient">
        linear-gradient
      </option>
      <option value="radial-gradient">
        radial-gradient
      </option>
    </select>

    <!-- linear gradient -->
    <div v-if="penImageType === 'linear-gradient'">
      <div class="flex items-center">
        <span class="w-[6em]">deg: </span>
        <input v-model="linearGradientObj.deg" type="number" min="0" max="260">
      </div>
      <div class="flex items-center">
        <span class="w-[6em]">color: </span>
        <input v-model="linearGradientObj.color" type="color">
      </div>
      <div class="flex items-center">
        <span class="w-[6em]">stop position: </span>
        <input v-model="linearGradientObj.stop" type="number" min="0" max="100">
      </div>
    </div>
    <!-- radial gradient -->
    <div v-else-if="penImageType === 'radial-gradient'">
      <div class="flex items-center">
        <span class="w-[6em]">shape: </span>
        <select v-model="radialGradientObj.shape">
          <option value="circle">
            circle
          </option>
          <option value="ellipse">
            ellipse
          </option>
          <option value="size">
            size
          </option>
        </select>
        <input v-if="radialGradientObj.shape === 'size'" v-model="radialGradientObj.shapeSize" class="ml-2">
      </div>
      <div class="flex items-center">
        <span class="w-[6em]">position: </span>
        <input v-model="radialGradientObj.position">
      </div>
      <div class="flex items-center">
        <span class="w-[6em]">color: </span>
        <input v-model="radialGradientObj.color" type="color">
      </div>
      <div class="flex items-center">
        <span class="w-[6em]">stop position: </span>
        <input v-model="radialGradientObj.stop" type="number" min="0" max="100">
      </div>
    </div>
  </div>

  <div class="my-4 border-0 border-t-1 border-slate-4 border-solid" />

  <div class="flex items-center">
    <span class="w-[6em]">pen size: </span>
    <input v-model="penSize" type="number" min="0" max="200">
  </div>
</template>

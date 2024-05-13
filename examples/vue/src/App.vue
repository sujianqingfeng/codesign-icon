<script setup lang="ts">
import base from '@sujian/icons-base/output/base.json'
import { onMounted, ref } from 'vue'
const names = Object.keys(base.icons).map((name) => `i-base-${name}`)

function getRandomColor() {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}
const color = ref(getRandomColor())

onMounted(() => {
  setInterval(() => {
    color.value = getRandomColor()
  }, 1000)
})
</script>

<template>
  <div
    class="flex justify-start items-center flex-wrap gap-4 bg-gray-4"
    :style="{ color: color }"
  >
    <view v-for="name in names" :key="name">
      <button :class="name" class="text-20"></button>
    </view>
  </div>
</template>

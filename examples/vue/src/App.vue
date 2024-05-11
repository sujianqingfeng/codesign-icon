<script setup lang="ts">
import base from '@sujian/icons-base/output/base.json'
const names = Object.keys(base.icons).map((name) => `i-base-${name}`)
</script>

<template>
  <div
    class="flex justify-start items-center color-red flex-wrap gap-4 bg-gray-4"
  >
    <button
      v-for="name in names"
      :key="name"
      :class="name"
      class="text-20"
    ></button>
  </div>
</template>

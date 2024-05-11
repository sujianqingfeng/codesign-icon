<script>
import * as icons from '@sujian/icons-base/uniapp'
export default {
  components: {
    ...icons
  },
  data() {
    return {
      title: 'Hello',
      icons
    }
  },
  onLoad() {},
  methods: {}
}
</script>

<template>
  <view class="content">
    <component
      :is="icon"
      v-for="icon in icons"
      :key="icon"
      color="red"
      size="40rpx"
    />
  </view>
</template>

<style>
.content {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}
</style>

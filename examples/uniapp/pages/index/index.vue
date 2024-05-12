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
    <view v-for="icon in icons" :key="icon" class="item">
      <component :is="icon" color="red" size="50rpx" />
      <!-- <view>{{ icon.name }}</view> -->
    </view>
  </view>
</template>

<style>
.content {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.item {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
</style>

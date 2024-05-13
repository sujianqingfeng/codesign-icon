<script>
import * as icons from '@sujian/icons-base/uniapp'
export default {
  components: {
    ...icons
  },
  data() {
    return {
      title: 'Hello',
      icons,
      color: 'red'
    }
  },
  onLoad() {
    setInterval(() => {
      this.color = this.getRandomColor()
    }, 1000)
  },
  methods: {
    getRandomColor() {
      const letters = '0123456789ABCDEF'
      let color = '#'
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
      }
      return color
    }
  }
}
</script>

<template>
  <view class="content">
    <view v-for="icon in icons" :key="icon" class="item">
      <component :is="icon" :color="color" size="50rpx" />
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

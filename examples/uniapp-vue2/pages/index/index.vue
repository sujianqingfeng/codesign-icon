<!-- eslint-disable prettier/prettier -->


<script>
import IconAi from 'virtual:icon/wxb-ai'
import IconWangfengqiang from 'virtual:icon/wxb-wangfengqiang'

export default {
  components: {
    IconAi,
    IconWangfengqiang
  },
  data() {
    return {
      title: 'Hello'
    }
  },
  onLoad() {},
  methods: {}
}
</script>

<template>
  <view class="content">
    <view class="icon-demo">
      <IconAi size="90px" color="red" />
      <IconWangfengqiang size="20px" />
    </view>
  </view>
</template>

<style>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>

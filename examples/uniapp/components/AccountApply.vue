<script>
export default {
  name: 'Icon',
  props: {
    color: {
      type: String,
      default: 'currentColor'
    },
    size: {
      type: String,
      default: '1em'
    }
  },
  data() {
    return {
      style: {
        mask: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='undefined undefined 24 24' width='24' height='24'%3E%3Cpath fill='currentColor' d='M2.892 17.179a.5.5 0 00.25.432l7.399 4.291a.5.5 0 00.75-.432v-8.588a.5.5 0 00-.248-.432l-7.4-4.291a.5.5 0 00-.75.432zm10.066-4.728a.5.5 0 00-.25.432v8.587a.5.5 0 00.751.432l7.4-4.29a.5.5 0 00.249-.433V8.59a.5.5 0 00-.751-.432zM12.21 1.806a.5.5 0 00-.502.004L4.35 6.172a.5.5 0 00.008.864l7.432 4.225a.5.5 0 00.502-.004l7.358-4.362a.5.5 0 00-.008-.865z'/%3E%3C/svg%3E\") no-repeat",
        'mask-size': '100% 100%',
        'background-color': 'currentColor',
        height: '1em',
        width: '1em'
      }
    }
  }
}
</script>

<template>
  <view :style="{ fontSize: size, color: color }">
    <view :style="style" />
  </view>
</template>

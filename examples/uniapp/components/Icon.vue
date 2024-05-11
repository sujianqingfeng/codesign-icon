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
        backgroundColor: 'currentColor',
        // mask: 'url(data:image/svg+xml;base64,PHBhdGggZmlsbD0iY3VycmVudENvbG9yIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMC4xNiAxMS41MjNhNC41OTkgNC41OTkgMCAxMDAtOS4xOTggNC41OTkgNC41OTkgMCAwMDAgOS4xOThNMS44ODUgMTguNDJhNS41MTcgNS41MTcgMCAwMTUuNTE4LTUuNTE4aDUuNTE4YTUuNTE3IDUuNTE3IDAgMDE1LjUxNyA1LjUxOHYyLjMzNGEuOTIuOTIgMCAwMS0uOTIuOTJIMi44MDVhLjkyLjkyIDAgMDEtLjkyLS45MnoiIGNsaXAtcnVsZT0iZXZlbm9kZCIvPjxwYXRoIGZpbGw9ImN1cnJlbnRDb2xvciIgZD0iTTIxLjY1NiA5LjIyNGgtNC41OThhLjQ2LjQ2IDAgMDAtLjQ2LjQ2di45MTlhLjQ2LjQ2IDAgMDAuNDYuNDZoNC41OThhLjQ2LjQ2IDAgMDAuNDYtLjQ2di0uOTJhLjQ2LjQ2IDAgMDAtLjQ2LS40Nm0wIDMuNjc4aC0xLjg0YS40Ni40NiAwIDAwLS40NTkuNDZ2LjkyYS40Ni40NiAwIDAwLjQ2LjQ2aDEuODRhLjQ2LjQ2IDAgMDAuNDU5LS40NnYtLjkyYS40Ni40NiAwIDAwLS40Ni0uNDYiLz4=) no-repeat',
        mask: "url(data:image/svg+xml;base64,%3Cpath fill='currentColor' fill-rule='evenodd' d='M10.16 11.523a4.599 4.599 0 100-9.198 4.599 4.599 0 000 9.198M1.885 18.42a5.517 5.517 0 015.518-5.518h5.518a5.517 5.517 0 015.517 5.518v2.334a.92.92 0 01-.92.92H2.805a.92.92 0 01-.92-.92z' clip-rule='evenodd'/%3E%3Cpath fill='currentColor' d='M21.656 9.224h-4.598a.46.46 0 00-.46.46v.919a.46.46 0 00.46.46h4.598a.46.46 0 00.46-.46v-.92a.46.46 0 00-.46-.46m0 3.678h-1.84a.46.46 0 00-.459.46v.92a.46.46 0 00.46.46h1.84a.46.46 0 00.459-.46v-.92a.46.46 0 00-.46-.46'/%3E) no-repeat",
        maskSize: '100% 100%',
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

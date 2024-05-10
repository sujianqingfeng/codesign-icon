import base from '@sujian/icons-base/output/base.json'
import { defineConfig, presetIcons, presetUno } from 'unocss'

const names = Object.keys(base.icons).map((name) => `i-base-${name}`)

export default defineConfig({
  safelist: [...names],
  presets: [
    presetUno(),
    presetIcons({
      collections: {
        base: () => base
      }
    })
  ]
})

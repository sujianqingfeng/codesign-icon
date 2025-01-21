# Codesign Icons

A toolkit for converting Codesign icons to multiple formats, supporting both web frameworks (via Iconify) and UniApp.

[English](#english) | [中文](#chinese)

![demo](./screenshots/demo.gif)

<a name="english"></a>
## 🌟 Features

- Convert Codesign icons to Iconify JSON format
- Automatic WeWork login authentication for Codesign
- Support for UnoCSS integration with on-demand icon loading
- Built-in webpack plugin for UniApp SVG icons
- Easy integration with Vue and other frameworks

## 🚀 Usage

### 1. Build Icons from Codesign

```js
import {
  fetchCodesignIconsByToken,
  buildIconifyJSON,
  buildUniAppIcons,
  getWeworkLoginToken
} from '@sujian/codesign-icon-core'

async function build() {
  const prefix = 'base'
  const dist = 'output/'
  
  // Get WeWork login token
  const token = await getWeworkLoginToken()
  
  // Fetch icons from Codesign
  const icons = await fetchCodesignIconsByToken({
    token,
    teamId: 'YOUR_TEAM_ID',
    projectId: 'YOUR_PROJECT_ID'
  })
  
  // Convert to Iconify format
  const rawData = await buildIconifyJSON({
    icons,
    prefix
  })
  
  // Save as JSON
  const exported = JSON.stringify(rawData, null, '\t')
  await fs.writeFile(`${dist}${prefix}.json`, exported, 'utf8')
}
```

### 2. Use with UnoCSS

```ts
// uno.config.ts
import base from '@sujian/icons-base/output/base.json'
import { defineConfig, presetIcons, presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      collections: {
        base: () => base
      }
    })
  ]
})
```

### 3. Use with UniApp (Vue)

```js
// vue.config.js
const iconData = require('@sujian/icons-base/output/base.json')
const { WebpackIconPlugin } = require('@sujian/codesign-icon-core')

module.exports = {
  configureWebpack: {
    plugins: [
      new WebpackIconPlugin({
        data: iconData,
        prefix: 'icon-' // optional, defaults to 'Icon'
      })
    ]
  }
}
```

Then use icons in your components:
```vue
<template>
  <view>
    <icon-name />
  </view>
</template>
```

## 📦 Project Structure

- `packages/core`: Main functionality for converting icons
- `packages/base`: Base icon set and build scripts
- `examples`: Example projects showing integration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

[MIT License](LICENSE)

---

<a name="chinese"></a>
# Codesign Icons 中文说明

一个用于将 Codesign 图标转换为多种格式的工具包，支持 Web 框架（通过 Iconify）和 UniApp。

## ✨ 特性

- 将 Codesign 图标转换为 Iconify JSON 格式
- 自动化的企业微信登录认证
- 支持 UnoCSS 按需加载图标
- 内置 UniApp SVG 图标的 webpack 插件
- 易于与 Vue 等框架集成

## 🚀 使用方法

### 1. 从 Codesign 构建图标

```js
import {
  fetchCodesignIconsByToken,
  buildIconifyJSON,
  buildUniAppIcons,
  getWeworkLoginToken
} from '@sujian/codesign-icon-core'

async function build() {
  const prefix = 'base'
  const dist = 'output/'
  
  // 获取企业微信登录令牌
  const token = await getWeworkLoginToken()
  
  // 从 Codesign 获取图标
  const icons = await fetchCodesignIconsByToken({
    token,
    teamId: 'YOUR_TEAM_ID',
    projectId: 'YOUR_PROJECT_ID'
  })
  
  // 转换为 Iconify 格式
  const rawData = await buildIconifyJSON({
    icons,
    prefix
  })
  
  // 保存为 JSON
  const exported = JSON.stringify(rawData, null, '\t')
  await fs.writeFile(`${dist}${prefix}.json`, exported, 'utf8')
}
```

### 2. 与 UnoCSS 集成

```ts
// uno.config.ts
import base from '@sujian/icons-base/output/base.json'
import { defineConfig, presetIcons, presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      collections: {
        base: () => base
      }
    })
  ]
})
```

### 3. 在 UniApp 中使用 (Vue)

```js
// vue.config.js
const iconData = require('@sujian/icons-base/output/base.json')
const { WebpackIconPlugin } = require('@sujian/codesign-icon-core')

module.exports = {
  configureWebpack: {
    plugins: [
      new WebpackIconPlugin({
        data: iconData,
        prefix: 'icon-' // 可选，默认为 'Icon'
      })
    ]
  }
}
```

然后在组件中使用图标：
```vue
<template>
  <view>
    <icon-name />
  </view>
</template>
```

## 📦 项目结构

- `packages/core`: 转换图标的核心功能
- `packages/base`: 基础图标集和构建脚本
- `examples`: 展示集成方式的示例项目

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

## 📄 开源协议

[MIT License](LICENSE)










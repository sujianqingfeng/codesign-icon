// const iconData = require('../../examples/uniapp/base.json')
// const UniappIcon = require('../../packages/core/dist/unplugin-uniapp-icon')
// console.log('🚀 ~ iconData:', iconData)

const path = require('path')
const iconData = require('../../packages/base/output/base.json')
const { WebpackIconPlugin } = require('../../packages/core/dist/index.cjs')

console.log('🚀 ~ UniappIcon:', WebpackIconPlugin)

module.exports = {
  configureWebpack: {
    plugins: [
      new WebpackIconPlugin({
        data: iconData,
        prefix: 'wxb-'
      })
    ],
    resolve: {
      alias: {
        'virtual-icon': path.resolve(__dirname, 'node_modules/virtual-icon')
      }
    }
  }
}

import type { IconifyJSON } from '@iconify/types'
import type { Compiler, ResolveData } from 'webpack'
import path from 'path'
import { iconToHTML, svgToURL } from '@iconify/utils'
import VirtualModulesPlugin from 'webpack-virtual-modules'
import { generateStyle, generateUniAppTemplate, isColors } from './utils'
import { toSvgs } from './utils'

export interface Options {
  /**
   * IconifyJSON data
   */
  data: IconifyJSON
  /**
   * Component name prefix
   * @default 'Icon'
   */
  prefix?: string
}

class UniappIconPlugin {
  private readonly options: Options
  private readonly icons: Map<string, string>
  private virtualModules: VirtualModulesPlugin

  constructor(options: Options) {
    this.options = options
    this.icons = new Map()
    this.virtualModules = new VirtualModulesPlugin({})
  }

  async init() {
    const prefix = this.options.prefix || 'Icon'
    const svgs = await toSvgs(this.options.data)

    for (const [name, icon] of svgs) {
      const { height = 16, width = 16 } = icon
      const svg = iconToHTML(icon.body, {
        viewBox: `${icon.left || 0} ${icon.top || 0} ${width} ${height}`,
        width: `${width}`,
        height: `${height}`
      })

      const url = svgToURL(svg)
      const componentName = `${prefix}${name}`
      const style = generateStyle(isColors(svg), url)
      const template = generateUniAppTemplate(
        JSON.stringify(style),
        componentName
      )

      // 使用绝对路径
      const modulePath = path.resolve(__dirname, `virtual/${componentName}.vue`)
      this.virtualModules.writeModule(modulePath, template)
      this.icons.set(componentName, modulePath)
    }
  }

  apply(compiler: Compiler) {
    // 应用虚拟模块插件
    this.virtualModules.apply(compiler)

    // 添加解析配置
    compiler.options.resolve = compiler.options.resolve || {}
    compiler.options.resolve.alias = compiler.options.resolve.alias || {}
    compiler.options.resolve.alias['virtual-icon'] = path.resolve(
      __dirname,
      'virtual'
    )

    compiler.hooks.beforeRun.tapPromise('UniappIconPlugin', async () => {
      await this.init()
    })

    compiler.hooks.watchRun.tapPromise('UniappIconPlugin', async () => {
      await this.init()
    })

    compiler.hooks.normalModuleFactory.tap(
      'UniappIconPlugin',
      (normalModuleFactory) => {
        normalModuleFactory.hooks.beforeResolve.tap(
          'UniappIconPlugin',
          (resolveData: ResolveData) => {
            if (!resolveData) {
              return
            }

            const request = resolveData.request
            if (request.startsWith('virtual:icon/')) {
              const iconName = request.slice('virtual:icon/'.length)
              const modulePath = this.icons.get(iconName)
              if (modulePath) {
                // 使用相对路径
                resolveData.request = path.relative(
                  path.dirname(resolveData.contextInfo.issuer),
                  modulePath
                )
              } else {
                console.warn(`Icon not found: ${iconName}`)
                console.warn('Available icons:', Array.from(this.icons.keys()))
              }
            }
          }
        )
      }
    )
  }
}

export default UniappIconPlugin

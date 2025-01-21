import type { IconifyJSON } from '@iconify/types'
import type { Compiler, ResolveData } from 'webpack'
import fs from 'fs'
import path from 'path'
import { iconToHTML, svgToURL } from '@iconify/utils'
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
  /**
   * Project root directory
   */
  root?: string
}

class UniappIconPlugin {
  private readonly options: Options
  private readonly icons: Map<string, string>
  private initialized: boolean = false
  private projectRoot: string
  private outputDir: string

  constructor(options: Options) {
    this.options = options
    this.icons = new Map()
    this.projectRoot = options.root || process.cwd()
    this.outputDir = path.resolve(
      this.projectRoot,
      'node_modules',
      '.icon-components'
    )
  }

  async init() {
    if (this.initialized) {
      return
    }

    // Ensure output directory exists
    try {
      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true })
      }
    } catch (error) {
      console.error('Error creating output directory:', error)
      return
    }

    const svgs = await toSvgs(this.options.data)

    for (const [name, icon] of svgs) {
      const { height = 16, width = 16 } = icon
      const svg = iconToHTML(icon.body, {
        viewBox: `${icon.left || 0} ${icon.top || 0} ${width} ${height}`,
        width: `${width}`,
        height: `${height}`
      })

      const url = svgToURL(svg)
      const componentName = `${this.options.prefix || ''}${name}`
      const style = generateStyle(isColors(svg), url)
      const template = generateUniAppTemplate(
        JSON.stringify(style),
        componentName
      )

      // Write component file
      const filePath = path.join(this.outputDir, `${componentName}.vue`)
      try {
        fs.writeFileSync(filePath, template, 'utf-8')
      } catch (error) {
        console.error(`Error writing file ${filePath}:`, error)
        continue
      }

      // Store component name and file name
      this.icons.set(componentName, `${componentName}.vue`)
    }

    // Generate index.js file for easy importing
    const indexContent = Array.from(this.icons.entries())
      .map(
        ([name, fileName]) =>
          `export { default as ${name} } from './${fileName}'`
      )
      .join('\n')

    try {
      fs.writeFileSync(
        path.join(this.outputDir, 'index.js'),
        indexContent,
        'utf-8'
      )
    } catch (error) {
      console.error('Error writing index.js:', error)
    }

    // Generate package.json to make it a valid module
    const packageJson = {
      name: '@virtual/icons',
      version: '1.0.0',
      private: true
    }

    try {
      fs.writeFileSync(
        path.join(this.outputDir, 'package.json'),
        JSON.stringify(packageJson, null, 2),
        'utf-8'
      )
    } catch (error) {
      console.error('Error writing package.json:', error)
    }

    this.initialized = true
  }

  apply(compiler: Compiler) {
    // Initialize when compilation starts
    compiler.hooks.beforeRun.tapPromise('UniappIconPlugin', async () => {
      await this.init()
    })

    compiler.hooks.watchRun.tapPromise('UniappIconPlugin', async () => {
      await this.init()
    })

    // Add resolve configuration
    compiler.options.resolve = compiler.options.resolve || {}
    compiler.options.resolve.alias = compiler.options.resolve.alias || {}
    compiler.options.resolve.alias['virtual:icon'] = this.outputDir

    compiler.hooks.normalModuleFactory.tap(
      'UniappIconPlugin',
      (normalModuleFactory) => {
        normalModuleFactory.hooks.beforeResolve.tap(
          'UniappIconPlugin',
          (resolveData: ResolveData) => {
            if (!resolveData || !resolveData.request) {
              return
            }

            const request = resolveData.request
            if (request.startsWith('virtual:icon/')) {
              const iconName = request.slice('virtual:icon/'.length)
              const fileName = this.icons.get(iconName)
              if (fileName) {
                resolveData.request = path.join(this.outputDir, fileName)
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

import type {
  BuildIconifyJSONOptions,
  BuildUniAppIconsOptions,
  FetchIconsParams
} from './types'
import { promises as fs } from 'fs'
import { iconToHTML, svgToURL } from '@iconify/utils'
import {
  generateUniAppTemplate,
  createMaxIntervalFn,
  fetchCodesignIcons,
  fetchToken,
  generateKey,
  generateQrCode,
  generateStyle,
  isColors,
  parseIcons,
  toSvgs,
  toCamelCase
} from './utils'

export async function fetchCodesignToken() {
  const key = generateKey()
  const url = `https://codesign.qq.com/login/${key}`
  generateQrCode(url)

  const token = (await createMaxIntervalFn<string | null>({
    fn: async () => {
      console.log('fetching token...')
      return fetchToken(key)
    }
  })) as string

  return token
}

export async function fetchCodesignIconsByToken(options: FetchIconsParams) {
  const { token, projectId, teamId } = options
  const icons = await fetchCodesignIcons({
    project_id: projectId,
    team_id: teamId,
    include: 'creator',
    per_page: 500,
    page: 1,
    Authorization: `Bearer ${token}`
  })

  if (!icons) {
    throw new Error('fetch icons failed')
  }

  if (!icons.data.length) {
    throw new Error('icons is empty')
  }

  return icons.data
}

export async function buildIconifyJSON(options: BuildIconifyJSONOptions) {
  const { prefix, icons } = options
  const data = parseIcons(icons, {
    prefix
  })
  return data
}

export async function buildUniAppIcons(options: BuildUniAppIconsOptions) {
  const { rawData, dist, exportPrefix } = options
  const svgs = await toSvgs(rawData)

  await fs.mkdir(dist, { recursive: true })

  const exportLines = []
  svgs.forEach(async ([name, icon]) => {
    // Get SVG
    const { height = 16, width = 16 } = icon
    const svg = iconToHTML(icon.body, {
      viewBox: `${icon.left || 0} ${icon.top || 0} ${width} ${height}`,
      width: `${width}`,
      height: `${height}`
    })

    // Generate URL
    const url = svgToURL(svg)

    const CamelCase = toCamelCase(name)

    const fileName = `${CamelCase}.vue`
    const exportName = `${exportPrefix}${CamelCase}`
    const path = `${dist}${fileName}`

    const style = generateStyle(isColors(svg), url)
    const template = generateUniAppTemplate(JSON.stringify(style), exportName)

    exportLines.push(`export { default as ${exportName} } from './${fileName}'`)
    await fs.writeFile(path, template, 'utf8')
  })

  await fs.writeFile(`${dist}index.js`, exportLines.join('\n'), 'utf8')
}

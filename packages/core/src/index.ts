import type { BuildIconifyJSONOptions, BuildUniAppIconsOptions } from './types'
import { promises as fs } from 'fs'
import { iconToHTML, svgToURL } from '@iconify/utils'
import {
  generateUniAppTemplate,
  createMaxIntervalFn,
  encodeSvg,
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

export async function buildIconifyJSON(options: BuildIconifyJSONOptions) {
  const { prefix, projectId, teamId, dist = '' } = options

  const key = generateKey()
  const url = `https://codesign.qq.com/login/${key}`
  generateQrCode(url)

  const token = (await createMaxIntervalFn<string | null>({
    fn: async () => {
      console.log('fetching token...')
      return fetchToken(key)
    }
  })) as string

  console.log('token:', token)

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

  const data = parseIcons(icons.data, {
    prefix
  })

  const exported = `${JSON.stringify(data, null, '\t')}\n`

  await fs.writeFile(`${dist}${prefix}.json`, exported, 'utf8')

  console.log('completed!')
}

export async function buildUniAppIcons(options: BuildUniAppIconsOptions) {
  const { rawData, dist } = options
  const svgs = await toSvgs(rawData)

  await fs.mkdir(dist, { recursive: true })

  svgs.forEach(async ([name, icon]) => {
    // Get SVG
    const svg = iconToHTML(icon.body, {
      viewBox: `${icon.left || 0} ${icon.top || 0} ${icon.width} ${icon.height}`,
      width: icon.width ? icon.width.toString() : 'auto',
      height: icon.height ? icon.height.toString() : 'auto'
    })

    // // Generate URL
    const url = svgToURL(svg)

    const style = generateStyle(isColors(svg), url)
    const template = generateUniAppTemplate(JSON.stringify(style))
    const CamelCase = toCamelCase(name)

    await fs.writeFile(`${dist}${CamelCase}.vue`, template, 'utf8')
  })
}

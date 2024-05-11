import type { IconsItem, IconsResp, IonsParams, TokenResp } from './types'
import type { IconifyJSON, IconifyIcon } from '@iconify/types'
import {
  blankIconSet,
  SVG,
  cleanupSVG,
  parseColors,
  runSVGO,
  isEmptyColor,
  IconSet
} from '@iconify/tools'

import { validateIconSet } from '@iconify/utils'
import { encodeSvgForCss } from '@iconify/utils/lib/svg/encode-svg-for-css'
// import { loadIcon } from '@iconify/utils/lib/loader/loader'
import qrcode from 'qrcode-terminal'
import { request } from 'undici'

export function generateKey(len: number = 16) {
  const t = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let n = ''
  for (let i = 0; i < len; i++) {
    n += t.charAt(Math.floor(Math.random() * t.length))
  }
  return n
}

export function generateQrCode(text: string) {
  qrcode.generate(text, { small: true })
}

export function createMaxIntervalFn<T>({
  fn,
  interval = 3000,
  max = 10
}: {
  fn: () => Promise<T>
  interval?: number
  max?: number
}) {
  return new Promise((resolve, reject) => {
    let i = 0
    const timer = setInterval(async () => {
      i += 1
      const result = await fn()
      if (result) {
        clearInterval(timer)
        resolve(result)
      }
      if (i >= max) {
        clearInterval(timer)
        reject('timeout')
      }
    }, interval)
  })
}

export async function fetchToken(key: string) {
  const { statusCode, body } = await request(
    `https://codesign.qq.com/oauth/check?key=${key}`
  )
  if (statusCode !== 200) {
    return null
  }

  const { result } = (await body.json()) as TokenResp

  if (result) {
    return result.token
  }
  return null
}

export async function fetchCodesignIcons(
  params: IonsParams & { Authorization: string }
) {
  const { project_id, team_id, include, per_page, page, Authorization } = params
  const { statusCode, body } = await request(
    `https://codesign.qq.com/api/icons?project_id=${project_id}&team_id=${team_id}&include=${include}&per_page=${per_page}&page=${page}`,
    {
      headers: {
        Authorization
      }
    }
  )
  if (statusCode !== 200) {
    return
  }
  const data = await body.json()

  return data as IconsResp
}

export function parseIcons(
  icons: IconsItem[],
  options: { prefix: string }
): IconifyJSON {
  const { prefix } = options
  const iconSet = blankIconSet(prefix)

  icons.forEach((icon) => {
    const svg = new SVG(icon.svg)
    cleanupSVG(svg)

    if (!isColors(svg.getBody())) {
      parseColors(svg, {
        defaultColor: 'currentColor',
        callback: (_, colorStr, color) => {
          return !color || isEmptyColor(color) ? 'currentColor' : colorStr
        }
      })
    }

    runSVGO(svg)

    const name = covertValidName(icon.class_name)
    iconSet.fromSVG(name, svg)
  })

  return iconSet.export()
}

export function isColors(svg: string) {
  const re = /fill="([^"]+)"/g
  const temp = []
  let match
  while ((match = re.exec(svg)) !== null) {
    const value = match[1]
    if (temp.indexOf(value) === -1) {
      temp.push(value)
    }
  }
  return temp.length > 1
}

export function covertValidName(text: string) {
  return text.replaceAll('_', '-').replace(/\s+/g, '-').toLowerCase()
}

export function toCamelCase(str) {
  return str
    .replace(/[-_]+/g, ' ')
    .toLowerCase()
    .replace(/(\b\w)/g, (char) => char.toUpperCase())
    .replace(/\s+/g, '')
}

export function encodeSvg(svg: string) {
  const r = encodeSvgForCss(svg)
  return `data:image/svg+xml;base64,${r}`
}

export async function toSvgs(rawData: IconifyJSON) {
  const validatedData = validateIconSet(rawData)
  const iconSet = new IconSet(validatedData)

  const svgs = []
  await iconSet.forEach(async (name) => {
    const icon = iconSet.resolve(name)
    if (icon) {
      svgs.push([name, icon])
    }
  })

  return svgs as [string, IconifyIcon][]
}

export function generateUniAppTemplate(style: string, exportName: string) {
  const template = `<script>
  export default {
    name: '${exportName}',
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
    data(){
      return {
        style: ${style}
      }
    }
  }
  </script>
  <template>
    <view :style="{ fontSize: size, color: color }">
      <view :style="style"/>
    </view>
  </template>
  `
  return template
}

export function generateStyle(isColors: boolean, uri: string) {
  // const uri = `url("${url}")`
  if (isColors) {
    return {
      background: `${uri} no-repeat`,
      'background-size': '100% 100%',
      'background-color': 'transparent',
      height: '1em',
      width: '1em'
    }
  } else {
    return {
      mask: `${uri} no-repeat`,
      '-webkit-mask': `${uri} no-repeat`,
      'mask-size': '100% 100%',
      '-webkit-mask-size': '100% 100%',
      'background-color': 'currentColor',
      height: '1em',
      width: '1em'
    }
  }
}

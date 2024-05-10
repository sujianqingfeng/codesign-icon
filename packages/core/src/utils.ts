import type { IconsItem, IconsResp, IonsParams, TokenResp } from './types'
import type { IconifyJSON } from '@iconify/types'
import {
  blankIconSet,
  SVG,
  cleanupSVG,
  parseColors,
  runSVGO,
  isEmptyColor
} from '@iconify/tools'

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

    parseColors(svg, {
      defaultColor: 'currentColor',
      callback: (attr, colorStr, color, item) => {
        if (item === 'g') {
          return 'unset'
        }
        return !color || isEmptyColor(color) ? 'currentColor' : colorStr
        // return colorStr === 'none' ? 'currentColor' : colorStr
      }
    })

    runSVGO(svg)

    iconSet.fromSVG(icon.class_name, svg)
  })

  return iconSet.export()
}

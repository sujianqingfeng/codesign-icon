import type { IconsItem, IconsResp, IonsParams, TokenResp } from './types'
import type { IconifyJSON, IconifyIcon } from '@iconify/types'
import {
  blankIconSet,
  SVG,
  cleanupSVG,
  parseColors,
  runSVGO,
  IconSet
} from '@iconify/tools'

import { validateIconSet } from '@iconify/utils'
import { request } from 'undici'

export function generateKey(len: number = 16) {
  const t = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let n = ''
  for (let i = 0; i < len; i++) {
    n += t.charAt(Math.floor(Math.random() * t.length))
  }
  return n
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
    let isResolved = false
    let timer: NodeJS.Timeout | null = null

    const cleanup = () => {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    }

    timer = setInterval(async () => {
      if (isResolved) {
        cleanup()
        return
      }

      i += 1
      try {
        const result = await fn()
        if (result) {
          isResolved = true
          cleanup()
          resolve(result)
          return
        }
      } catch (error) {
        console.error('Error in interval function:', error)
      }

      if (i >= max) {
        cleanup()
        reject('timeout')
      }
    }, interval)

    // Ensure cleanup on unhandled rejection
    process.on('unhandledRejection', cleanup)
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

    const body = svg.getBody()
    if (!isColors(body)) {
      parseColors(svg, {
        defaultColor: 'currentColor',
        callback: () => {
          return 'currentColor'
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
  const re = /(stroke|fill)="([^"]+)"/g
  const temp = []
  let match
  while ((match = re.exec(svg)) !== null) {
    const value = match[2]
    if (temp.indexOf(value) === -1) {
      temp.push(value)
    }
  }
  return temp.filter((item) => !['none'].includes(item)).length > 1
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
    <view @click="$emit('click')" :style="{ fontSize: size, color: color }">
      <view :style="style"/>
    </view>
  </template>
  `
  return template
}

export function generateStyle(isColors: boolean, uri: string) {
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

export async function openInBrowser(url: string) {
  const open = (await import('open')).default
  await open(url)
}

export async function getWeworkLoginToken() {
  const headers = {
    accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'accept-language': 'en,zh-CN;q=0.9,zh;q=0.8',
    'cache-control': 'no-cache',
    pragma: 'no-cache',
    'sec-ch-ua':
      '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'same-site',
    'user-agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    cookie: 'wwrtx.i18n_lan=en; ww_lang=en,cn,zh',
    referer: 'https://codesign.qq.com/',
    origin: 'https://codesign.qq.com',
    'upgrade-insecure-requests': '1'
  }

  const {
    statusCode,
    body,
    headers: responseHeaders
  } = await request(
    'https://open.work.weixin.qq.com/wwopen/sso/3rd_qrConnect?appid=ww7a6a2fcbc9ee24ff&redirect_uri=https%3A%2F%2Fcodesign.qq.com%2Foauth%2Fcompanies%2Fwework%2Fcallback&usertype=member&lang=zh',
    {
      headers
    }
  )

  if (statusCode !== 200) {
    throw new Error('Failed to get QR code page')
  }

  // Update cookies from response
  const cookies = responseHeaders['set-cookie']
  if (cookies) {
    const newCookies = Array.isArray(cookies) ? cookies : [cookies]
    const cookieStr = newCookies
      .map((cookie) => cookie.split(';')[0])
      .join('; ')
    headers.cookie = cookieStr
  }

  const html = await body.text()
  // Try to parse the settings object from the HTML
  const settingsMatch = html.match(/window\.settings\s*=\s*({[\s\S]+?});/)
  if (!settingsMatch) {
    throw new Error('Failed to find settings in HTML')
  }

  try {
    // Clean up the settings string by removing newlines and normalizing spaces
    const settingsStr = settingsMatch[1].replace(/\n/g, '').replace(/\s+/g, ' ')
    const settings = JSON.parse(settingsStr)
    console.log('🚀 ~ getWeworkLoginToken ~ settings:', settings)
    if (settings.errCode) {
      throw new Error(`WeWork error: ${settings.errMsg}`)
    }
    const key = settings.key
    if (!key) {
      throw new Error('Failed to get key from settings')
    }

    const qrUrl = `https:${settings.qrUrl}`
    await openInBrowser(qrUrl)
    console.log('Please scan the QR code in your browser to login')

    const result = await createMaxIntervalFn<string | null>({
      fn: async () => {
        const { statusCode, body } = await request(
          `https://open.work.weixin.qq.com/wwopen/sso/l/qrConnect?callback=jsonpCallback&key=${key}&redirect_uri=https%3A%2F%2Fcodesign.qq.com%2Foauth%2Fcompanies%2Fwework%2Fcallback&appid=ww7a6a2fcbc9ee24ff&_=${Date.now()}`,
          {
            headers: {
              ...headers,
              referer: 'https://open.work.weixin.qq.com/',
              origin: 'https://open.work.weixin.qq.com'
            }
          }
        )

        if (statusCode !== 200) {
          return null
        }

        const text = await body.text()
        // Parse JSONP response
        const match = text.match(/^jsonpCallback\((.*)\)$/)
        if (!match) {
          return null
        }
        const json = JSON.parse(match[1])
        console.log('🚀 ~ fn: ~ json:', json)

        if (json.status === 'QRCODE_SCAN_SUCC') {
          const { auth_code } = json
          const { headers: redirectHeaders } = await request(
            `https://codesign.qq.com/oauth/companies/wework/callback?auth_code=${auth_code}&appid=ww7a6a2fcbc9ee24ff`,
            {
              headers: {
                ...headers,
                referer: 'https://open.work.weixin.qq.com/',
                origin: 'https://open.work.weixin.qq.com'
              },
              maxRedirections: 0,
              throwOnError: false
            }
          )

          const cookies = redirectHeaders['set-cookie']
          if (!cookies?.length) {
            return null
          }

          const accessTokenCookie = Array.isArray(cookies)
            ? cookies.find((cookie) => cookie.startsWith('access_token='))
            : cookies
                .split(',')
                .find((cookie) => cookie.startsWith('access_token='))

          if (!accessTokenCookie) {
            return null
          }

          const token = accessTokenCookie.split(';')[0].split('=')[1]
          return token
        }

        return null
      },
      interval: 2000,
      max: 30
    })

    return result
  } catch (error) {
    console.error('Error parsing settings:', error)
    throw error
  }
}

export async function fetchIconsInfo({
  projectId,
  token
}: {
  projectId: string
  token: string
}) {
  const url = `https://codesign.qq.com/api/icon-projects/${projectId}?include=icons`

  const { statusCode, body } = await request(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  if (statusCode !== 200) {
    return
  }
  const data = await body.json()

  return data
}

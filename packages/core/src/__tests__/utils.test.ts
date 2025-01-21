import type { IconsItem } from '../types'
import { promises as fs } from 'fs'
import { describe, test, expect } from 'vitest'
import {
  covertValidName,
  createMaxIntervalFn,
  fetchCodesignIcons,
  fetchToken,
  generateKey,
  isColors,
  parseIcons,
  toCamelCase,
  getWeworkLoginToken
} from '../utils'

describe('utils', () => {
  test('generateKey', () => {
    const key = generateKey()
    expect(key.length).toBe(16)
  })

  test.skip('parseIcons', () => {
    const icons: IconsItem[] = [
      {
        name: 'backtop',
        svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="design-iconfont">\n  <path fill-rule="evenodd" clip-rule="evenodd" d="M5.1 21.6243C4.76863 21.6243 4.5 21.3556 4.5 21.0243V19.6841C4.5 19.3527 4.76863 19.0841 5.1 19.0841H18.9C19.2314 19.0841 19.5 19.3527 19.5 19.6841V21.0243C19.5 21.3556 19.2314 21.6243 18.9 21.6243H5.1ZM11.5774 17.177C11.8096 17.442 12.1903 17.442 12.4226 17.177L19.3753 9.22663C19.6076 8.96162 19.506 8.74399 19.1482 8.74399H16.5489C16.1909 8.74399 15.8989 8.45791 15.8989 8.10714V3.01251C15.8989 2.66182 15.6072 2.37573 15.2492 2.37573H8.75088C8.393 2.37573 8.10102 2.66179 8.10102 3.01251V8.10716C8.10102 8.45791 7.80913 8.74401 7.45129 8.74401H4.85196C4.49398 8.74401 4.39242 8.96162 4.62465 9.22665L11.5774 17.177Z" fill="#231815"></path>\n</svg>',
        class_name: 'backtop'
      }
    ]
    const data = parseIcons(icons, {
      prefix: 'base'
    })

    expect(data).toMatchInlineSnapshot(`
      {
        "icons": {
          "backtop": {
            "body": "<path fill="currentColor" fill-rule="evenodd" d="M5.1 21.624a.6.6 0 01-.6-.6v-1.34a.6.6 0 01.6-.6h13.8a.6.6 0 01.6.6v1.34a.6.6 0 01-.6.6zm6.477-4.447a.55.55 0 00.846 0l6.952-7.95c.233-.265.131-.483-.227-.483h-2.6a.645.645 0 01-.65-.637V3.013a.645.645 0 00-.649-.637H8.751a.645.645 0 00-.65.637v5.094c0 .35-.292.637-.65.637H4.852c-.358 0-.46.218-.227.483z" clip-rule="evenodd"/>",
            "height": 24,
            "width": 24,
          },
        },
        "lastModified": 1715568888,
        "prefix": "base",
      }
    `)
  })

  test.skip('save file', async () => {
    const text = await fs.readFile('icons.json', 'utf8')
    const icons = JSON.parse(text)
    const data = parseIcons(icons, {
      prefix: 'base'
    })
    const exported = `${JSON.stringify(data, null, '\t')}\n`
    await fs.writeFile(`base.json`, exported, 'utf8')
  })

  test.skip('transform', async () => {
    const text = await fs.readFile('icons.json', 'utf8')
    const icons = JSON.parse(text)
    const d = icons.map((item) => ({
      name: item.name,
      svg: item.svg,
      class_name: item.class_name
    }))
    const exported = `${JSON.stringify(d, null, '\t')}\n`
    await fs.writeFile(`icons.json`, exported, 'utf8')
  })

  test.skip(
    'download icon json',
    async () => {
      const key = generateKey()
      console.log('key:', key)

      const token = (await createMaxIntervalFn<string | null>({
        fn: async () => {
          console.log('fetching token...')
          return fetchToken(key)
        }
      })) as string

      console.log('token:', token)

      const icons = await fetchCodesignIcons({
        project_id: 'lnGaV96la6ZPqwd',
        team_id: 'qxWyZ1ybLDZmVXk',
        include: 'creator',
        per_page: 500,
        page: 1,
        Authorization: `Bearer ${token}`
      })

      const exported = `${JSON.stringify(icons.data, null, '\t')}\n`
      await fs.writeFile(`icons.json`, exported, 'utf8')
    },
    { timeout: 200000 }
  )

  test.skip('isColors', () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="design-iconfont">\n  <path fill-rule="evenodd" clip-rule="evenodd" d="M5.1 21.6243C4.76863 21.6243 4.5 21.3556 4.5 21.0243V19.6841C4.5 19.3527 4.76863 19.0841 5.1 19.0841H18.9C19.2314 19.0841 19.5 19.3527 19.5 19.6841V21.0243C19.5 21.3556 19.2314 21.6243 18.9 21.6243H5.1ZM11.5774 17.177C11.8096 17.442 12.1903 17.442 12.4226 17.177L19.3753 9.22663C19.6076 8.96162 19.506 8.74399 19.1482 8.74399H16.5489C16.1909 8.74399 15.8989 8.45791 15.8989 8.10714V3.01251C15.8989 2.66182 15.6072 2.37573 15.2492 2.37573H8.75088C8.393 2.37573 8.10102 2.66179 8.10102 3.01251V8.10716C8.10102 8.45791 7.80913 8.74401 7.45129 8.74401H4.85196C4.49398 8.74401 4.39242 8.96162 4.62465 9.22665L11.5774 17.177Z" fill="#231815"></path>\n</svg>`
    expect(isColors(svg)).toBeFalsy()
  })

  test('covertValidName', () => {
    expect(covertValidName('uni-more')).toEqual('uni-more')
    expect(covertValidName('Uni-More')).toEqual('uni-more')
    expect(covertValidName('Uni_More')).toEqual('uni-more')
    expect(covertValidName('Uni_More_hello')).toEqual('uni-more-hello')
  })

  test('toCamelCase', () => {
    expect(toCamelCase('uni-more-hello')).toEqual('UniMoreHello')
  })

  test(
    'getWeworkLoginToken',
    async () => {
      const token = await getWeworkLoginToken()
      expect(token).toBeTruthy()
      // Return immediately after getting token
      return
    },
    { timeout: 60000 }
  )
})

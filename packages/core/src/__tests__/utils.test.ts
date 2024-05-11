import type { IconsItem } from '../types'
import { promises as fs } from 'fs'
import { describe, test, expect } from 'vitest'
import {
  covertValidName,
  createMaxIntervalFn,
  fetchCodesignIcons,
  fetchToken,
  generateKey,
  generateQrCode,
  isColors,
  parseIcons,
  encodeSvg,
  toCamelCase
} from '../utils'

describe('utils', () => {
  test('generateKey', () => {
    const key = generateKey()
    expect(key.length).toBe(16)
  })

  test.skip('parseIcons', () => {
    const icons: IconsItem[] = [
      // {
      //   name: 'uni-more',
      //   svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 24" class="1p6ls6n49__design-iconfont">\n  <path d="M3.10449 10.1208H6.86281V13.8792H3.10449V10.1208ZM10.6211 10.1208H14.3794V13.8792H10.6211V10.1208ZM21.8961 10.1208H18.1378V13.8792H21.8961V10.1208Z"></path>\n</svg>',
      //   class_name: 'uni-more'
      // },
    ]
    const data = parseIcons(icons, {
      prefix: 'base'
    })

    expect(data).toMatchInlineSnapshot()
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

  test('isColors', () => {
    const svg =
      '<path fill="#C1C6D6" d="M101.313 15.216a.79.79 0 01-1.008-.47l-1.942-5.214a.79.79 0 01.306-1.065.8.8 0 011.008.461l1.942 5.215c.212.38.075.86-.306 1.072"/><path fill="#8E97B1" d="M98.258 9.979a2.67 2.67 0 002'
    expect(isColors(svg)).toBeTruthy()
  })

  test('encodeSvg', () => {
    const svg =
      '<path fill="currentColor" fill-rule="evenodd" d="M10.16 11.523a4.599 4.599 0 100-9.198 4.599 4.599 0 000 9.198M1.885 18.42a5.517 5.517 0 015.518-5.518h5.518a5.517 5.517 0 015.517 5.518v2.334a.92.92 0 01-.92.92H2.805a.92.92 0 01-.92-.92z" clip-rule="evenodd"/><path fill="currentColor" d="M21.656 9.224h-4.598a.46.46 0 00-.46.46v.919a.46.46 0 00.46.46h4.598a.46.46 0 00.46-.46v-.92a.46.46 0 00-.46-.46m0 3.678h-1.84a.46.46 0 00-.459.46v.92a.46.46 0 00.46.46h1.84a.46.46 0 00.459-.46v-.92a.46.46 0 00-.46-.46"/>'

    const base64 = encodeSvg(svg)
    expect(base64).toMatchInlineSnapshot(
      `"data:image/svg+xml;base64,%3Cpath fill='currentColor' fill-rule='evenodd' d='M10.16 11.523a4.599 4.599 0 100-9.198 4.599 4.599 0 000 9.198M1.885 18.42a5.517 5.517 0 015.518-5.518h5.518a5.517 5.517 0 015.517 5.518v2.334a.92.92 0 01-.92.92H2.805a.92.92 0 01-.92-.92z' clip-rule='evenodd'/%3E%3Cpath fill='currentColor' d='M21.656 9.224h-4.598a.46.46 0 00-.46.46v.919a.46.46 0 00.46.46h4.598a.46.46 0 00.46-.46v-.92a.46.46 0 00-.46-.46m0 3.678h-1.84a.46.46 0 00-.459.46v.92a.46.46 0 00.46.46h1.84a.46.46 0 00.459-.46v-.92a.46.46 0 00-.46-.46'/%3E"`
    )
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
})

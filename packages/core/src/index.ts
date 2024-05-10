import type { BuildOptions } from './types'
import { promises as fs } from 'fs'
import {
  createMaxIntervalFn,
  fetchCodesignIcons,
  fetchToken,
  generateKey,
  generateQrCode,
  parseIcons
} from './utils'

export async function build(options: BuildOptions) {
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

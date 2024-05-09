import {
  createMaxIntervalFn,
  fetchCodesignIcons,
  fetchToken,
  generateKey,
  generateQrCode
} from './utils'

export async function start() {
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

  if (!icons) {
    return
  }

  console.log('🚀 ~ start ~ icons:', icons)
}

start()

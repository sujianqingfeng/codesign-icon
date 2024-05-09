import { request } from 'undici'

export async function fetchCodesignIcons() {
  const { statusCode, headers, trailers, body } = await request(
    'http://localhost:3000/foo'
  )
  console.log('statusCode:', statusCode)
}

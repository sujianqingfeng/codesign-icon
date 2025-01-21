import { promises as fs } from 'fs'
import {
  fetchCodesignToken,
  fetchCodesignIconsByToken,
  buildIconifyJSON,
  buildUniAppIcons
} from '@sujian/codesign-icon-core'

async function build() {
  const prefix = 'base'
  const dist = 'output/'

  const teamId = '104180'
  const projectId = '9069'

  // const token = await fetchCodesignToken()
  const token =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIyIiwianRpIjoiZjY4ZjQ2Y2ZiNDlmMzhkNWM1NWZkMjRlNjVhYWZlYzlhZWE1ZDgzMjU4ZGJiZjgzMDIxZmE4ODM0ZDg0Yjc4MDVkMzhkNDcxZDllNWMzZWUiLCJpYXQiOjE3MzczNjkwNzMuOTgwMDI4LCJuYmYiOjE3MzczNjkwNzMuOTgwMDI5LCJleHAiOjE3Mzk4OTQ0MDAuMDE4MDYyLCJzdWIiOiIzNTI3MTIiLCJzY29wZXMiOlsiKiJdfQ.KU6Vskn6fSbfa_epXpinGBVco1H8hpmHg5eYZdtPTtaWmliKKBd2ln7qg7Skejb3GJNbdegfnfo9kvLm3SfmK4MspF-rlW0lJzb6l1CdNHsUQWE65W6EDJCVx0v6B7fYRBRG6knKNqo56ssAdCYoMVEDBcaAVbFQXjLSJOSMkNFNCUyuAcc9ue4dQWeM0brfs3TR07OZ5vPRo6iWh-C8BRdNcj4qWa32EkE02uItet8UqVuOascezdCM5RrGrGd6y7i8SLK37YJL3SiO02H1vNEnzwzTrS9FTWQlilFVyc7wca-cr6ZoBo0msh7Xn_nHukIx1-u3QZtN2go4-xd5eu4jKhdj8XqZ6hwmjXdYRA6oK4w-zlJNwfh1RlO_jlytg4UBLdXGCHY1yAbudQXoRR2i8j47JM20YRbprG4YfJUhZJz4lGFJBbj7jPLE7d5WHQWpwiIJ4Vynr9VMNaXIaFYt-W_GcrhsUw5DMoyqNj3f45di_9PO2KIFI2kHK13L-anf2qEaEzLx8SmEhlpEX3zJE8hkgpo-l7cyz0NKGolhAeDueM5FY4tFpWxCL3T6v4pcfag9BWVVrvNvKQJWxgqygum9_3KAigzuj49aAopOnNWcX_YkBgm-c3GXIBy9tZDj8Ads4GVhNSHaQmaMufdB191wOvbzjhIkVFSlZZQ'
  console.log('🚀 ~ build ~ token:', token)

  const icons = await fetchCodesignIconsByToken({
    token,
    teamId,
    projectId
  })

  const rawData = await buildIconifyJSON({
    icons,
    prefix,
    dist
  })

  const exported = `${JSON.stringify(rawData, null, '\t')}\n`
  await fs.writeFile(`${dist}${prefix}.json`, exported, 'utf8')
  console.log('🚀 write iconify completed!')

  // const text = await fs.readFile(`${dist}${prefix}.json`, 'utf8')
  // const rawData = JSON.parse(text)

  buildUniAppIcons({
    rawData,
    dist: 'uniapp/',
    exportPrefix: 'I'
  })
  console.log('🚀 build uniapp icons completed!')
}

build()

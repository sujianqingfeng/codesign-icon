import { promises as fs } from 'fs'
import {
  fetchCodesignIconsByToken,
  buildIconifyJSON,
  buildUniAppIcons,
  getWeworkLoginToken
} from '@sujian/codesign-icon-core'

async function build() {
  const prefix = 'base'
  const dist = 'output/'

  const teamId = '104180'
  const projectId = '9069'

  const token = await getWeworkLoginToken()
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

  await fs.readFile(`${dist}${prefix}.json`, 'utf8')
  // const rawData = JSON.parse(text)

  await buildUniAppIcons({
    rawData,
    dist: 'uniapp/',
    exportPrefix: 'I'
  })
  console.log('🚀 build uniapp icons completed!')
}

build()

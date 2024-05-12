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

  // const teamId = 'qxWyZ1ybLDZmVXk'
  // const projectId = 'lnGaV96la6ZPqwd'

  // const token = await fetchCodesignToken()
  // console.log('🚀 ~ build ~ token:', token)
  // const icons = await fetchCodesignIconsByToken({
  //   token,
  //   teamId,
  //   projectId
  // })

  // const rawData = await buildIconifyJSON({
  //   icons,
  //   prefix,
  //   dist
  // })

  // const exported = `${JSON.stringify(rawData, null, '\t')}\n`
  // await fs.writeFile(`${dist}${prefix}.json`, exported, 'utf8')
  // console.log('write completed!')

  const text = await fs.readFile(`${dist}${prefix}.json`, 'utf8')
  const rawData = JSON.parse(text)
  buildUniAppIcons({
    rawData,
    dist: 'uniapp/',
    exportPrefix: 'I'
  })
}

build()

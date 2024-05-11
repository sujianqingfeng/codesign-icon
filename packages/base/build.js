import { promises as fs } from 'fs'
import { buildIconifyJSON, buildUniAppIcons } from '@sujian/codesign-icon-core'

async function build() {
  const prefix = 'base'
  const dist = 'output/'

  // await buildIconifyJSON({
  //   projectId: 'lnGaV96la6ZPqwd',
  //   teamId: 'qxWyZ1ybLDZmVXk',
  //   prefix,
  //   dist
  // })

  const text = await fs.readFile(`${dist}${prefix}.json`, 'utf8')
  const rawData = JSON.parse(text)
  buildUniAppIcons({
    rawData,
    dist: 'uniapp/',
    exportPrefix: 'I'
  })
}

build()

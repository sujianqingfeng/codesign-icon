import type { IconifyJSON } from '@iconify/types'

export type TokenResp = { result: null | { token: string } }

export type IonsParams = {
  project_id: string
  team_id: string
  include: string
  per_page: number
  page: number
}

export type BaseListResp<T> = {
  current_page: number
  next_page_url: null | string
  to: number
  data: T[]
}

export type IconsItem = {
  svg: string
  name: string
  class_name: string
}

export type IconsResp = BaseListResp<IconsItem>

export type BuildIconifyJSONOptions = {
  prefix: string
  projectId: string
  teamId: string
  dist?: string
}

export type BuildUniAppIconsOptions = {
  rawData: IconifyJSON
  dist: string
}

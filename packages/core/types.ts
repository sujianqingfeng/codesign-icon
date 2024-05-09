export type TokenResp = { result: null | { token: string } }

export type IonsParams = {
  project_id: string
  team_id: string
  include: 'creator'
  per_page: number
  page: number
}

export type BaseListResp<T> = {
  current_page: number
  next_page_url: null | string
  to: number
  data: T[]
}

export type IconsResp = BaseListResp<{
  svg: string
  name: string
  class_name: string
}>

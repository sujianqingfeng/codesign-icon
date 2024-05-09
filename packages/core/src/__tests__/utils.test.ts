import { describe, test, expect } from 'vitest'
import { fetchCodesignIcons, generateKey } from '../utils'

describe('utils', () => {
  test.skip('test', () => {
    fetchCodesignIcons()
  })

  test.skip('generateKey', () => {
    const key = generateKey()
    expect(key.length).toBe(16)
  })
})

import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  clean: true,
  dts: true,
  treeshake: true,
  format: ['cjs', 'esm']
})

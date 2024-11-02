import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: { all: false, provider: 'v8' },
    exclude: [...configDefaults.exclude, 'examples/**/*']
  }
})

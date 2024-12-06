import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      all: true,
      exclude: ['examples/**/*', 'test/**/*', '**/*config*', '**/*.d.ts'],
      provider: 'v8'
    },
    exclude: [...configDefaults.exclude, 'examples/**/*']
  }
})

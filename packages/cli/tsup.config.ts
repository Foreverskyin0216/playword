import { defineConfig } from 'tsup'

export default defineConfig({
  clean: true,
  entry: ['src/index.js'],
  format: ['cjs', 'esm'],
  minify: true,
  sourcemap: true,
  splitting: false
})

import { defineConfig } from 'tsup'

export default defineConfig([
  {
    clean: true,
    entry: ['src/index.js'],
    format: 'cjs',
    minify: true,
    splitting: false,
    target: 'es2015'
  },
  {
    clean: true,
    entry: ['src/index.js'],
    format: 'esm',
    minify: true,
    splitting: true,
    target: 'esnext'
  }
])

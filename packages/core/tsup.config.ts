import { defineConfig } from 'tsup'

export default defineConfig([
  {
    clean: true,
    dts: true,
    entry: ['src/index.ts'],
    format: 'cjs',
    minify: true,
    splitting: false,
    target: 'es2015'
  },
  {
    clean: true,
    dts: true,
    entry: ['src/index.ts'],
    format: 'esm',
    minify: true,
    splitting: true,
    target: 'esnext'
  }
])

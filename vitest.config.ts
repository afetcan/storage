import path from 'node:path'
import { defineConfig } from 'vitest/config'

const alias = (p: string) => path.resolve(__dirname, p)

export default defineConfig({
  optimizeDeps: {
    entries: [],
  },
  test: {
    coverage: {
      provider: 'c8', // or 'c8',
      reporter: ['text', 'json-summary', 'json', 'html'],
    },
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
    ],
    include: [
      './test/**',
    ],
    testTimeout: 90000,
    maxConcurrency: 1,
    threads: false,
  },
  resolve: {
    alias: {
      '@acildeprem/storage': alias('./src/'),
    },
  },
})

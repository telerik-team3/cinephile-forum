// Settings for "npm run test:security": the tests in security/ that sign in to
// the real Supabase database with the test accounts from .env.local.
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['security/**/*.test.js'],
    env: loadEnv('test', process.cwd(), ''),
    testTimeout: 15000,
    fileParallelism: false,
  },
})

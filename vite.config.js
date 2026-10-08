import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // security/ talks to the real database and needs passwords from .env.local,
    // so it runs only through "npm run test:security".
    exclude: [...configDefaults.exclude, 'security/**'],
  },
})


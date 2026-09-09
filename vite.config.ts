/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setupStorage.ts', './src/test/setup.ts'],
    css: true,
    env: { VITE_API_BASE_URL: 'http://localhost:3000' },
  },
})

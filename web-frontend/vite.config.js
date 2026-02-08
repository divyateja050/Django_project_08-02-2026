import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'chrome87', // Match PyQt5's Chromium version roughly
    outDir: 'dist',
  },
  server: {
    host: true, // Listen on all addresses
  }
})

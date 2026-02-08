import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    // Modern browser target (works with Electron and modern browsers)
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false
  },
  server: {
    host: true, // Listen on all addresses (0.0.0.0)
    port: 5173,
    strictPort: false,
    open: false
  }
})

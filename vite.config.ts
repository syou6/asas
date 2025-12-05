import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,
    allowedHosts: ['.local'],
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      'postcss/lib/postcss.mjs': 'postcss/lib/postcss.js',
      'audio-loader': '/src/shims/audio-loader.ts'
    }
  }
})

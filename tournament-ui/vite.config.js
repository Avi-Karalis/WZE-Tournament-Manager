import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './', // important for Electron to find assets locally
  build: {
    outDir: 'dist'
  }
})

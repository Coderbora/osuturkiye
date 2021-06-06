import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  root: resolve(__dirname, "src", "client"),
  build: {
      outDir: resolve(__dirname, "build", "client"),
      sourcemap: true
  },
  server: {
      proxy: {
          '/api': 'http://localhost:5000'
      }
  }
})

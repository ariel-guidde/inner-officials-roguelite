import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@core': '/src/core',
      '@modules': '/src/modules',
      '@assets': '/src/assets',
      '@lib': '/src/lib',
    },
  },
})

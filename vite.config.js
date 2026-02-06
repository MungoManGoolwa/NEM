import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/aemo': {
        target: 'https://visualisations.aemo.com.au',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/aemo/, '/aemo/apps/api/report'),
      },
    },
  },
})

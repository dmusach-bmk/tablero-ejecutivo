import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    strictPort: true,
    proxy: {
      '/api/notion': {
        target: 'https://api.notion.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/notion/, ''),
        headers: {
          'Notion-Version': '2022-06-28',
        }
      },
      '/api/fathom': {
        target: 'https://api.fathom.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fathom/, ''),
        secure: true
      }
    }
  }
})

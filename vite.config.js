import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    watch: {
      ignored: [
        '**/server/settings.yml',
        '**/settings.yml',
        // チャット履歴などバックエンドが更新する永続データをViteが監視すると、
        // 回答保存のたびに開発画面がフルリロードされてしまう。
        '**/server/db/**',
        '**/server/token_store.json',
      ],
    },
    proxy: {
      '/api': 'http://localhost:4567',
      '/authorize': 'http://localhost:4567',
      '/auth': 'http://localhost:4567',
      '/programs': 'http://localhost:4567',
      '/create_program': 'http://localhost:4567',
      '/update_program': 'http://localhost:4567',
      '/delete_program': 'http://localhost:4567',
      '/get_library': 'http://localhost:4567',
      '/create_library': 'http://localhost:4567',
      '/delete_library': 'http://localhost:4567',
      '/writable': 'http://localhost:4567',
      '/gemini-completion': 'http://localhost:4567',
      '/gemini-ask': 'http://localhost:4567',
      '/chat-history': 'http://localhost:4567',
      '/chat-sessions': 'http://localhost:4567',
    }
  }
})

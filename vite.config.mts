import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePluginNode } from 'vite-plugin-node'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ...VitePluginNode({
      adapter: 'express',
      appPath: './server/server.ts',
      exportName: 'app',
    }),
  ],
  build: {
    outDir: 'dist/client'
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
      }
    }
  }
})

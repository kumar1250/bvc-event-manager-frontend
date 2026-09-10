import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// The `@/*` alias mirrors tsconfig.app.json's `paths` entry
// ("@/*": ["./src/*"]). Vite has no built-in option that reads tsconfig
// `paths` automatically, so it's declared explicitly here via resolve.alias.
// `import.meta.dirname` (not `__dirname`) is used for compatibility with
// Vite's native config loader (requires Node 20.11+/22+).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    chunkSizeWarningLimit: 900,
  },
})

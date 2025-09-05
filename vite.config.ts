import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Kid-app/',             // IMPORTANT for GitHub Pages project sites
  server: { host: true, port: 5173, strictPort: true },
  preview: { host: true, port: 4173 }
})
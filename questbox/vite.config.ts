
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // FIX: `__dirname` is not available in ES modules.
      // We use `import.meta.url` to get the current file's URL and derive the directory path from it.
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
})

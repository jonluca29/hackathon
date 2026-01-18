import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 1. PharmaTrace (FastAPI) on 8001
      '/pharma': {
        target: 'http://localhost:8001',
        changeOrigin: true
      },
      // 2. PharmaCluster (Node/Express) on 8000
      // Don't rewrite - keep the full path
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
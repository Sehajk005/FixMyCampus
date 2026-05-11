import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
  },
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://localhost:5000',
      '/tickets': 'http://localhost:5000',
      '/api': 'http://localhost:5000',
    },
  },
});

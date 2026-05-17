import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.config.*',
        '**/tests/**',
        'src/main.jsx',        // entry point — not worth covering
      ],
    },
  },

  server: {
    port: 5173,
    proxy: {
      '/auth':    'http://localhost:5000',
      '/tickets': 'http://localhost:5000',
      '/api':     'http://localhost:5000',
    },
  },
});
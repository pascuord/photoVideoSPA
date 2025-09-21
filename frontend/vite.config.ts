/// <reference types="vitest" />

import { defineConfig } from 'vite';
import analog from '@analogjs/platform';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    target: ['es2020'],
  },
  // 🔧 CAMBIO: usar entradas de navegador primero
  resolve: {
    mainFields: ['browser', 'module', 'main'],
  },
  plugins: [
    analog(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/backend': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/backend/, '/api'),
      },
    },
  },
  // 🔧 CAMBIO: asegurar 'global'
  optimizeDeps: {
    esbuildOptions: {
      define: { global: 'globalThis' },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['**/*.spec.ts'],
    reporters: ['default'],
  },
   // 🔧 CAMBIO: define para runtime
  define: {
    global: 'globalThis',
    'process.env': {},                 // evita fallos con process.env
    'import.meta.vitest': mode !== 'production',
  },
}));

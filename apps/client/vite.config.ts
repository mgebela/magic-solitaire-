import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@three-towers/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@three-towers/game-engine': path.resolve(__dirname, '../../apps/game-engine/src'),
    },
  },
  build: {
    // Pixi dynamically imports WebGL/WebGPU renderer chunks; a single bundle
    // avoids stale-index.html 404s on Netlify after deploys.
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
  base: '/',

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-charts': ['recharts'],
          'vendor-icons': ['lucide-react'],
        }
      }
    }
  },

  server: {
    port: 3000,
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: {
      ignored: ['**/data/**', '**/uploads/**', '**/*.sqlite', '**/*.sqlite-wal', '**/*.sqlite-shm'],
    },
  },
  preview: {
    port: 3000
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'src/entrypoints/desktop',
  base: './',
  build: {
    outDir: '../../../dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: 'esbuild',
    target: 'esnext',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/entrypoints/desktop/index.html'),
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    host: 'localhost',
  },
  css: {
    postcss: './postcss.config.js',
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
});

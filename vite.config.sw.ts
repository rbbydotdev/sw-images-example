import { defineConfig } from 'vite';

// Vite config for building the service worker
export default defineConfig({
  build: {
    lib: {
      entry: 'src/sw.ts',
      name: 'ServiceWorker',
      formats: ['iife'],
      fileName: () => 'sw.js',
    },
    outDir: 'public',
    emptyOutDir: false,
    rollupOptions: {
      output: {
        entryFileNames: 'sw.js',
      },
    },
  },
});

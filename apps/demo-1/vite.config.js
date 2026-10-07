import { defineConfig } from 'vite';

export default defineConfig({
  base: '/demo-1/',
  server: {
    port: 3000,
    open: true
  },
  build: {
    target: 'esnext',
    outDir: '../../docs/demo-1'
  }
});

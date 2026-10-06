import { defineConfig } from 'vite';

export default defineConfig({
  base: '/tech-demos/demo-1/',
  server: {
    port: 3000,
    open: true
  },
  build: {
    target: 'esnext',
    outDir: '../../dist/demo-1'
  }
});

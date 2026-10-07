import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/tech-demos/demo-3/',
  build: {
    outDir: '../../docs/demo-3',
    emptyOutDir: true
  }
});

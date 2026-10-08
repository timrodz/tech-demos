import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/demo-4/',
  build: {
    outDir: '../../docs/demo-4',
    emptyOutDir: true
  }
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/demo-5/',
  build: {
    outDir: '../../docs/demo-5',
    emptyOutDir: true
  }
});

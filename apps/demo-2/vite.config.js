import { defineConfig } from 'vite';

export default defineConfig({
  base: '/tech-demos/demo-2/',
  build: {
    outDir: '../../docs/demo-2',
    emptyOutDir: true
  },
  assetsInclude: ['**/*.wgsl'],
  plugins: [
    {
      name: 'wgsl-loader',
      transform(code, id) {
        if (id.endsWith('.wgsl')) {
          return {
            code: `export default ${JSON.stringify(code)};`,
            map: null
          };
        }
      }
    }
  ]
});

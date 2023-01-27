import path from 'path';
import { defineConfig } from 'vite';
import typescript from '@rollup/plugin-typescript';

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.tsx'),
      name: 'react-boundaries',
      fileName: (format: string) => `react-boundaries.${format}.js`,
    },
    rollupOptions: {
      plugins: [typescript({ tsconfig: './tsconfig.json' })],
    },
  },
});

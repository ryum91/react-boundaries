import path from 'path';
import { defineConfig } from 'vite';
import react from "@vitejs/plugin-react";
import typescript from '@rollup/plugin-typescript';

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.tsx'),
      name: 'react-boundaries',
      fileName: (format: string) => `react-boundaries.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        "globals": {
          "react": "react",
          "react-dom": "react-dom"
        }
      },
      plugins: [react(), typescript({ tsconfig: './tsconfig.json' })],
    },
  },
});

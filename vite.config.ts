import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import terser from '@rollup/plugin-terser';
import license from 'rollup-plugin-license';
import react from '@vitejs/plugin-react';

export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        react: resolve(__dirname, 'src/react.ts')
      },
      formats: ['es']
    },
    rollupOptions: {
      external: ['react'],
      output: {
        entryFileNames: '[name].js',
        exports: 'auto',
        plugins: [
          license({
            banner: '@license\nCopyright 2025 KNOWLEDGECODE\nSPDX-License-Identifier: MIT'
          }),
          terser()
        ]
      }
    }
  },
  plugins: [
    react(),
    dts({
      include: ['src/**/*']
    })
  ]
});

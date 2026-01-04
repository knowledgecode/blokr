import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import terser from '@rollup/plugin-terser';
import license from 'rollup-plugin-license';

export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: 'src/index.ts',
      name: 'blokr',
      formats: ['es', 'umd'],
      fileName: format => format === 'es' ? 'index.js' : 'blokr.js',
    },
    rollupOptions: {
      output: {
        exports: 'default',
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
    dts({
      include: ['src/**/*']
    })
  ]
});

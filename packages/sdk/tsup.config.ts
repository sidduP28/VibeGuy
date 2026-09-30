import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['iife'],
  globalName: 'VibeSdk',
  minify: true,
  dts: false,
  clean: true,
  target: 'es2020',
  outExtension() {
    return { js: '.global.js' };
  },
});

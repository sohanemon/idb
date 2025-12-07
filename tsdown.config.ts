import { defineConfig } from 'tsdown';

export default defineConfig({
  platform: 'browser',
  dts: true,
  minify: true,
  exports: true,
  skipNodeModulesBundle: true,
  treeshake: true,
  entry: ['./src/index.ts'],
});

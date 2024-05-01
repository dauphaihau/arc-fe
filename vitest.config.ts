import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import type { InlineConfig } from 'vitest';
import type { UserConfig } from 'vite';

type ViteConfig = UserConfig & { test: InlineConfig };

const config: ViteConfig = {
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
  resolve: {
    alias: [
      { find: '@test', replacement: resolve(__dirname, './tests') },
    ],
  },
};
export default defineConfig(config);

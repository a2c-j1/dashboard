/// <reference types="vitest/config" />

import stylex from '@stylexjs/unplugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const stylexStylesheet = {
  name: 'stylex-stylesheet',
  transformIndexHtml: {
    order: 'post' as const,
    handler(_html: string, context: { server?: unknown }) {
      return [
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: context.server ? '/virtual:stylex.css' : '/assets/stylex.css',
          },
          injectTo: 'head' as const,
        },
      ];
    },
  },
};

export default defineConfig({
  plugins: [stylex.vite(), react(), stylexStylesheet],
  server: { proxy: { '/api': 'http://127.0.0.1:8787' } },
  test: { environment: 'jsdom', setupFiles: './src/test-setup.ts' },
});

/// <reference types="vitest/config" />

import stylex from '@stylexjs/unplugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';

const httpsEnabled = process.env.HTTPS === '1';
const apiProxyTarget =
  process.env.VITE_API_PROXY_TARGET ?? `${httpsEnabled ? 'https' : 'http'}://127.0.0.1:8787`;
const httpsOptions = httpsEnabled
  ? {
      key: readFileSync('../../.certs/localhost-key.pem'),
      cert: readFileSync('../../.certs/localhost.pem'),
    }
  : undefined;

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
  server: {
    host: '0.0.0.0',
    https: httpsOptions,
    proxy: {
      '/api': httpsEnabled ? { target: apiProxyTarget, secure: false } : apiProxyTarget,
    },
  },
  test: { environment: 'jsdom', setupFiles: './src/test-setup.ts' },
});

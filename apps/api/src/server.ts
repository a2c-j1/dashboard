import { readFileSync } from 'node:fs';
import { createServer as createHttpsServer } from 'node:https';
import { serve } from '@hono/node-server';
import { app } from './app.js';
import { apiConfig } from './config.js';

const tlsKey = process.env.TLS_KEY;
const tlsCert = process.env.TLS_CERT;
const tlsOptions =
  tlsKey && tlsCert ? { key: readFileSync(tlsKey), cert: readFileSync(tlsCert) } : undefined;
const tlsEnabled = Boolean(tlsOptions);

serve(
  tlsEnabled
    ? {
        fetch: app.fetch,
        port: apiConfig.port,
        createServer: createHttpsServer,
        serverOptions: tlsOptions,
      }
    : { fetch: app.fetch, port: apiConfig.port },
  () => {
    console.info(`API listening on ${tlsEnabled ? 'https' : 'http'}://localhost:${apiConfig.port}`);
  },
);

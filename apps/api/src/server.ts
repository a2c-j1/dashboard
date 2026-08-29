import { readFileSync } from 'node:fs';
import { createServer as createHttpsServer } from 'node:https';
import { serve } from '@hono/node-server';
import { app } from './app.js';

const port = Number(process.env.PORT ?? 8787);
const tlsKey = process.env.TLS_KEY;
const tlsCert = process.env.TLS_CERT;
const tlsOptions =
  tlsKey && tlsCert ? { key: readFileSync(tlsKey), cert: readFileSync(tlsCert) } : undefined;
const tlsEnabled = Boolean(tlsOptions);

serve(
  tlsEnabled
    ? {
        fetch: app.fetch,
        port,
        createServer: createHttpsServer,
        serverOptions: tlsOptions,
      }
    : { fetch: app.fetch, port },
  () => {
    console.info(`API listening on ${tlsEnabled ? 'https' : 'http'}://localhost:${port}`);
  },
);

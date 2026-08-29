import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';

const healthResponseSchema = z
  .object({
    status: z.literal('ok').openapi({ example: 'ok' }),
    now: z.string().datetime().openapi({ example: '2026-08-29T12:00:00.000Z' }),
  })
  .openapi('HealthResponse');

const healthRoute = createRoute({
  method: 'get',
  path: '/health',
  responses: {
    200: {
      content: { 'application/json': { schema: healthResponseSchema } },
      description: 'API is available.',
    },
  },
});

export const app = new OpenAPIHono().basePath('/api');

app.openapi(healthRoute, (context) =>
  context.json({ status: 'ok', now: new Date().toISOString() }, 200),
);

app.doc('/doc', {
  openapi: '3.0.0',
  info: { title: 'Dashboard API', version: '0.1.0' },
});

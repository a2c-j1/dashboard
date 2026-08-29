import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const healthResponseSchema = z.object({
  status: z.literal('ok'),
  now: z.string().datetime(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

export const healthResponseJsonSchema = zodToJsonSchema(healthResponseSchema, {
  name: 'HealthResponse',
});

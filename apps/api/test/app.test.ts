import { describe, expect, it } from 'vitest';
import { app } from '../src/app.js';

describe('GET /api/health', () => {
  it('returns a validated health response', async () => {
    const response = await app.request('/api/health');
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ status: 'ok' });
  });
});

describe('GET /api/doc', () => {
  it('publishes the API contract', async () => {
    const response = await app.request('/api/doc');
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ openapi: '3.0.0', paths: { '/api/health': {} } });
  });
});

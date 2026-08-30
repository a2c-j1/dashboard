import { describe, expect, it } from 'vitest';
import { parsePort } from '../src/config.js';

describe('API configuration', () => {
  it('accepts valid ports and falls back for invalid values', () => {
    expect(parsePort('9000')).toBe(9000);
    expect(parsePort('0')).toBe(8787);
    expect(parsePort('not-a-port')).toBe(8787);
    expect(parsePort('65536')).toBe(8787);
  });
});

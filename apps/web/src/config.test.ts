import { describe, expect, it } from 'vitest';
import { defaultLinks, parseLinks } from './config.js';

describe('web app configuration', () => {
  it('accepts a configured list of HTTPS links', () => {
    expect(parseLinks('[{"label":"Docs","href":"https://docs.example.test/"}]')).toEqual([
      { label: 'Docs', href: 'https://docs.example.test/' },
    ]);
  });

  it('uses safe defaults when links are invalid or unsafe', () => {
    expect(parseLinks('[{"label":"Unsafe","href":"javascript:alert(1)"}]')).toEqual(defaultLinks);
    expect(parseLinks('not-json')).toEqual(defaultLinks);
  });
});

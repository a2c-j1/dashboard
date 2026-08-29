import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './App.js';

describe('App', () => {
  afterEach(() => vi.restoreAllMocks());

  it('renders the clock and external footer links', () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ status: 'ok', now: new Date().toISOString() })),
        ),
    );
    render(<App />);
    expect(screen.getByRole('time')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'YouTube' })).toHaveAttribute(
      'href',
      'https://www.youtube.com/',
    );
    expect(screen.getByRole('link', { name: 'X' })).toHaveAttribute('href', 'https://x.com/');
  });
});

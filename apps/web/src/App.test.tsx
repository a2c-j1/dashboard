import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App, linkIconName } from './App.js';

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
    expect(screen.getByRole('link', { name: 'ChatGPT' })).toHaveAttribute(
      'href',
      'https://chatgpt.com/',
    );
    expect(screen.getByRole('link', { name: 'Claude' })).toHaveAttribute(
      'href',
      'https://claude.ai/',
    );

    for (const label of ['YouTube', 'X', 'ChatGPT', 'Claude']) {
      expect(screen.getByRole('link', { name: label }).querySelector('svg')).toHaveAttribute(
        'aria-hidden',
        'true',
      );
    }
  });

  it('selects brand icons and falls back for custom labels', () => {
    expect(linkIconName('YouTube')).toBe('youtube');
    expect(linkIconName('x')).toBe('x');
    expect(linkIconName('ChatGPT')).toBe('chatgpt');
    expect(linkIconName('Claude')).toBe('claude');
    expect(linkIconName('My custom link')).toBe('generic');
  });
});

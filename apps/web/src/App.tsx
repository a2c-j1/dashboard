import * as stylex from '@stylexjs/stylex';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { getHealth } from './api.js';

const styles = stylex.create({
  page: {
    backgroundColor: '#080b14',
    color: '#f4f7ff',
    display: 'grid',
    fontFamily: 'system-ui, sans-serif',
    gridTemplateRows: '1fr auto',
    minHeight: '100dvh',
    padding: 'clamp(1.5rem, 5vw, 5rem)',
  },
  clock: {
    alignSelf: 'center',
    fontSize: 'clamp(4.8rem, 21vw, 19rem)',
    fontVariantNumeric: 'tabular-nums',
    fontWeight: 800,
    letterSpacing: '-0.09em',
    lineHeight: 0.8,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    borderTop: '1px solid #25304b',
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginTop: '2rem',
    paddingTop: '1.25rem',
  },
  link: { color: '#aebce2', fontSize: '0.85rem', textDecoration: 'none' },
  status: { color: '#7fe0ad', fontSize: '0.75rem' },
});

const links = [
  ['YouTube', 'https://www.youtube.com/'],
  ['X', 'https://x.com/'],
  ['ChatGPT', 'https://chatgpt.com/'],
  ['Claude', 'https://claude.ai/'],
] as const;

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1 } } });

function formatTime(date: Date) {
  return new Intl.DateTimeFormat('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

function Dashboard() {
  const [now, setNow] = useState(() => new Date());
  const health = useQuery({ queryKey: ['health'], queryFn: getHealth, staleTime: 15_000 });

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main {...stylex.props(styles.page)}>
      <time
        {...stylex.props(styles.clock)}
        dateTime={now.toISOString()}
        aria-label={`現在時刻 ${formatTime(now)}`}
      >
        {formatTime(now)}
      </time>
      <footer {...stylex.props(styles.footer)}>
        <span {...stylex.props(styles.status)}>
          {health.isSuccess ? 'API online' : 'API connecting…'}
        </span>
        {links.map(([label, href]) => (
          <a
            {...stylex.props(styles.link)}
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer"
          >
            {label}
          </a>
        ))}
      </footer>
    </main>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}

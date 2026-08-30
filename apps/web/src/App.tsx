import * as stylex from '@stylexjs/stylex';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { getHealth } from './api.js';
import { appConfig } from './config.js';

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
    flexWrap: 'wrap',
    gap: '1rem',
    justifyContent: 'center',
    marginTop: '2rem',
    paddingTop: '1.25rem',
  },
  link: {
    alignItems: 'center',
    border: '1px solid transparent',
    borderRadius: '999px',
    color: '#aebce2',
    display: 'inline-flex',
    fontSize: '0.85rem',
    gap: '0.45rem',
    padding: '0.35rem 0.65rem',
    textDecoration: 'none',
    ':hover': {
      backgroundColor: '#121a2d',
      borderColor: '#354467',
      color: '#f4f7ff',
    },
    ':focus-visible': {
      outline: '2px solid #7fe0ad',
      outlineOffset: '3px',
    },
  },
  icon: { flexShrink: 0, height: '1.05rem', width: '1.05rem' },
  status: {
    alignItems: 'center',
    color: '#7fe0ad',
    display: 'inline-flex',
    fontSize: '0.75rem',
    gap: '0.4rem',
  },
  statusIcon: {
    backgroundColor: '#7fe0ad',
    borderRadius: '50%',
    boxShadow: '0 0 0 3px #17382d',
    height: '0.45rem',
    width: '0.45rem',
  },
});

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1 } } });

function formatTime(date: Date) {
  return new Intl.DateTimeFormat('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

function FooterIcon({ label }: { label: string }) {
  const icon = label.toLowerCase();

  if (icon === 'youtube') {
    return (
      <svg
        {...stylex.props(styles.icon)}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
      </svg>
    );
  }

  if (icon === 'x') {
    return (
      <svg
        {...stylex.props(styles.icon)}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.3l7.3-8.4L2.8 2h6.4l4.4 5.8L18.9 2Zm-1.1 17.8h1.7L8.3 4.1H6.5l11.3 15.7Z" />
      </svg>
    );
  }

  if (icon === 'chatgpt') {
    return (
      <svg
        {...stylex.props(styles.icon)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M20.2 9.3a4.8 4.8 0 0 0-5.9-5.9A4.8 4.8 0 0 0 8.1 5a4.8 4.8 0 0 0-3.8 5.5 4.8 4.8 0 0 0 3.8 7.2 4.8 4.8 0 0 0 6.2 1.6 4.8 4.8 0 0 0 5.9-5.9 4.8 4.8 0 0 0 0-4.1Z" />
        <path d="m8.1 5 3 5.2m3.2-6.8-3.2 6.8m9.1-.9-6 1.8m1 7.6-4.1-4.9m-6.9 4-1-6.3m.1 0 6.1.8m1.8 1.9-5.2 3" />
      </svg>
    );
  }

  if (icon === 'claude') {
    return (
      <svg
        {...stylex.props(styles.icon)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="m12 2 1.5 6.7L20 5l-4.4 5.2L22 12l-6.4 1.5L20 19l-6.5-3.7L12 22l-1.5-6.7L4 19l4.4-5.5L2 12l6.4-1.5L4 5l6.5 3.7L12 2Z" />
      </svg>
    );
  }

  return (
    <svg
      {...stylex.props(styles.icon)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.2 2.5 3.3 5.5 3.3 9s-1.1 6.5-3.3 9c-2.2-2.5-3.3-5.5-3.3-9S9.8 5.5 12 3Z" />
    </svg>
  );
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
          <span {...stylex.props(styles.statusIcon)} aria-hidden="true" />
          {health.isSuccess ? 'API online' : 'API connecting…'}
        </span>
        {appConfig.links.map(({ label, href }) => (
          <a
            {...stylex.props(styles.link)}
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer"
          >
            <FooterIcon label={label} />
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

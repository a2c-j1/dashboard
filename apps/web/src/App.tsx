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
    backgroundColor: '#11182a',
    border: '1px solid #2b395c',
    borderRadius: '999px',
    color: '#dbe5ff',
    display: 'inline-flex',
    fontSize: '0.8rem',
    fontWeight: 650,
    gap: '0.5rem',
    minHeight: '2.5rem',
    paddingBlock: '0.45rem',
    paddingInline: '0.8rem',
    textDecoration: 'none',
    transitionDuration: '160ms',
    transitionProperty: 'background-color, border-color, color, transform',
    ':hover': {
      backgroundColor: '#1d2a48',
      borderColor: '#7189c5',
      color: '#ffffff',
      transform: 'translateY(-2px)',
    },
    ':focus-visible': {
      outline: '3px solid #8daeff',
      outlineOffset: '3px',
    },
  },
  icon: { blockSize: '1.2rem', flex: '0 0 auto', inlineSize: '1.2rem' },
  status: { color: '#7fe0ad', fontSize: '0.75rem' },
});

type LinkIconName = 'youtube' | 'x' | 'chatgpt' | 'claude' | 'generic';

export function linkIconName(label: string): LinkIconName {
  switch (label.trim().toLowerCase()) {
    case 'youtube':
      return 'youtube';
    case 'x':
      return 'x';
    case 'chatgpt':
      return 'chatgpt';
    case 'claude':
      return 'claude';
    default:
      return 'generic';
  }
}

function LinkIcon({ name }: { name: LinkIconName }) {
  const commonProps = {
    ...stylex.props(styles.icon),
    'aria-hidden': true,
    fill: 'none',
    viewBox: '0 0 24 24',
  } as const;

  if (name === 'youtube') {
    return (
      <svg {...commonProps} fill="currentColor">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
      </svg>
    );
  }

  if (name === 'x') {
    return (
      <svg {...commonProps} fill="currentColor">
        <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.3l7.3-8.3L3 2h6.5l4.4 5.8L18.9 2Zm-1.1 17.8h1.7L8.5 4.1H6.7l11.1 15.7Z" />
      </svg>
    );
  }

  if (name === 'chatgpt') {
    return (
      <svg {...commonProps} stroke="currentColor" strokeWidth="1.7">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m12 3.2 2.3 1.3a4.2 4.2 0 0 1 2.1 3.6v.2l2.4 1.3a4.2 4.2 0 0 1 0 7.3l-2.4 1.3v.2a4.2 4.2 0 0 1-6.3 3.6L9.8 20l-2.4-1.3a4.2 4.2 0 0 1-2.1-3.6v-.2l-2.4-1.3a4.2 4.2 0 0 1 0-7.3l2.4-1.3v-.2a4.2 4.2 0 0 1 6.3-3.6L12 3.2Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m12 3.2-2.3 1.3a4.2 4.2 0 0 0-2.1 3.6v7.8a4.2 4.2 0 0 0 2.1 3.6l2.3 1.3m0-17.6v7.1m0 0 6.8-3.9m-6.8 3.9 6.8 3.9m0 0v2.7m0-2.7-6.8 3.9m0 0-6.8-3.9m0 0V12m0 0 6.8-3.9"
        />
      </svg>
    );
  }

  if (name === 'claude') {
    return (
      <svg {...commonProps} fill="currentColor">
        <path
          d="m13.5 2-1.9 7.5L19 6.4l-4.5 5.4 7.3 1.5-7.3 1.4 4.5 5.4-7.4-3.1 1.9 7.5-4.3-6.4L5 23l1.9-7.5-7.3 3.1 4.4-5.4-7.2-1.4L4 10.8-.4 5.4l7.3 3.1L5 1l4.2 6.4L13.5 2Z"
          transform="translate(1 0) scale(.92)"
        />
      </svg>
    );
  }

  return (
    <svg {...commonProps} stroke="currentColor" strokeWidth="1.8">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 5.5H19a2 2 0 0 1 2 2V19a2 2 0 0 1-2 2h-5.5m-3-5L14 12l-3.5-4M14 12H3"
      />
    </svg>
  );
}

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
        {appConfig.links.map(({ label, href }) => (
          <a
            {...stylex.props(styles.link)}
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
          >
            <LinkIcon name={linkIconName(label)} />
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

export type ExternalLink = { label: string; href: string };

export type WebAppConfig = {
  name: string;
  links: readonly ExternalLink[];
};

const defaultLinks: readonly ExternalLink[] = [
  { label: 'YouTube', href: 'https://www.youtube.com/' },
  { label: 'X', href: 'https://x.com/' },
  { label: 'ChatGPT', href: 'https://chatgpt.com/' },
  { label: 'Claude', href: 'https://claude.ai/' },
];

function parseLinks(value: string | undefined): readonly ExternalLink[] {
  if (!value) return defaultLinks;

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return defaultLinks;

    const links = parsed.filter((link): link is ExternalLink => {
      if (!link || typeof link !== 'object') return false;
      const candidate = link as Record<string, unknown>;
      if (typeof candidate.label !== 'string' || !candidate.label.trim()) return false;
      if (typeof candidate.href !== 'string') return false;
      try {
        return new URL(candidate.href).protocol === 'https:';
      } catch {
        return false;
      }
    });

    return links.length > 0 ? links : defaultLinks;
  } catch {
    return defaultLinks;
  }
}

export const appConfig: WebAppConfig = {
  name: import.meta.env.VITE_APP_NAME?.trim() || 'Dashboard Clock',
  links: parseLinks(import.meta.env.VITE_EXTERNAL_LINKS),
};

export { defaultLinks, parseLinks };

export function parsePort(value: string | undefined): number {
  const port = Number(value ?? 8787);
  return Number.isInteger(port) && port > 0 && port <= 65535 ? port : 8787;
}

export const apiConfig = {
  name: process.env.APP_NAME?.trim() || 'Dashboard',
  version: process.env.APP_VERSION?.trim() || '0.1.0',
  port: parsePort(process.env.PORT),
} as const;

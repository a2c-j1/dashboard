# Dashboard

React/Vite frontend and Hono/Prisma/SQLite API in an npm workspace.

## Development

```sh
npm install
npm run prisma:generate -w @dashboard/api
npm run prisma:migrate -w @dashboard/api
npm run dev
```

Open http://localhost:5173. The API health endpoint is http://localhost:8787/api/health.

## Quality checks

```sh
npm run lint
npm test
npm run format:check
npm run semgrep
npm run test:e2e
```

The OpenAPI document is available at `http://localhost:8787/api/doc` during development.

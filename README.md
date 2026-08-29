# Dashboard

React/Vite frontend and Hono/Prisma/SQLite API in an npm workspace.

## Development

```sh
npm install
npm run storage:up
npm run prisma:generate -w @dashboard/api
npm run prisma:migrate -w @dashboard/api
npm run dev
```

Open http://localhost:5173. The API health endpoint is http://localhost:8787/api/health.

### Object storage

Local development uses SeaweedFS through its S3-compatible API. It starts with
the development stack and exposes the S3 endpoint on `http://localhost:8333`.
The pre-created bucket is `dashboard-dev`; its development credentials are in
[`apps/api/.env.example`](apps/api/.env.example).

```sh
npm run storage:up
```

The administration UI is available at `http://localhost:23646`. Stop the
storage service with `npm run storage:down`. Its data stays in the named Docker
volume, and can be removed explicitly with `docker compose down --volumes`.

### Dev Container

Open this repository with the **Reopen in Container** command. The Dev Container
starts the same SeaweedFS service and configures the API process with
`S3_ENDPOINT=http://seaweedfs:8333`; do not change it to `localhost` from inside
the container. Dependencies and the Prisma client are installed automatically.
It also provides Docker access to Testcontainers through the host Docker socket.

### Integration-test sample

The API includes an opt-in SeaweedFS and SQLite integration-test sample. It
starts a disposable SeaweedFS container once per suite, creates a new bucket and
SQLite database for every test, then deletes both during cleanup. This protects
the development bucket and `dev.db` from test data.

```sh
npm run test:integration -w @dashboard/api
```

Docker must be running. The regular `npm test` command skips these integration
tests, so it remains usable where Docker is unavailable.

## Quality checks

```sh
npm run lint
npm test
npm run format:check
npm run semgrep
npm run test:e2e
```

The OpenAPI document is available at `http://localhost:8787/api/doc` during development.

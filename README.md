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

For the containerized public stack, use the root Compose file. It publishes the
web app on `http://localhost:5173` and the API on `http://localhost:8787`:

```sh
./scripts/compose-up.sh
```

Stop it with `./scripts/compose-down.sh`. `scripts/compose-exec.sh` runs a
command in its utility workspace container; use `npm run dev` on the host for
the usual HTTP development workflow. Override the public host ports with
`DASHBOARD_WEB_PORT` and `DASHBOARD_API_PORT` when needed.

The existing `npm run dev` command remains available for HTTP-only development.
For HTTPS development, generate the local self-signed certificate and start both
servers with one command:

```sh
npm run dev:https
```

Open https://localhost:5173 (accept the locally generated certificate warning).
The Vite proxy forwards `/api` to the HTTPS API at
https://localhost:8787/api/health. `npm run setup:tls` can be run separately;
it is idempotent and stores the ignored key/certificate pair in `.certs/`.

To open the development site from an iPad on the same network, add the Mac's
LAN address (or a resolvable LAN hostname) to the certificate before starting
the servers. The HTTPS Vite server listens on the LAN in this mode.

```sh
DEV_CERT_HOSTS="localhost,127.0.0.1,::1,192.168.1.42" npm run dev:https
```

Install `.certs/localhost-ca.pem` on the iPad once, then enable full trust for
the **Dashboard Local Development CA** in iPadOS certificate trust settings.
Open `https://192.168.1.42:5173` afterwards. Re-run the command with the same
`DEV_CERT_HOSTS` value when the LAN address changes; only the server
certificate is regenerated, so the iPad's trusted development CA remains
valid.

The certificate is for local development only and is not suitable for
production. CI runs the same OpenSSL setup before its quality checks.

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
Its workspace publishes the web app on `http://localhost:5174`, the API on
`http://localhost:8788`, and SeaweedFS on ports 8334/23647, so it can run beside
the public Compose stack. Start it manually with `./scripts/devcontainer-up.sh`
when using Codex or another client without automatic Dev Container lifecycle
support, then run `./scripts/devcontainer-exec.sh npm run dev`. Override its
host ports with `DEVCONTAINER_WEB_PORT`, `DEVCONTAINER_API_PORT`,
`DEVCONTAINER_STORAGE_PORT`, and `DEVCONTAINER_STORAGE_ADMIN_PORT`.
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

GitHub Actions runs these checks with the HTTPS certificate setup in the Node
quality job. Semgrep runs independently in the official `semgrep/semgrep`
container on pull requests, pushes to `main`, manual dispatches, and a daily
scheduled scan.

The OpenAPI document is available at `http://localhost:8787/api/doc` during development.

# Dashboard

A small, local-first dashboard for keeping a useful set of information and
destinations in one place. The web screen shows a live 24-hour clock, reports
whether its API is online, and provides quick links to YouTube, X, ChatGPT, and
Claude.

This repository is for people who want to try the dashboard locally or
continue developing it. It contains a React/Vite frontend and a Hono API in an
npm workspace.

If you are adapting this repository into another application, start with the
[template adoption guide](TEMPLATE.md) for the replacement checklist and the
minimal/full mode decision. This README remains the runnable guide for the
Dashboard example.

## What you can try

- Watch the clock update every second in your browser's local time.
- See the API connection status change between `API online` and
  `API connecting…`.
- Open YouTube, X, ChatGPT, or Claude from the dashboard.
- Check the API health response and generated OpenAPI document while developing.

## Quick start

Choose the development mode that matches what you need. The minimal mode only
requires Node.js 24 and npm; it starts the web app and API with local defaults,
without Docker, certificates, or object storage:

```sh
npm install
npm run dev:minimal
```

Then open [http://localhost:5173](http://localhost:5173). The API is available
at [http://localhost:8787/api/health](http://localhost:8787/api/health), and its
OpenAPI document is at [http://localhost:8787/api/doc](http://localhost:8787/api/doc).

`npm run dev` remains an alias for the minimal mode for compatibility.

For the full local mode, which enables the existing SeaweedFS-backed setup,
use Docker and start it explicitly:

```sh
npm run dev:full
```

The full HTTPS mode also creates the local development certificate:

```sh
npm run dev:full:https
```

When you are finished with either full mode, stop the object-storage service
with:

```sh
npm run storage:down
```

See [development modes](docs/development-modes.md) for the prerequisites,
trade-offs, and migration guide. The API's optional Prisma setup remains
available for workflows that use the persistence layer:

```sh
npm run prisma:generate -w @dashboard/api
npm run prisma:migrate -w @dashboard/api
```

The first start may take a moment while the services and generated Prisma
client become ready. The links in the dashboard open external sites in a new
browser tab.

<details>
<summary>Development and operations</summary>

### HTTP and HTTPS development

The usual `npm run dev` workflow serves the web app over HTTP and proxies
`/api` to the API at `http://localhost:8787`.

For local HTTPS, generate a self-signed development certificate and start both
servers with one command:

```sh
npm run dev:https
```

Open [https://localhost:5173](https://localhost:5173) and accept the local
certificate warning. The HTTPS API health endpoint is
[https://localhost:8787/api/health](https://localhost:8787/api/health).
`npm run setup:tls` can be run separately; it is idempotent and stores the
ignored key/certificate pair in `.certs/`.

To open the HTTPS development site from an iPad on the same network, include
the Mac's LAN address (or a resolvable LAN hostname) in the certificate before
starting the servers:

```sh
DEV_CERT_HOSTS="localhost,127.0.0.1,::1,192.168.1.42" npm run dev:https
```

Install `.certs/localhost-ca.pem` on the iPad once, then enable full trust for
the **Dashboard Local Development CA** in iPadOS certificate trust settings.
Open `https://192.168.1.42:5173` afterwards. Re-run the command with the same
`DEV_CERT_HOSTS` value when the LAN address changes. The certificate is for
local development only and is not suitable for production.

In VS Code, `Dev: Start Dashboard` and `Dev: Start Dashboard (HTTPS)` are
background tasks. Stop a host-run watcher with **Tasks: Terminate Task** and
select the corresponding task.

### Containerized public stack

The root Compose file can run the web and API services together. It publishes
the web app on port `5173` and the API on port `8787`:

```sh
./scripts/compose-up.sh
```

Stop it with `./scripts/compose-down.sh`. To switch modes safely, use
`./scripts/compose-restart.sh` for HTTP or
`./scripts/compose-restart-https.sh` for HTTPS; each stops the current public
stack first and preserves named volumes. `scripts/compose-exec.sh` runs a
command in its utility workspace container. Override the public host ports with
`DASHBOARD_WEB_PORT` and `DASHBOARD_API_PORT` when needed.

For the HTTPS public Compose stack, use the dedicated overlay:

```sh
./scripts/compose-up-https.sh
```

It generates the local certificate before starting services. Open
`https://localhost:5173` and
`https://localhost:8787/api/health`. HTTP and HTTPS public stacks share ports
and cannot run at the same time. The Codex Docker Compose environment provides
matching HTTP/HTTPS run, stop, and restart actions.

### Object storage

Local development uses SeaweedFS through its S3-compatible API. The development
stack exposes S3 at `http://localhost:8333`, with the pre-created bucket
`dashboard-dev`. Development credentials are in
[`apps/api/.env.example`](apps/api/.env.example).

```sh
npm run storage:up
```

The administration UI is at `http://localhost:23646`. Stop the service with
`npm run storage:down`. Its data stays in a named Docker volume; remove that
volume explicitly with `docker compose down --volumes` when needed.

### Dev Container

Open this repository with **Reopen in Container**. The Dev Container starts the
same SeaweedFS service and configures the API with
`S3_ENDPOINT=http://seaweedfs:8333`; use `seaweedfs`, not `localhost`, from
inside the container. Dependencies and the Prisma client are installed
automatically.

Its workspace publishes the web app on `http://localhost:5174`, the API on
`http://localhost:8788`, and SeaweedFS on ports `8334`/`23647`, so it can run
beside the public Compose stack. Start it manually with
`./scripts/devcontainer-up.sh` when lifecycle support is unavailable, then run
`./scripts/devcontainer-exec.sh npm run dev`. Override its host ports with
`DEVCONTAINER_WEB_PORT`, `DEVCONTAINER_API_PORT`, `DEVCONTAINER_STORAGE_PORT`,
and `DEVCONTAINER_STORAGE_ADMIN_PORT`.

For HTTPS in this environment, use `./scripts/devcontainer-up-https.sh`; it
generates the certificate inside the workspace and starts both TLS servers.
Open `https://localhost:5174` and
`https://localhost:8788/api/health`. Use
`./scripts/devcontainer-down.sh` to stop the container, or
`./scripts/devcontainer-restart.sh` /
`./scripts/devcontainer-restart-https.sh` to recreate and start the selected
mode. The restart commands remain attached to the server process until it is
stopped.

The Dev Container and public Compose HTTPS flows share the ignored `.certs`
directory and local CA. Install and explicitly trust
`.certs/localhost-ca.pem` in your browser or device to remove the warning. The
container also provides Docker access to Testcontainers through the host Docker
socket.

### Integration-test sample

The API includes an opt-in SeaweedFS and SQLite integration-test sample. It
starts a disposable SeaweedFS container once per suite, creates a new bucket
and SQLite database for every test, then cleans both up. Docker must be running.

```sh
npm run test:integration -w @dashboard/api
```

The regular `npm test` command skips these integration tests, so it remains
usable where Docker is unavailable.

</details>

## Quality checks

```sh
npm run format:check
npm run lint
npm test
npm run build
npm run test:e2e
npm run semgrep
```

GitHub Actions runs the quality checks with HTTPS certificate setup in the Node
quality job. Semgrep runs independently in the official
`semgrep/semgrep` container on pull requests, pushes to `main`, manual
dispatches, and a daily scheduled scan.

# Template adoption guide

This repository can be used as a starting point for a new local-first
full-stack application. Copy the repository, choose the smallest stack that
fits the application, and then replace the identifiers and integration points
listed below. The existing [README](README.md) remains the source of truth for
running this Dashboard example; this document describes what to change when
turning it into another application.

## Choose a starting mode

Start with **minimal** when the application only needs a React/Vite web app, a
Hono API, shared validation/types, and SQLite persistence:

1. Keep `apps/web/`, `apps/api/`, `packages/schemas/`, and the root npm
   workspace.
2. Keep `DATABASE_URL` and the Prisma schema/migrations.
3. Run the web and API with `npm run dev`; no object-storage service is needed.
4. Keep the regular unit/API tests and add application-specific tests as
   features are introduced.

Choose **full** when the application stores files or needs the repository's
containerized development workflow:

1. Keep `compose.yaml`, `compose.https.yaml`, `.devcontainer/`, and the
   `scripts/` lifecycle helpers.
2. Keep SeaweedFS (S3-compatible storage), its bucket and credentials in
   `apps/api/.env.example`, and the storage commands in `package.json`.
3. Keep the HTTPS development certificate scripts when HTTPS or LAN/device
   testing is required.
4. Enable `npm run test:integration -w @dashboard/api` when Docker is
   available. The integration suite creates disposable SQLite and S3 resources;
   it is intentionally separate from the regular `npm test` command.

The default values below describe the current example. Changing an identifier
usually requires a coordinated replacement; changing a port or service name
also affects proxies, Compose mappings, health checks, certificates, and test
configuration.

## Replacement checklist

### Application name and package identifiers

Replace `Dashboard` (display name) and `dashboard` (slug) with the new
application's values. Search the repository, excluding generated files and
`node_modules`, for `Dashboard`, `dashboard`, and `Dashboard Clock`.

| Current value        | Where it is used                                                                                                     | What else changes                                               |
| -------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `Dashboard`          | `README.md`, `apps/api/src/app.ts` OpenAPI title, certificate subject in `scripts/generate-dev-cert.sh`              | User-facing documentation, API docs, and the local CA name      |
| `dashboard`          | Root package name, Compose project naming in `scripts/compose-project.sh`, mount paths, test temp-directory prefixes | npm metadata, container/project names, and local test artifacts |
| `@dashboard/web`     | `apps/web/package.json`, workspace commands and dependencies                                                         | Web workspace commands and any package references               |
| `@dashboard/api`     | `apps/api/package.json`, workspace commands and dependencies                                                         | API workspace commands and any package references               |
| `@dashboard/schemas` | `packages/schemas/package.json`, workspace commands and imports                                                      | Shared-package build order and imports                          |
| `Dashboard Clock`    | `apps/web/index.html`                                                                                                | Browser tab title                                               |

After renaming packages, run `npm install` so `package-lock.json` reflects the
new workspace names. Do not hand-edit generated Prisma or build output.

### Ports and local endpoints

The default local endpoints are:

| Concern                   | Default          | Replace in                                                                                                                               |
| ------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Web dev server            | `5173`           | `apps/web/vite.config.ts`, `playwright.config.ts`, `compose.yaml`, README commands/links                                                 |
| API dev server            | `8787`           | `apps/api/src/server.ts`, `apps/web/vite.config.ts`, `playwright.config.ts`, `compose.yaml`, `compose.https.yaml`, README commands/links |
| S3 API (host)             | `8333`           | `compose.yaml`, `apps/api/.env.example`, README                                                                                          |
| SeaweedFS admin UI (host) | `23646`          | `compose.yaml`, README                                                                                                                   |
| Dev Container web         | `5174`           | README and the Dev Container configuration                                                                                               |
| Dev Container API         | `8788`           | README and the Dev Container configuration                                                                                               |
| Dev Container S3/admin    | `8334` / `23647` | README and the Dev Container configuration                                                                                               |

For a one-off port collision, prefer the existing overrides
`DASHBOARD_WEB_PORT`, `DASHBOARD_API_PORT`, `DEVCONTAINER_WEB_PORT`,
`DEVCONTAINER_API_PORT`, `DEVCONTAINER_STORAGE_PORT`, and
`DEVCONTAINER_STORAGE_ADMIN_PORT`; these change host bindings without changing
the internal service ports. If the application changes the internal API port,
update the Vite proxy target, Playwright `webServer` health URL, Compose
`depends_on` health check, and both HTTP/HTTPS proxy targets together.

### Database

The default database is SQLite at `file:./dev.db`:

- Change `DATABASE_URL` in `apps/api/.env.example` for the new local database
  location or database provider.
- Update `apps/api/prisma/schema.prisma` and create a migration when the data
  model changes. Existing migrations describe the Dashboard example and must
  be reviewed before reuse.
- Keep `npm run prisma:generate -w @dashboard/api` and
  `npm run prisma:migrate -w @dashboard/api` in the setup instructions.
- If switching away from SQLite, update the Prisma provider, connection
  format, Compose/Dev Container environment, and integration-test setup
  together. This is a persistence change, not just a string replacement.

Database changes affect API runtime configuration, migrations, local data
files, and integration-test isolation. Never commit `.env` or a local `*.db`
file.

### Object storage

Object storage is optional in minimal mode and enabled by default in the full
development stack. The current full-mode defaults are:

```dotenv
S3_ENDPOINT="http://localhost:8333"
S3_REGION="us-east-1"
S3_ACCESS_KEY_ID="dashboard-dev"
S3_SECRET_ACCESS_KEY="dashboard-dev-secret"
S3_BUCKET="dashboard-dev"
```

Replace the `dashboard-dev` bucket/credential values and the `S3_ENDPOINT` in
`apps/api/.env.example` and the matching environment blocks in `compose.yaml`.
Inside Compose or the Dev Container, the API must use the service hostname
(`http://seaweedfs:8333`), not `localhost`. Update the README's storage and
Dev Container sections if the provider, service name, ports, or bucket setup
changes. Keep credentials local and use real secret management for shared or
production environments.

The current application exercises S3 through the API integration sample in
`apps/api/test/object-storage.integration.test.ts`; update that test and its
Testcontainers setup if the storage API or provider changes. Removing object
storage from a minimal variant also means removing the full-mode storage
startup requirement, not merely deleting the environment variables.

### External links and application content

The example's external destinations are defined in
`apps/web/src/App.tsx` and asserted in `apps/web/src/App.test.tsx` and
`e2e/dashboard.spec.ts`. Replace the labels and URLs there together. Also
update the README's feature list and any product copy in `apps/web/index.html`.

When adding or removing destinations, update both the unit test and the E2E
test so the acceptance coverage matches the links rendered by the UI. If a
destination is no longer external, revisit the link's `target`/security
attributes and the test expectations rather than leaving stale assertions.

## Default values and impact summary

The safe default for a new local application is minimal mode with ports
`5173`/`8787` and SQLite. Full mode adds Docker, SeaweedFS, S3-compatible
configuration, named volumes, and optional integration tests. HTTPS adds the
ignored `.certs/` directory and a local development CA; it does not change
production TLS configuration.

Before opening a pull request for a derived application, verify that:

1. `rg` finds no old app/package identifiers in source, configuration, or
   user-facing documentation (apart from migration history that is deliberately
   retained).
2. README quick-start commands still work for the selected mode.
3. Port changes are reflected in dev servers, proxies, health checks, Compose,
   and Playwright.
4. Database and storage defaults are documented in `.env.example`, with no
   secrets committed.
5. External-link tests describe exactly the links shown by the new UI.

For the commands and operational details of this repository's example, return
to [README.md](README.md).

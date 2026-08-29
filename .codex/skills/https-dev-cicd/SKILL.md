---
name: https-dev-cicd
description: Set up or maintain local HTTPS development and CI certificate automation, including LAN or iPad access, without introducing production TLS configuration.
---

# HTTPS Development and CI/CD

Use this skill when a project needs repeatable local HTTPS development with
self-signed certificates, or when its CI should exercise the same certificate
setup. Do not use it for production certificate issuance, public DNS, or
deployment-provider TLS configuration.

## Outcome

Keep the ordinary HTTP workflow working unless the user explicitly replaces it.
Provide a separate one-command HTTPS workflow that creates any required local
certificate material before starting every relevant server. CI must be able to
run the same preparation non-interactively.

## Certificate model

- Create a local development root CA and issue a server certificate from it.
  Keep the CA stable so tablets only need to trust it once; regenerate the
  server certificate when its requested SAN host list changes.
- Default SANs must cover `localhost`, `127.0.0.1`, and `::1`. Accept an
  explicit, validated comma-separated environment variable for extra LAN IPs
  or hostnames; never guess a network address.
- Store all generated material in an ignored directory. Private keys and
  internal state files must be owner-readable only. Do not place generated
  keys, certificates, or CI artifacts under version control.
- Explain that the local CA is development-only. For iPad access, document
  installing and explicitly trusting the CA certificate, and ensure the web
  development server listens on the LAN only in HTTPS mode.

## Application integration

- Inspect the project's actual server and proxy architecture before changing
  it. Enable TLS for every local server needed by the browser-facing flow.
- Preserve HTTP scripts and existing port conventions. When a development
  proxy connects to a locally issued certificate, configure it to trust that
  local connection deliberately; do not weaken unrelated TLS behavior.
- Prefer platform-provided OpenSSL and existing runtime capabilities. Do not
  add a dependency solely to create development certificates.

## CI and verification

- Add the certificate setup command before checks that start or inspect HTTPS
  services. CI must not need a checked-in certificate or a manual trust step.
- Update the primary development documentation with the HTTPS command, local
  URL, LAN/iPad example, CA trust requirement, and production boundary.
- Validate the certificate chain and SANs, then verify direct HTTPS API access
  and browser-server proxy access. Run the repository's applicable formatter,
  lint, test, build, E2E, and security checks. Report unavailable tooling or
  environment-level test failures separately from product failures.

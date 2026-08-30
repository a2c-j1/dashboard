#!/usr/bin/env sh

set -eu

export PATH="$HOME/.local/bin:$PATH"

npm ci
npm run prisma:generate -w @dashboard/api
PIPX_HOME=/opt/pipx PIPX_BIN_DIR=/usr/local/bin pipx install --force semgrep
npx playwright install --with-deps chromium

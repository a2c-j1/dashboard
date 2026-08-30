#!/usr/bin/env sh

set -eu

export PATH="$HOME/.local/bin:$PATH"

npm ci
npm run prisma:generate -w @dashboard/api
PIPX_HOME="$HOME/.local/pipx" PIPX_BIN_DIR="$HOME/.local/bin" pipx install --force semgrep
npx playwright install --with-deps chromium

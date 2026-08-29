#!/usr/bin/env sh

set -eu

export PATH="$HOME/.local/bin:$PATH"

npm ci
npm run prisma:generate -w @dashboard/api
pip3 install --user semgrep
npx playwright install --with-deps chromium

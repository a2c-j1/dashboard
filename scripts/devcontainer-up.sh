#!/usr/bin/env sh

set -eu

exec npx --yes @devcontainers/cli up --workspace-folder .

#!/usr/bin/env sh

set -eu

exec docker compose --project-name dashboard-review exec --no-TTY workspace "$@"

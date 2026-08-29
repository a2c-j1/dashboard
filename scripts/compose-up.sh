#!/usr/bin/env sh

set -eu

docker compose --project-name dashboard-review up --build --detach workspace
docker compose --project-name dashboard-review exec --no-TTY workspace ./scripts/bootstrap-development.sh

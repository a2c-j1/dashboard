#!/usr/bin/env sh

set -eu

docker compose --project-name dashboard-review down --remove-orphans

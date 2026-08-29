#!/usr/bin/env sh

set -eu

docker compose --project-name dashboard-devcontainer down --remove-orphans

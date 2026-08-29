#!/usr/bin/env sh

set -eu

DASHBOARD_SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$DASHBOARD_SCRIPT_DIR/compose-project.sh"

export COMPOSE_PROJECT_NAME="$(dashboard_compose_project_name devcontainer)"
cd "$DASHBOARD_WORKTREE_ROOT"

exec npx --yes @devcontainers/cli up --workspace-folder .

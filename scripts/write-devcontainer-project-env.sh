#!/usr/bin/env sh

set -eu

DASHBOARD_SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$DASHBOARD_SCRIPT_DIR/compose-project.sh"

project_name=$(dashboard_compose_project_name devcontainer)

printf 'COMPOSE_PROJECT_NAME=%s\n' "$project_name" > "$DASHBOARD_WORKTREE_ROOT/.devcontainer/.env"

#!/usr/bin/env sh

set -eu

DASHBOARD_SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$DASHBOARD_SCRIPT_DIR/compose-project.sh"

project_name=$(dashboard_compose_project_name review)
cd "$DASHBOARD_WORKTREE_ROOT"

exec docker compose --project-name "$project_name" exec --no-TTY workspace "$@"

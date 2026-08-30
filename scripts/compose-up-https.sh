#!/usr/bin/env sh

set -eu

DASHBOARD_SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$DASHBOARD_SCRIPT_DIR/compose-project.sh"

project_name=$(dashboard_compose_project_name review)
cd "$DASHBOARD_WORKTREE_ROOT"

npm run setup:tls

docker compose --project-name "$project_name" --file compose.yaml --file compose.https.yaml \
  --profile public up --build --detach workspace
docker compose --project-name "$project_name" --file compose.yaml --file compose.https.yaml \
  exec --no-TTY workspace ./scripts/bootstrap-development.sh
docker compose --project-name "$project_name" --file compose.yaml --file compose.https.yaml \
  --profile public up --detach api web

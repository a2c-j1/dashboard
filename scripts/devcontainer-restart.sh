#!/usr/bin/env sh

set -eu

DASHBOARD_SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

"$DASHBOARD_SCRIPT_DIR/devcontainer-down.sh"
"$DASHBOARD_SCRIPT_DIR/devcontainer-up.sh"
exec "$DASHBOARD_SCRIPT_DIR/devcontainer-exec.sh" npm run dev

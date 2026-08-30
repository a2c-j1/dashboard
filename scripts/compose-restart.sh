#!/usr/bin/env sh

set -eu

DASHBOARD_SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

"$DASHBOARD_SCRIPT_DIR/compose-down.sh"
exec "$DASHBOARD_SCRIPT_DIR/compose-up.sh"

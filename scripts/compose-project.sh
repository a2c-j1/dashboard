#!/usr/bin/env sh

set -eu

: "${DASHBOARD_SCRIPT_DIR:?DASHBOARD_SCRIPT_DIR must be set before sourcing compose-project.sh}"

DASHBOARD_WORKTREE_ROOT=$(CDPATH= cd -- "$DASHBOARD_SCRIPT_DIR/.." && pwd)

dashboard_compose_project_name() {
  environment=$1
  worktree_name=$(basename "$DASHBOARD_WORKTREE_ROOT" | tr '[:upper:]' '[:lower:]' | tr -cs '[:alnum:]' '-')
  worktree_name=${worktree_name#-}
  worktree_name=${worktree_name%-}

  if command -v shasum >/dev/null 2>&1; then
    worktree_hash=$(printf '%s' "$DASHBOARD_WORKTREE_ROOT" | shasum -a 256 | cut -c1-10)
  else
    worktree_hash=$(printf '%s' "$DASHBOARD_WORKTREE_ROOT" | sha256sum | cut -c1-10)
  fi

  printf 'dashboard-%s-%s-%s\n' "$environment" "$worktree_name" "$worktree_hash"
}

#!/usr/bin/env bash
# SessionStart hook: keeps every Claude Code session (cloud or local) aware of
# the true state of the remote before any work starts.
#
# Read-only on purpose: it never checks out, merges or resets anything, so it
# cannot clobber work in progress. It only reports.

set -uo pipefail

cd "$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0

branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"

echo "== Repository sync status =="
echo "branch: ${branch}"

if git fetch --quiet --prune origin 2>/dev/null; then
  upstream="$(git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}' 2>/dev/null || true)"
  if [ -n "${upstream}" ]; then
    behind="$(git rev-list --count "HEAD..${upstream}" 2>/dev/null || echo 0)"
    ahead="$(git rev-list --count "${upstream}..HEAD" 2>/dev/null || echo 0)"
    echo "upstream: ${upstream} (ahead ${ahead}, behind ${behind})"
    [ "${behind}" != "0" ] && echo "ACTION: remote has newer commits - run 'git pull origin ${branch}' before editing."
    [ "${ahead}" != "0" ] && echo "ACTION: local commits are not on the remote - run 'git push -u origin ${branch}'."
  else
    echo "upstream: none - this branch is not on the remote yet."
    echo "ACTION: run 'git push -u origin ${branch}' so the work is synced."
  fi
else
  echo "upstream: could not reach origin (offline or restricted network)."
fi

dirty="$(git status --porcelain | wc -l | tr -d ' ')"
if [ "${dirty}" != "0" ]; then
  echo "working tree: ${dirty} uncommitted change(s) - commit and push before the session ends."
else
  echo "working tree: clean"
fi

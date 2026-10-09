#!/usr/bin/env bash
# Push the bot commit without ever force-pushing or overwriting human work.
# If someone pushed meanwhile: fetch, rebase, re-validate, retry. On a rebase conflict: abort and stop.
# Exit codes: 0 pushed, 2 conflict (stopped safely), 4 validation failed after rebase, 5 gave up after retries.
set -euo pipefail

BRANCH="${1:-main}"
REMOTE="${2:-origin}"

for attempt in 1 2 3; do
  if git push "$REMOTE" "HEAD:refs/heads/$BRANCH"; then
    echo "Pushed on attempt $attempt."
    exit 0
  fi
  echo "Push rejected (attempt $attempt). Re-reading $REMOTE/$BRANCH and rebasing…"
  git fetch "$REMOTE" "$BRANCH"
  if ! git rebase "$REMOTE/$BRANCH"; then
    git rebase --abort || true
    echo "::error::Concurrent change conflicts with the generated content. Stopped safely; nothing was published."
    exit 2
  fi
  if ! node scripts/validate-content.mjs; then
    echo "::error::Content failed validation after rebasing onto newer commits. Stopped safely."
    exit 4
  fi
  sleep $((attempt * 3))
done
echo "::error::Could not push after 3 attempts."
exit 5

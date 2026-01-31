#!/usr/bin/env bash
set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Usage: $0 <iterations>"
  exit 1
fi

PROMPT_FILE="${PROMPT_FILE:-ralph/PROMPT.md}"
PLAN_FILE="${PLAN_FILE:-ralph/prd.json}"
PROGRESS_FILE="${PROGRESS_FILE:-ralph/progress.txt}"

for ((i=1; i<=$1; i++)); do
  echo "=== Ralph iteration $i of $1 ==="

  result=$(claude -p --dangerously-skip-permissions "$(cat "$PROMPT_FILE")

PRD:
$(cat "$PLAN_FILE")

PROGRESS:
$(cat "$PROGRESS_FILE")")

  echo "$result"

  if [[ "$result" == *"<promise>COMPLETE</promise>"* ]]; then
    echo "COMPLETE detected. Exiting."
    exit 0
  fi
done

echo "Completed $1 iterations."

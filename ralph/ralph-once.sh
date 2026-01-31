#!/usr/bin/env bash
set -euo pipefail

PROMPT_FILE="${PROMPT_FILE:-ralph/PROMPT.md}"
PLAN_FILE="${PLAN_FILE:-ralph/prd.json}"
PROGRESS_FILE="${PROGRESS_FILE:-ralph/progress.txt}"

echo "=== Ralph single iteration ==="

claude -p --dangerously-skip-permissions "$(cat "$PROMPT_FILE")

PRD:
$(cat "$PLAN_FILE")

PROGRESS:
$(cat "$PROGRESS_FILE")"

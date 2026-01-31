#!/usr/bin/env bash
set -euo pipefail

AGENT_CMD="${AGENT_CMD:-opencode}"
PROMPT_FILE="${PROMPT_FILE:-ralph/PROMPT.md}"
PLAN_FILE="${PLAN_FILE:-ralph/prd.json}"
PROGRESS_FILE="${PROGRESS_FILE:-ralph/progress.txt}"

if ! command -v "$AGENT_CMD" >/dev/null 2>&1; then
  echo "Agent CLI '$AGENT_CMD' not found. Set AGENT_CMD to your CLI."
  echo "Edit ralph/ralph-once.sh to match your CLI invocation if needed."
  exit 1
fi

cat "$PROMPT_FILE" "$PLAN_FILE" "$PROGRESS_FILE" | "$AGENT_CMD"

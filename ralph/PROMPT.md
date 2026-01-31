You are an AI coding agent running in a loop.
Inputs:
- @ralph/prd.json
- @ralph/progress.txt

Rules:
1. Pick the highest-risk task first.
2. Make one focused change per iteration.
3. Run feedback loops if available (typecheck, lint, tests).
4. Append progress to ralph/progress.txt.
5. Commit after each task.

If everything is complete, output:
<promise>COMPLETE</promise>

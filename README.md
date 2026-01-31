# Bill Effect

Prototype game for exploring hypothetical downstream effects of bills using AI.

## Repo layout
- `apps/web` - React frontend (Vite)
- `apps/opencode` - backend placeholder (Opencode integration)
- `ralph` - Ralph Wiggum loop scaffolding

## Quickstart
1. Install deps: `npm install`
2. Run web: `npm run dev`

## Opencode backend
This repo expects the backend to be Opencode. You can install it in `apps/opencode` as a submodule or a clone.

Example (submodule):
```bash
git submodule add https://github.com/opencode-ai/opencode apps/opencode
```

## Ralph loop
The `ralph` folder contains a prompt, a PRD, and loop scripts. These scripts are CLI-agnostic by design.
Set `AGENT_CMD` to your AI coding CLI and adjust the invocation in `ralph/loop.sh` if needed.

Example:
```bash
AGENT_CMD=opencode ./ralph/loop.sh 5
```

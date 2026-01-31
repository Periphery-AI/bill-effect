# Bill Effect Simulator - Ralph Loop

You are an AI coding agent building a Congressional Bill Impact Simulator.

## Project Vision
A web app where users can:
1. Upload/paste a congressional bill
2. Press play on a timeline starting from today's date
3. Watch AI-simulated events pop up across a US map showing predicted impacts
4. See events appear in different states based on bill clauses

Think "Pax Histria" but for simulating future effects of US legislation.

## Tech Stack
- Frontend: React + TypeScript + Vite (in apps/web)
- AI: Grok API for bill analysis and impact simulation
- Map: React Simple Maps or similar for US visualization
- No backend required yet - mock/stub APIs for now

## Your Task
Read the PRD and PROGRESS below. Then:

1. Pick the highest-priority uncompleted task (passes: false)
   - Prioritize architectural/risky work first
   - Then integration points
   - Then standard features

2. Implement ONE focused change

3. Run feedback loops:
   - cd apps/web && npm run build (typecheck)
   - cd apps/web && npm run lint (if available)

4. Append your progress to ralph/progress.txt:
   - Task completed
   - Key decisions made
   - Files changed

5. Mark the PRD item as passes: true

6. Make a git commit with a descriptive message

## Rules
- ONE task per iteration
- Small, focused changes
- Run feedback loops before committing
- If ALL tasks pass, output: <promise>COMPLETE</promise>

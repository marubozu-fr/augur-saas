---
name: fix-issue
description: Fix a GitHub issue end-to-end. Reads the issue, routes to the correct agent via labels, implements the fix, and opens a PR.
disable-model-invocation: true
---
Fix the GitHub issue: $ARGUMENTS

## 1. Read the issue

Run `gh issue view $ARGUMENTS --json title,body,labels,comments` to get full details and labels.

## 2. Read project state

Read `CLAUDE.md` before any implementation.

## 3. Determine the agent via labels

Read the labels array and look for an `agent-*` label:

- `agent-designer` → use the **ui-designer** agent
- `agent-frontend` → use the **frontend-dev** agent

**If no `agent-*` label is found, STOP and ask the user which agent to use.**
**If multiple `agent-*` labels are found, STOP and ask the user — one issue must have exactly one agent label.**

## 4. Create a feature branch

```bash
git checkout main && git pull
git checkout -b feature/$ARGUMENTS-<short-description>
```

## 5. Execute with the routed agent

### If agent-designer:
1. Read `docs/DESIGN_SYSTEM.md` if it exists
2. Read existing mockups in `docs/mockups/` for visual consistency
3. Produce the HTML/CSS mockup per the issue requirements
4. Update `docs/mockups/README.md` with the new mockup entry

### If agent-frontend:
1. Read `docs/mockups/` for the relevant page mockup — this is the visual contract
2. Read existing code patterns in `src/` before writing new code
3. Implement the changes following CLAUDE.md conventions
4. Run the quality checks:
   ```bash
   pnpm lint
   pnpm tsc --noEmit
   pnpm build
   ```
5. Fix any failures before proceeding

## 6. Commit and open a PR

```bash
git add -A
git commit -m "<type>(<scope>): <description> (closes #$ARGUMENTS)"
git push -u origin feature/$ARGUMENTS-<short-description>
gh pr create --title "<description>" --body "Closes #$ARGUMENTS"
```

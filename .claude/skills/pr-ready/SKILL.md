---
name: pr-ready
description: Run all quality checks before opening a PR. Linting, type checking, build, and code review.
disable-model-invocation: true
---
Run the full quality pipeline on the current branch before creating a PR.

1. **Lint check**
   - `pnpm lint`
   - Fix any issues found

2. **Type check**
   - `pnpm tsc --noEmit`
   - Fix any type errors

3. **Build check**
   - `pnpm build`
   - Ensure the production build succeeds

4. **Code review**
   - Use the **code-reviewer** agent to review the diff: `git diff main...HEAD`
   - Address all MUST FIX findings

5. **Security check** (if auth or API code changed)
   - Verify no secrets are exposed in client-side code
   - Verify Stripe webhook signatures are checked
   - Verify tier-gating is enforced server-side

6. **Design check** (if UI code changed)
   - Compare against the relevant mockup in `docs/mockups/`
   - Flag any deviations

7. **Summary**
   - List all files changed
   - List any remaining findings intentionally deferred
   - Confirm the branch is ready for PR
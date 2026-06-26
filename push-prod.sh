#!/usr/bin/env bash
set -euo pipefail

echo "=== Augur SaaS — Pre-deploy checks ==="

# Must be on main, with everything committed
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
  echo "✗ You are on '$BRANCH', not 'main'. Merge your PR first."
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "✗ Working directory is dirty. Commit or stash changes first."
  exit 1
fi

echo "→ Pulling latest main..."
git pull origin main

echo "→ Lint..."
pnpm lint

echo "→ TypeScript..."
pnpm tsc --noEmit

echo "→ Build..."
pnpm build

echo ""
echo "=== Checks passed. Deploying to production... ==="
vercel --prod

echo ""
echo "=== Done ==="
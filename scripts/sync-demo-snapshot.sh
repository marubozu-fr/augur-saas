#!/usr/bin/env bash
# Refreshes demo-data/ from a snapshot of results/*.json in the public Augur
# backend repository (marubozu-fr/augur). Used to serve stats in demo mode
# (NEXT_PUBLIC_DEMO_MODE=true) without a live backend — see src/lib/demo-mode.ts
# and src/services/augur-snapshot.ts.
#
# Usage: scripts/sync-demo-snapshot.sh [ref]
#   ref  Branch or tag to snapshot (git clone --branch does not accept a
#        commit SHA). Defaults to "main".
#
# The source repository's licence forbids redistributing per-session samples,
# so this script refuses to proceed if any results/*.json file contains a
# "samples" key.

set -euo pipefail

REF="${1:-main}"
REPO_URL="https://github.com/marubozu-fr/augur"
REPO_NAME="marubozu-fr/augur"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
DEMO_DATA_DIR="${REPO_ROOT}/demo-data"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "${TMP_DIR}"' EXIT

echo "Cloning ${REPO_URL} at ${REF}..."
git clone --quiet --depth 1 --branch "${REF}" "${REPO_URL}" "${TMP_DIR}/repo"

SOURCE_RESULTS_DIR="${TMP_DIR}/repo/results"
if [ ! -d "${SOURCE_RESULTS_DIR}" ]; then
  echo "error: ${SOURCE_RESULTS_DIR} not found" >&2
  exit 1
fi

echo "Checking for forbidden per-session samples..."
if grep -rl '"samples"' "${SOURCE_RESULTS_DIR}" --include="*.json" > /dev/null 2>&1; then
  echo "error: one or more results/*.json files contain a \"samples\" key." >&2
  echo "The source licence forbids redistributing per-session samples. Aborting." >&2
  grep -rl '"samples"' "${SOURCE_RESULTS_DIR}" --include="*.json" >&2
  exit 1
fi

echo "Replacing demo-data/results/ ..."
rm -rf "${DEMO_DATA_DIR}/results"
mkdir -p "${DEMO_DATA_DIR}/results"
find "${SOURCE_RESULTS_DIR}" -maxdepth 1 -name "*.json" ! -name ".tmp_*" -exec cp {} "${DEMO_DATA_DIR}/results/" \;

COMMIT_SHA="$(git -C "${TMP_DIR}/repo" rev-parse HEAD)"
cat > "${DEMO_DATA_DIR}/SOURCE" <<EOF
${REPO_NAME}
${COMMIT_SHA}
EOF

FILE_COUNT="$(find "${DEMO_DATA_DIR}/results" -name "*.json" | wc -l | tr -d ' ')"
echo "Done. Synced ${FILE_COUNT} files from ${REPO_NAME}@${COMMIT_SHA}."

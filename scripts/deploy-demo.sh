#!/usr/bin/env bash
# Deploys the demo (Vercel project augur-saas, no Git integration) from a clean
# copy of the repository, so nothing local (.env.local, untracked files, .git)
# can leak into the build.
#
# Usage: scripts/deploy-demo.sh [--dry-run] [ref]
#   ref        Branch, tag or commit to deploy. Defaults to "main".
#   --dry-run  Run everything (pull, install, build, checks) but stop right
#              before `vercel deploy`.
#
# Procedure: `git fetch origin` (abort if origin/<ref> exists and differs from
# the local <ref>), `git archive <ref>` into a temp directory, copy only
# .vercel/project.json, `vercel pull` (abort unless the pulled
# .vercel/.env.production.local sets NEXT_PUBLIC_DEMO_MODE to true),
# `pnpm install --frozen-lockfile`, `vercel build --prod`, then two checks:
#   (a) the functions' .vc-config.json files reference
#       demo-data/results/gap_fill.json (the snapshot is bundled);
#   (b) no "supabase.co" appears in .vercel/output/static (no Supabase URL in
#       the public bundle).
# Finally `vercel deploy --prebuilt --prod --archive=tgz`.

set -euo pipefail

usage() {
  echo "Usage: $(basename "$0") [--dry-run] [ref]" >&2
}

REF="main"
DRY_RUN=false
REF_SET=false

for arg in "$@"; do
  case "${arg}" in
    --dry-run)
      DRY_RUN=true
      ;;
    -*)
      echo "error: unknown option: ${arg}" >&2
      usage
      exit 1
      ;;
    *)
      if [ "${REF_SET}" = true ]; then
        echo "error: only one ref may be given" >&2
        usage
        exit 1
      fi
      REF="${arg}"
      REF_SET=true
      ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
PROJECT_JSON="${REPO_ROOT}/.vercel/project.json"

if [ ! -f "${PROJECT_JSON}" ]; then
  echo "error: ${PROJECT_JSON} not found." >&2
  echo "Link the project first: run \`vercel link\` in ${REPO_ROOT}." >&2
  exit 1
fi

echo "Fetching origin..."
git -C "${REPO_ROOT}" fetch origin
if REMOTE_SHA="$(git -C "${REPO_ROOT}" rev-parse --verify --quiet "refs/remotes/origin/${REF}^{commit}")"; then
  LOCAL_SHA="$(git -C "${REPO_ROOT}" rev-parse --verify --quiet "${REF}^{commit}" || true)"
  if [ "${LOCAL_SHA}" != "${REMOTE_SHA}" ]; then
    echo "error: local '${REF}' (${LOCAL_SHA:-missing}) differs from origin/${REF} (${REMOTE_SHA})." >&2
    echo "Run \`git pull\` on '${REF}' (or push your local commits) first." >&2
    exit 1
  fi
fi

if ! COMMIT_SHA="$(git -C "${REPO_ROOT}" rev-parse --verify "${REF}^{commit}" 2> /dev/null)"; then
  echo "error: '${REF}' is not a valid commit-ish in ${REPO_ROOT}" >&2
  exit 1
fi
echo "Deploying ${REF} (${COMMIT_SHA})"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "${TMP_DIR}"' EXIT

echo "Exporting a clean copy to ${TMP_DIR}..."
git -C "${REPO_ROOT}" archive "${COMMIT_SHA}" | tar -x -C "${TMP_DIR}"
mkdir -p "${TMP_DIR}/.vercel"
cp "${PROJECT_JSON}" "${TMP_DIR}/.vercel/project.json"

cd "${TMP_DIR}"

echo "Pulling Vercel production environment..."
vercel pull --yes --environment=production

ENV_FILE="${TMP_DIR}/.vercel/.env.production.local"
if ! grep -Eq '^NEXT_PUBLIC_DEMO_MODE="?true"?$' "${ENV_FILE}" 2> /dev/null; then
  echo "error: ${ENV_FILE} does not set NEXT_PUBLIC_DEMO_MODE to true." >&2
  echo "Set NEXT_PUBLIC_DEMO_MODE=true in the Vercel production environment. Aborting." >&2
  exit 1
fi
echo "  NEXT_PUBLIC_DEMO_MODE=true in the production environment"

echo "Installing dependencies..."
pnpm install --frozen-lockfile

echo "Building..."
vercel build --prod

echo "Check (a): functions bundle demo-data/results/gap_fill.json..."
FUNCTIONS_DIR="${TMP_DIR}/.vercel/output/functions"
if [ ! -d "${FUNCTIONS_DIR}" ]; then
  echo "error: ${FUNCTIONS_DIR} not found" >&2
  exit 1
fi
CONFIG_FILES="$(find "${FUNCTIONS_DIR}" -name .vc-config.json)"
MATCHES=""
if [ -n "${CONFIG_FILES}" ]; then
  GREP_STATUS=0
  # Paths from find are under a mktemp directory, so word splitting is safe.
  # shellcheck disable=SC2086
  MATCHES="$(grep -l 'demo-data/results/gap_fill.json' ${CONFIG_FILES})" || GREP_STATUS=$?
  if [ "${GREP_STATUS}" -gt 1 ]; then
    echo "error: grep failed (exit ${GREP_STATUS}) during check (a)" >&2
    exit 1
  fi
fi
if [ -z "${MATCHES}" ]; then
  echo "error: no .vc-config.json references demo-data/results/gap_fill.json." >&2
  echo "The snapshot is not bundled with the functions. Aborting." >&2
  exit 1
fi
echo "  OK ($(echo "${MATCHES}" | wc -l | tr -d ' ') function config(s) match)"

echo "Check (b): no Supabase URL in the public bundle..."
STATIC_DIR="${TMP_DIR}/.vercel/output/static"
if [ ! -d "${STATIC_DIR}" ]; then
  echo "error: ${STATIC_DIR} not found" >&2
  exit 1
fi
GREP_STATUS=0
OFFENDING="$(grep -rl 'supabase.co' "${STATIC_DIR}")" || GREP_STATUS=$?
if [ "${GREP_STATUS}" -gt 1 ]; then
  echo "error: grep failed (exit ${GREP_STATUS}) during check (b)" >&2
  exit 1
fi
if [ -n "${OFFENDING}" ]; then
  echo "error: 'supabase.co' found in the static output (Supabase URL in the public bundle):" >&2
  echo "${OFFENDING}" >&2
  exit 1
fi
echo "  OK"

if [ "${DRY_RUN}" = true ]; then
  echo "Dry run: checks passed, stopping before \`vercel deploy\` (${COMMIT_SHA})."
  exit 0
fi

echo "Deploying to production..."
vercel deploy --prebuilt --prod --archive=tgz
echo "Done. Deployed ${REF} (${COMMIT_SHA})."

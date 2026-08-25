#!/usr/bin/env bash

set -Eeuo pipefail
trap cleanup SIGINT SIGTERM ERR EXIT

usage() {
  cat << EOF
Usage: $(basename "${BASH_SOURCE[0]}") [-h] [--update] [--tests TEST...]

Run Playwright tests in a Docker container so visual snapshots render
identically on every machine.

Available options:

-h, --help          Print this help and exit
--update            Update snapshots instead of running tests
--tests TEST...     Run/update only spec files matching the specified names

Examples:

  $(basename "${BASH_SOURCE[0]}")                        # Run all tests
  $(basename "${BASH_SOURCE[0]}") --update               # Update all snapshots
  $(basename "${BASH_SOURCE[0]}") --tests search         # Run search specs only
EOF
  exit
}

CONTAINER_NAME=""

cleanup() {
  trap - SIGINT SIGTERM ERR EXIT
  if [[ -n "$CONTAINER_NAME" ]]; then
    docker stop "$CONTAINER_NAME" &> /dev/null || true
    docker rm "$CONTAINER_NAME" &> /dev/null || true
  fi
}

die() {
  echo >&2 -e "${1-}"
  exit "${2-1}"
}

update_mode=0
test_patterns=()

while :; do
  case "${1-}" in
  -h | --help) usage ;;
  --update) update_mode=1 ;;
  --) ;; # Skip npm argument separator
  --tests)
    shift
    while [[ $# -gt 0 ]] && [[ ! "${1-}" =~ ^- ]] || [[ "${1-}" == "--" ]]; do
      [[ "${1-}" == "--" ]] && shift && continue
      test_patterns+=("$1")
      shift
    done
    continue
    ;;
  -?*) die "Unknown option: $1" ;;
  *) break ;;
  esac
  shift
done

command -v docker &> /dev/null || die "Docker is required but not found."
docker info &> /dev/null || die "Docker daemon is not running."

# Keep the image version in lockstep with the installed @playwright/test.
PLAYWRIGHT_VERSION=$(node -p "require('./node_modules/@playwright/test/package.json').version")
IMAGE="mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-noble"

playwright_cmd="npx playwright test"

for pattern in "${test_patterns[@]}"; do
  playwright_cmd="$playwright_cmd tests/*${pattern}*.spec.js"
done

if [[ $update_mode -eq 1 ]]; then
  playwright_cmd="$playwright_cmd --update-snapshots"
  echo "Updating snapshots in Docker container..."
else
  echo "Running tests in Docker container..."
fi

CONTAINER_NAME="edr-e2e-$$"

# node_modules lives in a Docker-managed named volume so the container's
# Linux install never touches the host's node_modules.
docker run --rm --name "$CONTAINER_NAME" --init \
  -e E2E_IN_DOCKER=1 \
  -e CI \
  -v "$(pwd)":/work \
  -v edr-e2e-node-modules:/work/node_modules \
  -v edr-e2e-npm-cache:/root/.npm \
  -w /work \
  "$IMAGE" \
  bash -c "npm ci --no-audit --no-fund &> /dev/null; $playwright_cmd; status=\$?; chown -R $(id -u):$(id -g) /work/test-results /work/playwright-report /work/tests /work/adrs /work/dist &> /dev/null || true; exit \$status"

echo ""
if [[ $update_mode -eq 1 ]]; then
  echo "Snapshot update complete!"
else
  echo "Tests complete!"
fi

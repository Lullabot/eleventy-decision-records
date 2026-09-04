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
  ELEVENTY_VERSION=canary $(basename "${BASH_SOURCE[0]}")  # Run against another Eleventy
  E2E_A11Y=1 $(basename "${BASH_SOURCE[0]}")              # Run the axe accessibility suite
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

# The ${a[@]+"${a[@]}"} form keeps `set -u` from treating an empty array as
# unset, which it does on bash 3.2 — the version macOS still ships.
for pattern in ${test_patterns[@]+"${test_patterns[@]}"}; do
  playwright_cmd="$playwright_cmd tests/*${pattern}*.spec.js"
done

if [[ $update_mode -eq 1 ]]; then
  playwright_cmd="$playwright_cmd --update-snapshots"
  echo "Updating snapshots in Docker container..."
else
  echo "Running tests in Docker container..."
fi

CONTAINER_NAME="edr-e2e-$$"

# Everything the container writes into the bind mount, listed explicitly
# rather than chowning /work/tests wholesale: that directory now holds
# the fixture site's node_modules volume, and recursing through it would
# cost thousands of needless chowns on every run.
CHOWN_PATHS="/work/test-results \
  /work/playwright-report \
  /work/tests/visual.spec.js-snapshots \
  /work/tests/fixture-site/_site \
  /work/dist-package"

# Both node_modules trees live in Docker-managed named volumes so the
# container's Linux installs never touch the host's. The fixture site
# needs its own: it sits inside the bind mount, so without a volume of
# its own the Linux binaries the fixture install writes would land in
# the host working tree.
# A separate fixture volume per Eleventy version keeps the two installs
# from replacing each other on every switch.
FIXTURE_VOLUME="edr-e2e-fixture-node-modules${ELEVENTY_VERSION:+-$ELEVENTY_VERSION}"

docker run --rm --name "$CONTAINER_NAME" --init \
  -e E2E_IN_DOCKER=1 \
  -e CI \
  -e ELEVENTY_VERSION \
  -e E2E_A11Y \
  -v "$(pwd)":/work \
  -v edr-e2e-node-modules:/work/node_modules \
  -v "$FIXTURE_VOLUME":/work/tests/fixture-site/node_modules \
  -v edr-e2e-npm-cache:/root/.npm \
  -w /work \
  "$IMAGE" \
  bash -c "npm ci --no-audit --no-fund &> /dev/null; $playwright_cmd; status=\$?; chown -R $(id -u):$(id -g) $CHOWN_PATHS &> /dev/null || true; exit \$status"

echo ""
if [[ $update_mode -eq 1 ]]; then
  echo "Snapshot update complete!"
else
  echo "Tests complete!"
fi

#!/usr/bin/env bash
#
# Live development loop. The plugin runs from dist/, so three processes
# keep it current while the fixture site serves: tsc recompiles the
# TypeScript, build.ts --watch mirrors the static files and relays every
# dist/ change to Eleventy by touching the fixture's config file.

set -Eeuo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

bash bin/link-fixture-site.sh

cleanup() {
  trap - EXIT INT TERM
  kill 0
}
trap cleanup EXIT INT TERM

npx tsc -p tsconfig.json --watch --preserveWatchOutput &
node bin/build.ts --watch &
# --preserve-symlinks keeps the linked theme under the fixture's
# node_modules; Eleventy 3.1.7's watcher stops working on Linux as soon
# as any watch target starts with ../ (see touchFixtureConfig in build.ts).
DECISION_RECORDS_DEV=1 NODE_OPTIONS=--preserve-symlinks \
  npm --prefix tests/fixture-site run serve &

wait

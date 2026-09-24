#!/usr/bin/env bash
#
# Links the working tree into the fixture site for live theme development.
# The symlink replaces the packed tarball that prepare-fixture-site.sh
# installs; running that script again (or any test command) swaps it back.

set -Eeuo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SITE="$REPO_ROOT/tests/fixture-site"

cd "$SITE"
npm install --no-audit --no-fund --silent
npm install --no-audit --no-fund --silent --no-save "file:$REPO_ROOT"
echo "Linked $(readlink node_modules/@lullabot/eleventy-decision-records) into tests/fixture-site"

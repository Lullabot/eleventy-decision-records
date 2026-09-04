#!/usr/bin/env bash
#
# Installs the packed theme into the Playwright fixture site.
#
# Installing a tarball rather than linking the working tree is the whole
# point: a file: dependency symlinks the checkout, so it exercises
# neither "files" nor "exports" — the two fields most likely to break a
# published package while every local build stays green.
#
# CI packs once in a separate job and leaves the tarball in dist-package/;
# local runs have no such artifact, so pack on demand.

set -Eeuo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SITE="$REPO_ROOT/tests/fixture-site"
PACKAGE_DIR="$REPO_ROOT/dist-package"

mkdir -p "$PACKAGE_DIR"

TARBALL="$(ls -t "$PACKAGE_DIR"/*.tgz 2> /dev/null | head -1 || true)"

# Repack when there is no artifact, or when the package has been edited
# since the one sitting there was built. Reusing unconditionally would
# mean a change to src/ gets silently tested against a stale build. In
# CI the downloaded artifact is newer than the checkout, so it is reused
# as intended.
if [[ -z "$TARBALL" ]] ||
  [[ -n "$(find "$REPO_ROOT/src" "$REPO_ROOT/package.json" -newer "$TARBALL" -print -quit)" ]]; then
  echo "Packing the theme..."
  rm -f "$PACKAGE_DIR"/*.tgz
  (cd "$REPO_ROOT" && npm pack --silent --pack-destination "$PACKAGE_DIR" > /dev/null)
  TARBALL="$(ls -t "$PACKAGE_DIR"/*.tgz | head -1)"
fi
echo "Installing $(basename "$TARBALL") into tests/fixture-site"

cd "$SITE"
npm install --no-audit --no-fund --silent
# --no-save keeps the tarball out of package.json. It has to run after
# the dependency install, which would otherwise prune an unsaved package.
# ELEVENTY_VERSION swaps in another Eleventy (a tag like `canary` or an
# exact version) for this run only; the lockfile pin is the default.
UNSAVED=("$TARBALL")
if [[ -n "${ELEVENTY_VERSION:-}" ]]; then
  echo "Using @11ty/eleventy@${ELEVENTY_VERSION}"
  UNSAVED+=("@11ty/eleventy@${ELEVENTY_VERSION}")
fi
npm install --no-audit --no-fund --silent --no-save "${UNSAVED[@]}"

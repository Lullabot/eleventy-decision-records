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

if ! compgen -G "$PACKAGE_DIR/*.tgz" > /dev/null; then
  echo "No packed theme in dist-package/; packing now..."
  (cd "$REPO_ROOT" && npm pack --silent --pack-destination "$PACKAGE_DIR" > /dev/null)
fi

TARBALL="$(ls -t "$PACKAGE_DIR"/*.tgz | head -1)"
echo "Installing $(basename "$TARBALL") into tests/fixture-site"

cd "$SITE"
npm install --no-audit --no-fund --silent
# --no-save keeps the tarball out of package.json. It has to run after
# the dependency install, which would otherwise prune an unsaved package.
npm install --no-audit --no-fund --silent --no-save "$TARBALL"

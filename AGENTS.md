# AGENTS.md

This file provides guidance to AI agents when working with code in this repository.

## Project Overview

An Eleventy (v3) theme plugin, published to npm as `@lullabot/eleventy-decision-records`, that gives a consuming site everything it needs to document architectural decision records (ADRs). Consumers install it and register it in their Eleventy config; they do not clone this repository. Uses ESM (`"type": "module"`), and Eleventy itself is a peer dependency rather than a dependency.

The distinction that matters most when changing code here: this repository is the _package_, not a site. There is no Eleventy config, no input directory, and no build script at the root. The only site that gets built is `tests/fixture-site/`, which installs the packaged theme the way a real consumer would.

## Documentation

Each topic has a single source of truth — update these rather than duplicating notes here:

- [README.md](README.md) — installing and registering the plugin
- [docs/architecture.md](docs/architecture.md) — package layout, what the plugin registers, the override model, search pipeline. Read this before making non-trivial code changes
- [docs/development.md](docs/development.md) — commands, the fixture site, testing, code style, CI/deployment
- [docs/writing-adrs.md](docs/writing-adrs.md) — ADR naming convention and frontmatter fields
- [docs/customizing.md](docs/customizing.md) — consumer-facing plugin options and overrides

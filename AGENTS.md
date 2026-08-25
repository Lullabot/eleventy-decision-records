# AGENTS.md

This file provides guidance to AI agents when working with code in this repository.

## Project Overview

A GitHub template repo providing an Eleventy (v3) static site for documenting architectural decision records (ADRs). Intended for client projects and agencies to clone via "Use this template". Uses ESM (`"type": "module"`).

## Documentation

Each topic has a single source of truth — update these rather than duplicating notes here:

- [README.md](README.md) — getting started
- [docs/architecture.md](docs/architecture.md) — project structure, Eleventy module groups, search pipeline, templates, assets. Read this before making non-trivial code changes
- [docs/development.md](docs/development.md) — commands, dev-server caveats, code style, CI/deployment
- [docs/writing-adrs.md](docs/writing-adrs.md) — ADR naming convention and frontmatter fields
- [docs/customizing.md](docs/customizing.md) — consumer-facing configuration (`site.json`, practice areas, branding)

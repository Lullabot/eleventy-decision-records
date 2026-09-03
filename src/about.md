---
title: About
description: What are architectural decision records and how we use them
permalink: /about/
eleventyExcludeFromCollections: true
---

## What is an ADR?

An Architectural Decision (AD) is a software design choice that addresses a functional or non-functional requirement that is architecturally significant. An Architectural Decision Record (ADR) captures a single AD — the collection of ADRs created and maintained in a project constitutes its decision log.

An ADR is immutable once accepted, beyond simple fixes and improvements that don't change the substance of the decision. Otherwise, only its status can change (i.e., become deprecated or superseded). Team members can become familiar with the whole history of decisions by reading the decision log in chronological order.

## Why keep decision records?

- **Onboarding** — New team members can quickly understand why things are built the way they are
- **Accountability** — Avoid blindly accepting or reversing past decisions without understanding the original context
- **Process** — Formalize how the team evaluates and agrees on architectural choices

## How to contribute

Create a new markdown file in the `{{ dirs.decisions }}/` directory using the naming convention `YYYYMMDD-url-friendly-name.md`. Use the decision template as a starting point and fill in the required frontmatter fields:

- **date** — When the decision was made
- **status** — `accepted` or `deprecated`
- **practiceArea** — One of: Design, Engineering, Project Management, Strategy
- **topics** — Freeform tags describing what the decision covers
- **contributors** — Team members involved in making the decision
- **title** — A concise summary of the decision
- **context** — Brief description of the problem or situation

## License

This work is licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).

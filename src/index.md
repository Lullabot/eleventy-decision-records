---
title: Decision Records
description: Documented architectural decisions and best practices
eleventyExcludeFromCollections: true
---

# {{ title }}

An Architectural Decision Record (ADR) captures a single software design choice that addresses an architecturally significant requirement. Our collection of ADRs forms a decision log that helps the team understand the history and reasoning behind key choices.

Maintaining these records helps us:

- Speed up onboarding for new team members
- Avoid blindly accepting or reversing past decisions
- Formalize the decision-making process across the team

{% if collections.practiceAreas | length %}
<h2 class="section-heading" id="practice-areas">Explore by Practice Area</h2>

<div class="practice-areas">
{%- for area in collections.practiceAreas %}
  {%- set areaAdrs = collections.adrs | withPracticeArea(area.name) %}
  <a href="/practice-areas/{{ area.name | slugify }}/" class="practice-area">
    <span class="icon">{% icon area.icon %}</span>
    <span class="name">{{ area.name }}</span>
    <span class="count">{{ areaAdrs | length }}</span>
  </a>
{%- endfor %}
</div>
{%- endif %}

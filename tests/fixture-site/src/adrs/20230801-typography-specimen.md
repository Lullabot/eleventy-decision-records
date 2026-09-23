---
date: 2023-08-01
status: accepted
practiceArea: Design
topics:
  - lorem
  - dolor
contributors:
  - Magna Aliqua
  - Dolor Amet

title: Typography specimen covering every heading level and inline element
context: Exercises the prose styles real decision records rely on, from h1 to h6 and each inline element Markdown or raw HTML can produce.
---

# Heading level one

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Records migrated from older tools sometimes open their sections with a level-one heading, so the body has to cope with a second `h1` below the page title.

## Heading level two

Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

### Heading level three

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

#### Heading level four

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

##### Heading level five

Curabitur pretium tincidunt lacus. Nulla gravida orci a odio.

###### Heading level six

Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris.

## Inline elements from Markdown

Text can be **strong**, _emphasised_, **_both at once_**, or ~~struck through~~. It can hold `inline code`, an [inline link](https://www.lullabot.com/), a [reference link][reference], a [link to another decision](/adrs/20240115-fixture-decision-record/), a [link to a heading on this page](#heading-level-two), an autolink such as <https://www.lullabot.com/>, and an email link to <mailto:lorem@example.com>.

A line can end in two spaces  
to force a hard break, or in a backslash\
for the same result.

Bare URLs such as https://www.lullabot.com/ stay plain text unless linkify is enabled.

[reference]: https://www.lullabot.com/ 'Reference link title'

## Inline elements from HTML

<abbr title="Architectural Decision Record">ADR</abbr> is an abbreviation. <b>Bold</b> and <i>italic</i> carry no extra meaning, unlike <strong>strong</strong> and <em>em</em>. <mark>Marked text</mark> is highlighted, <small>small print</small> is de-emphasised, <s>no longer accurate</s> text is struck, and <u>underlined</u> text is annotated.

<del>Deleted text</del> and <ins>inserted text</ins> track edits. <q>A short inline quotation</q> sits in a sentence, and <cite>The Title of a Work</cite> is cited. <dfn>Definition</dfn> marks a term being defined.

Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> to open the palette. The command printed <samp>Build complete</samp>, and <var>x</var> is a variable. Water is H<sub>2</sub>O and E = mc<sup>2</sup>. The decision was made on <time datetime="2023-08-01">1 August 2023</time>.

Non-ASCII text should render cleanly: Gabriel García Márquez, Antonín Dvořák, Søren Kierkegaard, “curly quotes”, an en dash (–), an ellipsis (…) and an emoji ✅.

## Block elements

> A blockquote spanning a couple of sentences. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
>
> A second paragraph inside the same quote, with **strong** and `code` in it.

- An unordered list item
- An item with a nested list
  - A nested item
  - Another nested item with `code`
    - A third level
- A final item

1. An ordered list item
2. An item with a nested list
   1. A nested ordered item
   2. Another nested ordered item
3. A final item

---

A paragraph after a horizontal rule.

<!-- An HTML comment, which should not appear on the page. -->

![Lullabot logo](/favicon.svg)

---
date: 2023-08-03
status: accepted
practiceArea: Engineering
topics:
  - lorem
  - dolor
contributors:
  - Magna Aliqua

title: Syntax highlighting across every language our records use
context: One fenced block per language tag found in real decision records, plus one without a tag, so highlighting can be checked in one place.
---

## Shell

`sh`:

```sh
# Run database updates before importing configuration.
drush updatedb --no-cache-clear --yes
drush cache:rebuild
drush config:import --yes
```

`shell`:

```shell
git diff-tree \
  -r --no-commit-id --name-only HEAD \
  | grep '\.php$' \
  | xargs vendor/bin/phpstan analyse
```

`console`:

```console
$ ddev drush uli --no-browser
http://example.ddev.site/user/reset/1/1690000000/abc123/login
```

## Web

`html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <script src="/js/app.js" defer></script>
  </head>
  <body>
    <main id="main">Lorem ipsum</main>
  </body>
</html>
```

`css`:

```css
.site-header {
  position: relative;
  isolation: isolate;
  z-index: 1;
}

@media (min-width: 48rem) {
  .site-header {
    display: grid;
    grid-template-columns: 1fr auto;
  }
}
```

`js`:

```js
'use strict';

export function timeSince(isoDate, now = new Date()) {
  const days = Math.floor((now - new Date(isoDate)) / 86_400_000);
  return days === 1 ? '1 day ago' : `${days} days ago`;
}
```

## Server

`php`:

```php
<?php

declare(strict_types=1);

namespace Drupal\example\Hook;

final class EntityHooks {

  public function presave(EntityInterface $entity): void {
    if ($entity->bundle() === 'article') {
      $entity->set('status', TRUE);
    }
  }

}
```

## Data and configuration

`json`:

```json
{
  "extra": {
    "patches": {
      "drupal/core": {
        "Fix lorem ipsum": "https://www.drupal.org/files/issues/lorem.patch"
      }
    }
  }
}
```

`yaml`:

```yaml
langcode: en
status: true
dependencies:
  module:
    - environment_indicator
name: Production
fg_color: '#ffffff'
bg_color: '#d0021b'
```

`yml`:

```yml
name: Lint
on:
  pull_request:
jobs:
  lint:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0 # v7.0.0
```

`xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ruleset name="example">
  <file>web/modules/custom</file>
  <rule ref="Drupal"/>
  <rule ref="SlevomatCodingStandard.TypeHints.DeclareStrictTypes"/>
</ruleset>
```

## Prose

`markdown`:

```markdown
## Decision

Use **composer-patches** and list every patch in `composer.json`.

- One patch per issue
- Link to the issue
```

`md`:

```md
# Project Name

A short description of the project, with a [link](https://example.com).
```

`txt`:

```txt
Issue #3412345: Lorem ipsum dolor sit amet
https://www.drupal.org/project/drupal/issues/3412345
```

## No language

```
A fenced block without a language tag.
It should still be monospaced and scroll if a line runs longer than the column it sits in, like this one does when it keeps going.
```

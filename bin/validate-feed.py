#!/usr/bin/env python3
"""Validates a built feed with the W3C Feed Validation Service's checker.

Usage: validate-feed.py <file> <url>

<url> is where the feed is published, so its rel="self" link is checked
against it. Needs https://github.com/w3c/feedvalidator's src/ directory on
PYTHONPATH. Prints each error or warning and exits 1 if there are any, at
the online validator's level ("AA").
"""

import sys

import feedvalidator
from feedvalidator import compatibility
from feedvalidator.formatter.text_plain import Formatter

path, url = sys.argv[1:3]
with open(path, 'rb') as feed:
    try:
        events = feedvalidator.validateStream(feed, firstOccurrenceOnly=1, base=url)['loggedEvents']
    except feedvalidator.logging.ValidationFailure as failure:
        events = [failure.event]

output = Formatter(compatibility.AA(events))
if output:
    print('\n'.join(output))
    sys.exit(1)

import { create, load, search } from '/js/orama/index.js';
import type { Orama, RawData } from '/js/orama/index.js';
import { timeSince } from './time-since.js';

function must<T extends Element = Element>(
  root: ParentNode,
  selector: string,
): T {
  const element = root.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Search dialog is missing element: ${selector}`);
  }
  return element;
}

function highlightTerms(text: string, terms: string[]): string {
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const pattern = terms
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  return escaped.replace(new RegExp(`(${pattern})`, 'gi'), '<mark>$1</mark>');
}

function getSnippet(text: string, terms: string[], contextChars = 80): string {
  const lowerText = text.toLowerCase();
  let bestIndex = -1;

  for (const term of terms) {
    const idx = lowerText.indexOf(term);
    if (idx !== -1) {
      bestIndex = idx;
      break;
    }
  }

  if (bestIndex === -1) {
    return '';
  }

  const start = Math.max(0, bestIndex - contextChars);
  const end = Math.min(text.length, bestIndex + contextChars);
  let snippet = text.slice(start, end).trim();
  if (start > 0) {
    snippet = `\u2026${snippet}`;
  }
  if (end < text.length) {
    snippet = `${snippet}\u2026`;
  }

  return highlightTerms(snippet, terms);
}

(() => {
  const dialog = document.getElementById('search-dialog');
  if (!dialog) {
    throw new Error('Search dialog is missing element: #search-dialog');
  }
  const searchInput = must<HTMLInputElement>(dialog, 'input[type="search"]');
  const resultsList = must<HTMLOListElement>(dialog, 'ol');
  const summary = must(dialog, '.results-summary');
  const status = must(dialog, '[aria-live="polite"]');

  // Debounce announcements past the typing echo (VoiceOver's echo preempts
  // polite announcements rather than queueing behind them), and write in a
  // single mutation — every region mutation can cancel in-flight speech.
  let announceTimer: ReturnType<typeof setTimeout> | undefined;
  function announce(text: string): void {
    summary.textContent = text;
    clearTimeout(announceTimer);
    announceTimer = setTimeout(() => {
      status.textContent = text;
    }, 150);
  }
  const resultTemplate = must<HTMLTemplateElement>(dialog, 'template').content;

  const SCHEMA = {
    url: 'string',
    title: 'string',
    topics: 'string[]',
    context: 'string',
    content: 'string',
    status: 'string',
    date: 'string',
  } as const;

  let db: Orama<typeof SCHEMA> | undefined;
  let initPromise: Promise<void> | null = null;

  function initializeSearch(): Promise<void> {
    initPromise ??= (async () => {
      const response = await fetch('/searchindex.json');
      if (!response.ok) {
        throw new Error(`Search index returned ${response.status}`);
      }
      const rawData = (await response.json()) as RawData;

      db = create({ schema: SCHEMA });
      load(db, rawData);
    })().catch((error: unknown) => {
      // Allow the next search to retry the fetch.
      initPromise = null;
      throw error;
    });
    return initPromise;
  }

  async function doSearch(): Promise<void> {
    const query = searchInput.value.trim();
    if (!query) {
      resultsList.innerHTML = '';
      clearTimeout(announceTimer);
      summary.textContent = '';
      status.textContent = '';
      return;
    }

    resultsList.innerHTML = '';
    const loading = document.createElement('li');
    loading.textContent = 'Loading search\u2026';
    resultsList.append(loading);

    try {
      await initializeSearch();
    } catch {
      resultsList.innerHTML = '';
      announce('Search is unavailable right now — please try again.');
      return;
    }

    if (!db) {
      throw new Error('Search index loaded without creating a database');
    }

    const { hits } = await search(db, {
      term: query,
      properties: ['title', 'topics', 'context', 'content'],
      boost: { title: 3, topics: 2, context: 1.5 },
      tolerance: 1,
      threshold: 0.6,
      limit: 50,
    });

    const queryTerms = query
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 0);

    const results = hits.map((hit) => ({
      ...hit.document,
      href: hit.document.url,
      snippet: getSnippet(hit.document.content, queryTerms),
    }));

    results.sort((a, b) => {
      if (a.status === b.status) return 0;
      if (a.status === 'deprecated') return 1;
      if (b.status === 'deprecated') return -1;
      return 0;
    });

    const entries = results.map((result, i) => {
      const entry = resultTemplate.cloneNode(true);
      if (!(entry instanceof DocumentFragment)) {
        throw new Error('Search dialog template did not clone to a fragment');
      }

      const li = must<HTMLElement>(entry, 'li');
      li.style.animationDelay = `${i * 50}ms`;

      const link = must<HTMLAnchorElement>(entry, 'a');
      link.innerHTML = highlightTerms(result.title, queryTerms);
      link.href = result.href;
      must(entry, '.snippet').innerHTML = result.snippet;
      must(entry, '.status').textContent = result.status;
      must(entry, '.age').textContent = timeSince(result.date);

      const tagsEl = must(entry, '.tags');
      for (const tag of result.topics) {
        const span = document.createElement('span');
        span.textContent = tag;
        tagsEl.append(span);
      }

      return entry;
    });

    resultsList.innerHTML = '';
    resultsList.append(...entries);
    if (entries.length) {
      const s = entries.length === 1 ? '' : 's';
      announce(`${entries.length} result${s} for \u201c${query}\u201d`);
    } else {
      announce(`No results found for \u201c${query}\u201d`);
    }
  }

  // Start fetching the index on the first keystroke, ahead of the debounce.
  searchInput.addEventListener(
    'input',
    () => {
      initializeSearch().catch(() => {});
    },
    { once: true },
  );

  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      void doSearch();
    }, 250);
  });
})();

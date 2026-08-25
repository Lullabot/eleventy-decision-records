import { create, load, search } from '/js/orama/index.js';
import { timeSince } from './time-since.js';

function highlightTerms(text, terms) {
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const pattern = terms
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  return escaped.replace(new RegExp(`(${pattern})`, 'gi'), '<mark>$1</mark>');
}

function getSnippet(text, terms, contextChars = 80) {
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

(async () => {
  const dialog = document.getElementById('search-dialog');
  const searchInput = dialog.querySelector('input[type="search"]');
  const resultsList = dialog.querySelector('ol');
  const summary = dialog.querySelector('.results-summary');
  const status = dialog.querySelector('[aria-live="polite"]');

  // Debounce announcements past the typing echo (VoiceOver's echo preempts
  // polite announcements rather than queueing behind them), and write in a
  // single mutation — every region mutation can cancel in-flight speech.
  let announceTimer;
  function announce(text) {
    summary.textContent = text;
    clearTimeout(announceTimer);
    announceTimer = setTimeout(() => {
      status.textContent = text;
    }, 150);
  }
  const resultTemplate = dialog.querySelector('template').content;

  let db;
  let initPromise = null;

  const SCHEMA = {
    url: 'string',
    title: 'string',
    topics: 'string[]',
    context: 'string',
    content: 'string',
    status: 'string',
    date: 'string',
  };

  function initializeSearch() {
    initPromise ??= (async () => {
      const response = await fetch('/searchindex.json');
      if (!response.ok) {
        throw new Error(`Search index returned ${response.status}`);
      }
      const rawData = await response.json();

      db = create({ schema: SCHEMA });
      load(db, rawData);
    })().catch((error) => {
      // Allow the next search to retry the fetch.
      initPromise = null;
      throw error;
    });
    return initPromise;
  }

  async function doSearch() {
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

    const { hits } = search(db, {
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

    let results = hits.map((hit) => ({
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

    results = results.map((result, i) => {
      const entry = resultTemplate.cloneNode(true);

      const li = entry.querySelector('li');
      li.style.animationDelay = `${i * 50}ms`;

      entry.querySelector('a').innerHTML = highlightTerms(
        result.title,
        queryTerms,
      );
      entry.querySelector('a').href = result.href;
      entry.querySelector('.snippet').innerHTML = result.snippet;
      entry.querySelector('.status').textContent = result.status;
      entry.querySelector('.age').textContent = timeSince(result.date);

      const tagsEl = entry.querySelector('.tags');
      for (const tag of result.topics) {
        const span = document.createElement('span');
        span.textContent = tag;
        tagsEl.append(span);
      }

      return entry;
    });

    resultsList.innerHTML = '';
    resultsList.append(...results);
    if (results.length) {
      const s = results.length === 1 ? '' : 's';
      announce(`${results.length} result${s} for \u201c${query}\u201d`);
    } else {
      announce(`No results found for \u201c${query}\u201d`);
    }
  }

  // Start fetching the index on the first keystroke, ahead of the debounce.
  searchInput.addEventListener(
    'input',
    () => initializeSearch().catch(() => {}),
    { once: true },
  );

  let debounceTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(doSearch, 250);
  });
})();

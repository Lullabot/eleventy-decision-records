import { create, load, search } from '/js/orama/index.js';

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
  const resultTemplate = dialog.querySelector('template').content;

  let db;
  const { promise: searchReady, resolve: makeSearchReady } =
    Promise.withResolvers();

  const SCHEMA = {
    url: 'string',
    title: 'string',
    topics: 'string[]',
    context: 'string',
    content: 'string',
    status: 'string',
    timeSince: 'string',
  };

  async function initializeSearch() {
    const response = await fetch('/searchindex.json');
    const rawData = await response.json();

    db = create({ schema: SCHEMA });
    load(db, rawData);

    makeSearchReady();
  }

  async function doSearch() {
    const query = searchInput.value.trim();
    if (!query) {
      resultsList.innerHTML = '';
      return;
    }

    resultsList.innerHTML = '';
    const loading = document.createElement('li');
    loading.textContent = 'Loading search\u2026';
    loading.setAttribute('aria-live', 'polite');
    resultsList.append(loading);

    await searchReady;

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
      entry.querySelector('.age').textContent = result.timeSince;

      const tagsEl = entry.querySelector('.tags');
      tagsEl.innerHTML = result.topics
        .map((tag) => `<span>${tag}</span>`)
        .join('');

      return entry;
    });

    resultsList.innerHTML = '';
    if (results.length) {
      resultsList.append(...results);
    } else {
      const noResults = document.createElement('li');
      noResults.textContent = `No results found for \u201c${query}\u201d`;
      resultsList.append(noResults);
    }
  }

  searchInput.addEventListener('input', initializeSearch, { once: true });

  let debounceTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(doSearch, 250);
  });
})();

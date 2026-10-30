type TemporalApi = typeof import('@js-temporal/polyfill').Temporal;

const Temporal: TemporalApi =
  (globalThis as { Temporal?: TemporalApi }).Temporal ??
  (await import('@js-temporal/polyfill')).Temporal;

/**
 * Returns a relative time string (e.g. "3 months ago").
 *
 * @example
 * {{ adr.data.date | timeSince }}
 * → "3 months ago"
 */
export function timeSince(date: Date | string): string {
  const from = Temporal.PlainDate.from(
    new Date(date).toISOString().slice(0, 10),
  );
  const now = Temporal.Now.plainDateISO();
  const duration = from.until(now, { largestUnit: 'years' });
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'always' });

  if (duration.years > 0) {
    return rtf.format(-duration.years, 'year');
  }
  if (duration.months > 0) {
    return rtf.format(-duration.months, 'month');
  }
  if (duration.days > 0) {
    return rtf.format(-duration.days, 'day');
  }
  return 'today';
}

/**
 * Formats a date as "Month DD, YYYY".
 *
 * @example
 * {{ adr.data.date | datetimeFormat }}
 * → "January 1, 2024"
 */
export function datetimeFormat(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Returns the current four-digit year.
 *
 * @example
 * {{ null | year }}
 * → "2026"
 */
export function year(): string {
  return new Date().getFullYear().toString();
}

/**
 * Returns an ISO date string (YYYY-MM-DD) for use in <time datetime>.
 *
 * @example
 * {{ adr.data.date | isoDate }}
 * → "2024-01-01"
 */
export function isoDate(date: Date | string): string {
  return new Date(date).toISOString().slice(0, 10);
}

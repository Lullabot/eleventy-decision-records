// TODO: Replace with Temporal (matching src/lib/filters/dates.js) once
// browser support is baseline:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal#browser_compatibility
export function timeSince(isoDate) {
  const then = new Date(isoDate);
  const now = new Date();
  let years = now.getUTCFullYear() - then.getUTCFullYear();
  let months = now.getUTCMonth() - then.getUTCMonth();
  let days = now.getUTCDate() - then.getUTCDate();

  if (days < 0) {
    months -= 1;
    days += new Date(now.getUTCFullYear(), now.getUTCMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'always' });
  if (years > 0) {
    return rtf.format(-years, 'year');
  }
  if (months > 0) {
    return rtf.format(-months, 'month');
  }
  if (days > 0) {
    return rtf.format(-days, 'day');
  }
  return 'today';
}

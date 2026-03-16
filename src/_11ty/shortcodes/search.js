import { create, insert, save } from '@orama/orama';
import striptags from 'striptags';
import he from 'he';
import { timeSince } from '../filters/dates.js';

const SCHEMA = {
  url: 'string',
  title: 'string',
  topics: 'string[]',
  context: 'string',
  content: 'string',
  status: 'string',
  timeSince: 'string',
};

export async function oramaIndex(adrs) {
  const db = create({ schema: SCHEMA });

  for (const adr of adrs) {
    insert(db, {
      url: adr.page.url,
      title: adr.data.title,
      topics: adr.data.topics || [],
      context: adr.data.context || '',
      content: he.decode(striptags(adr.content)),
      status: adr.data.status,
      timeSince: timeSince(adr.data.date),
    });
  }

  return JSON.stringify(save(db));
}

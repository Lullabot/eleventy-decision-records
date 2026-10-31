import { create, insert, save } from '@orama/orama';
import striptags from 'striptags';
import { decode } from 'he';
import { isoDate } from '../filters/dates.js';
import type { AdrItem } from '../../types.js';

const SCHEMA = {
  url: 'string',
  title: 'string',
  topics: 'string[]',
  context: 'string',
  content: 'string',
  status: 'string',
  date: 'string',
} as const;

export async function oramaIndex(adrs: AdrItem[]): Promise<string> {
  const db = create({ schema: SCHEMA });

  for (const adr of adrs) {
    await insert(db, {
      url: adr.page.url,
      title: adr.data.title,
      topics: adr.data.topics || [],
      context: adr.data.context || '',
      content: decode(striptags(adr.content)),
      status: adr.data.status,
      date: isoDate(adr.data.date),
    });
  }

  return JSON.stringify(save(db));
}

#!/usr/bin/env node

import { writeFileSync, readdirSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import practiceAreasData from '../src/_data/practiceAreas.json' with { type: 'json' };

const __dirname = dirname(fileURLToPath(import.meta.url));
const adrsDir = join(__dirname, '..', 'adrs');

const practiceAreas = practiceAreasData.map((p) => p.name);

const perArea = 10;
const total = practiceAreas.length * perArea;

const loremTitles = [
  'Lorem ipsum dolor sit amet',
  'Consectetur adipiscing elit sed',
  'Ut enim ad minim veniam',
  'Duis aute irure dolor reprehenderit',
  'Excepteur sint occaecat cupidatat non',
  'Sed ut perspiciatis unde omnis',
  'Nemo enim ipsam voluptatem quia',
  'Neque porro quisquam est qui',
  'Quis autem vel eum iure',
  'At vero eos et accusamus',
  'Nam libero tempore cum soluta',
  'Temporibus autem quibusdam et aut',
  'Itaque earum rerum hic tenetur',
  'Nulla facilisi cras fermentum odio',
  'Viverra nibh cras pulvinar mattis',
  'Amet consectetur adipiscing elit pellentesque',
  'Faucibus scelerisque eleifend donec pretium',
  'Turpis egestas integer eget aliquet',
  'Pellentesque habitant morbi tristique senectus',
  'Facilisis magna etiam tempor orci',
  'Aenean sed adipiscing diam donec',
  'Vitae congue eu consequat ac',
  'Nibh ipsum consequat nisl vel',
  'Arcu cursus vitae congue mauris',
  'Eget nulla facilisi etiam dignissim',
  'Lacus vestibulum sed arcu non',
  'Massa tempor nec feugiat nisl',
  'Ultrices gravida dictum fusce ut',
  'Tellus in hac habitasse platea',
  'Morbi tincidunt ornare massa eget',
  'Volutpat blandit aliquam etiam erat',
  'Risus commodo viverra maecenas accumsan',
  'Diam donec adipiscing tristique risus',
  'Amet facilisis magna etiam tempor',
  'Sagittis purus sit amet volutpat',
  'Odio morbi quis commodo odio',
  'Feugiat in ante metus dictum',
  'Vel facilisis volutpat est velit',
  'Dignissim suspendisse in est ante',
  'Pharetra magna ac placerat vestibulum',
];

const loremSlugs = [
  'lorem-ipsum-dolor-sit',
  'consectetur-adipiscing-elit',
  'ut-enim-ad-minim',
  'duis-aute-irure-dolor',
  'excepteur-sint-occaecat',
  'sed-ut-perspiciatis-unde',
  'nemo-enim-ipsam-voluptatem',
  'neque-porro-quisquam-est',
  'quis-autem-vel-eum',
  'at-vero-eos-accusamus',
  'nam-libero-tempore-soluta',
  'temporibus-autem-quibusdam',
  'itaque-earum-rerum-hic',
  'nulla-facilisi-cras-fermentum',
  'viverra-nibh-pulvinar',
  'amet-consectetur-adipiscing',
  'faucibus-scelerisque-eleifend',
  'turpis-egestas-integer',
  'pellentesque-habitant-morbi',
  'facilisis-magna-etiam-tempor',
  'aenean-sed-adipiscing-diam',
  'vitae-congue-consequat',
  'nibh-ipsum-consequat-nisl',
  'arcu-cursus-vitae-congue',
  'eget-nulla-facilisi-etiam',
  'lacus-vestibulum-sed-arcu',
  'massa-tempor-nec-feugiat',
  'ultrices-gravida-dictum-fusce',
  'tellus-hac-habitasse-platea',
  'morbi-tincidunt-ornare-massa',
  'volutpat-blandit-aliquam-erat',
  'risus-commodo-viverra-maecenas',
  'diam-donec-adipiscing-tristique',
  'amet-facilisis-magna-tempor',
  'sagittis-purus-amet-volutpat',
  'odio-morbi-quis-commodo',
  'feugiat-ante-metus-dictum',
  'vel-facilisis-volutpat-velit',
  'dignissim-suspendisse-est-ante',
  'pharetra-magna-placerat-vestibulum',
];

const loremTopics = [
  'lorem',
  'ipsum',
  'dolor',
  'sit',
  'amet',
  'consectetur',
  'adipiscing',
  'elit',
  'tempor',
  'incididunt',
];

const loremNames = [
  'Lorem Ipsum',
  'Dolor Amet',
  'Consectetur Elit',
  'Adipiscing Tempor',
  'Incididunt Labore',
  'Magna Aliqua',
];

const loremParagraphs = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  'Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida.',
  'Praesent blandit laoreet nibh. Fusce convallis metus id felis luctus adipiscing. Pellentesque egestas, neque sit amet convallis pulvinar, justo nulla eleifend augue, ac auctor orci leo non est.',
  'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
  'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.',
];

// Remove previously generated ADRs so stale date-relative filenames
// don't accumulate. The .template file is untouched.
for (const file of readdirSync(adrsDir)) {
  if (file.endsWith('.md')) {
    unlinkSync(join(adrsDir, file));
  }
}

// Generate dates spanning from 2 days ago to 3 years ago. Tests pin
// SAMPLE_CONTENT_TODAY (YYYY-MM-DD) to make filenames deterministic.
const now = process.env.SAMPLE_CONTENT_TODAY
  ? Date.parse(process.env.SAMPLE_CONTENT_TODAY)
  : Date.now();
const twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000;
const threeYearsAgo = now - 3 * 365 * 24 * 60 * 60 * 1000;
const range = twoDaysAgo - threeYearsAgo;

const dates = Array.from({ length: total }, (_, i) => {
  const t = threeYearsAgo + (range * i) / (total - 1);
  return new Date(t);
}).sort((a, b) => a - b);

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDateForFilename(d) {
  return formatDate(d).replace(/-/g, '').slice(0, 8);
}

function pick(arr, index, count = 1) {
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(arr[(index + i) % arr.length]);
  }
  return result;
}

for (let i = 0; i < total; i++) {
  const date = dates[i];
  const filename = `${formatDateForFilename(date)}-${loremSlugs[i]}.md`;
  const status = i === 16 ? 'deprecated' : 'accepted';
  const practiceArea = practiceAreas[Math.floor(i / perArea)];
  const topics = pick(loremTopics, i * 2, 2 + (i % 3));
  const contributors = pick(loremNames, i, 2 + (i % 2));

  const topicsYaml = topics.map((t) => `  - ${t}`).join('\n');
  const contributorsYaml = contributors.map((c) => `  - ${c}`).join('\n');
  const context =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

  const decisionText = pick(loremParagraphs, i, 2).join('\n\n');
  const consequencesText = pick(loremParagraphs, i + 2, 2).join('\n\n');

  const content = `---
date: ${formatDate(date)}
status: ${status}
practiceArea: ${practiceArea}
topics:
${topicsYaml}
contributors:
${contributorsYaml}

title: ${loremTitles[i]}
context: ${context}
---
## Decision

${decisionText}

## Consequences

${consequencesText}
`;

  writeFileSync(join(adrsDir, filename), content);
  console.log(`Created ${filename}`);
}

console.log(`\nGenerated ${total} ADRs (${perArea} per practice area).`);

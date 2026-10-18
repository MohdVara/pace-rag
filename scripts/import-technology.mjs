import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const path = process.argv[2] || '../mohdvara.github.io/public/evidence/technology-experience.v1.json';
const bytes = await readFile(path, 'utf8');
const data = JSON.parse(bytes);
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const {contentHash, ...body} = data;
if (data.schemaVersion !== 1 || data.publicOnly !== true || contentHash !== hash(body) || data.records.length !== 6) throw new Error('Untrusted technology export');
const html = await readFile('../mohdvara.github.io/dist/index.html', 'utf8');
for (const record of data.records) {
  const {contentHash, ...body} = record;
  const url = new URL(record.canonicalPortfolioAnchor);
  if (hash(body) !== contentHash || url.origin !== 'https://mohd.paramasvara.online' || !html.includes(`id="${url.hash.slice(1)}"`) || record.provenance[0]?.type !== 'owner-confirmed') throw new Error('Invalid technology record or anchor');
}
await writeFile('content/portfolio/technology-evidence.json', bytes);
console.log(`Imported public owner-confirmed export ${data.contentVersion}: ${contentHash}; no portfolio files changed.`);

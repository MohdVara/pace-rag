import { readFile } from 'node:fs/promises';
import { loadContent, hash } from './indexing/content.mjs';
import { verifyModelLock } from './indexing/model-lock.mjs';
// Read-only checks. This command never creates or renews an approval.
for (const corpus of ['portfolio', 'lab']) {
  const data = await loadContent(corpus, {release:true});
  console.log(`${corpus}: ${data.documents.length} sources, ${data.answers.filter(a=>a.status==='approved').length} current answers; publication hashes verified`);
}
await verifyModelLock();
const root='apps/rag-lab/public/licenses/';
const apache=await readFile(`${root}Apache-2.0.txt`, 'utf8');
const mit=await readFile(`${root}onnxruntime-MIT.txt`, 'utf8');
const attribution=await readFile(`${root}attribution.txt`, 'utf8');
if (!apache.includes('Apache License') || !apache.includes('Version 2.0') || !mit.includes('Permission is hereby granted') || !attribution.includes('Xenova/all-MiniLM-L6-v2')) throw new Error('Third-party license notices missing or incomplete');
if (hash(apache) !== hash(await readFile('node_modules/@huggingface/transformers/LICENSE'))) throw new Error('Transformers license differs from installed package');
console.log('Pinned model/runtime integrity and Apache/MIT attribution checks passed. No inference or deployment performed.');
await (await import('./ranking-review-check.mjs')).verifyRankingReview();

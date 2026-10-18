import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadContent } from './indexing/content.mjs';
const release = process.argv.includes('--release');
for (const corpus of ['portfolio', 'lab']) {
  await loadContent(corpus, { release });
  const root = `dist/lab/knowledge/${corpus}`;
  const pointer = JSON.parse(await readFile(`${root}/current.json`, 'utf8'));
  const manifest = JSON.parse(await readFile(`${root}/${pointer.manifest}`, 'utf8'));
  if (release && manifest.preview) throw new Error('Build an approved release before packaging for publication');
  if (!manifest.semanticReady) throw new Error(`Build semantic indexes for ${corpus} before packaging`);
}
// Preserve the app's /pace-rag/ base and synthetic citation paths on any static host.
const target = resolve('output/static-site');
await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp('dist/lab', `${target}/pace-rag`, { recursive: true });
await rm(`${target}/pace-rag/_headers`, { force: true });
await writeFile(`${target}/index.html`, '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=/pace-rag/"><title>PACE-RAG</title></head><body><a href="/pace-rag/">Open PACE-RAG</a></body></html>\n');
await writeFile(`${target}/404.html`, '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Not found</title></head><body><h1>Page not found</h1><a href="/pace-rag/">Return to PACE-RAG</a></body></html>\n');
await writeFile(`${target}/robots.txt`, 'User-agent: *\nDisallow: /\n');
await writeFile(`${target}/_headers`, `/pace-rag/knowledge/*/current.json\n  Cache-Control: no-cache\n/pace-rag/worker.json\n  Cache-Control: no-cache\n/pace-rag/knowledge/*/*/manifest.json\n  Cache-Control: public, max-age=31536000, immutable\n/pace-rag/models/*\n  Cache-Control: public, max-age=31536000, immutable\n/pace-rag/runtime/*\n  Cache-Control: public, max-age=31536000, immutable\n/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: no-referrer\n  X-Robots-Tag: noindex\n`);
let count = 0, largest = { file: '', bytes: 0 };
async function scan(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const path = resolve(dir, item.name);
    if (item.isDirectory()) await scan(path);
    else {
      const bytes = (await stat(path)).size;
      if (bytes > 25 * 1024 * 1024) throw new Error(`Asset exceeds Cloudflare Pages 25 MiB limit: ${path}`);
      if (bytes > largest.bytes) largest = { file: path.slice(target.length + 1), bytes };
      count++;
    }
  }
}
await scan(target);
if (count > 1000) throw new Error('Package exceeds dashboard drag-and-drop file limit; use Wrangler or reduce old artifacts');
await writeFile('output/static-package-report.json', JSON.stringify({ builtAt: new Date().toISOString(), mode: release ? 'publication' : 'test-only', directory: target, files: count, largest, deployed: false }, null, 2));
console.log(`Prepared ${count} files at ${target}; ${release ? 'publication' : 'TEST ONLY'}; no deployment performed.`);

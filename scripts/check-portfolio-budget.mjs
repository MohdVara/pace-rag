import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = resolve(process.argv[2] || '../mohdvara.github.io/dist');
const html = await readFile(resolve(root, 'index.html'), 'utf8');
const entries = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/g)]
  .map(match => match[1]).filter(src => /^\/?assets\/index-[^/]+\.js$/.test(src));
if (entries.length !== 1) throw new Error('Expected exactly one local main JavaScript entry');
const entry = entries[0].replace(/^\//, '');
const bytes = (await stat(resolve(root, entry))).size;
const report = { measuredAt: new Date().toISOString(), entry, bytes, limit: 215000, passed: bytes <= 215000, scope: 'Main JavaScript only; separate lazy assets are not included.' };
await mkdir('output/performance', { recursive: true });
await writeFile('output/performance/portfolio-budget.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (!report.passed) process.exitCode = 1;

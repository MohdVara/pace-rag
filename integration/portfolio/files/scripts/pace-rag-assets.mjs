import {fileURLToPath} from 'node:url';
import {cp, readFile, writeFile, access, rm} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';

const target = resolve('public/pace-rag');
const marker = resolve(target, '.generated-by-pace-rag');
const preview = process.env.VITE_PACE_RAG_PREVIEW === 'true';
const enabled = process.env.VITE_PACE_RAG_ENABLED === 'true';

let generated = false;
try { await access(marker); generated = true; } catch (error) { if (error.code !== 'ENOENT') throw error; }
if (generated) {
  // Clear only this script's own generated assets, including stale releases.
  await rm(target, {recursive: true});
} else {
  try { await access(target); throw new Error('Unmanaged public/pace-rag directory: refusing to replace or publish it.'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}
if (preview || enabled) {
  const source = resolve(dirname(fileURLToPath(import.meta.resolve('@pace-rag/portfolio-assistant'))), '../public');
  const pointer = JSON.parse(await readFile(resolve(source, 'knowledge/portfolio/current.json'), 'utf8'));
  const manifest = JSON.parse(await readFile(resolve(source, 'knowledge/portfolio', pointer.manifest), 'utf8'));
  if (!preview && manifest.preview) throw new Error('PACE-RAG content is a draft preview. Production publication requires owner approval and an approved package.');
  await cp(source, target, {recursive: true});
  await writeFile(marker, 'Generated local PACE-RAG package assets.\n');
}

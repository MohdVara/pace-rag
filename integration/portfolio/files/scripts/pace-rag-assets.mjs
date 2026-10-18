import {fileURLToPath} from 'node:url';
import {cp, readFile, writeFile, access, rm, readdir} from 'node:fs/promises';
import {dirname, resolve, relative} from 'node:path';
import {createHash} from 'node:crypto';

export async function verifyPackage(source) {
  const release = JSON.parse(await readFile(resolve(source, 'release.json'), 'utf8'));
  if (release.schemaVersion !== 1 || release.packageVersion !== '1.3.0' || release.preview !== false || release.corpusId !== 'portfolio' || release.scopeId !== 'professional') throw new Error('Expected an approved professional PACE-RAG v1.3.0 package');
  const expected = new Set(['release.json']);
  for (const item of release.files) {
    if (!item.file || item.file.includes('..') || item.file.startsWith('/') || item.file.includes('\\') || expected.has(item.file) || /knowledge\/(lab|fictional|implementation)(\/|$)/.test(item.file)) throw new Error('Invalid or foreign PACE-RAG asset path');
    expected.add(item.file);
    const bytes = await readFile(resolve(source, item.file));
    if (bytes.length !== item.bytes || createHash('sha256').update(bytes).digest('hex') !== item.sha256) throw new Error(`PACE-RAG package integrity mismatch: ${item.file}`);
  }
  async function scan(dir) { for (const entry of await readdir(dir, {withFileTypes:true})) {
    const p = resolve(dir, entry.name);
    if (entry.isSymbolicLink()) throw new Error('Symlinks are not allowed in PACE-RAG assets');
    if (entry.isDirectory()) await scan(p);
    else if (!expected.has(relative(source, p))) throw new Error('Unlisted PACE-RAG asset');
  }}
  await scan(source);
  const pointer = JSON.parse(await readFile(resolve(source, 'knowledge/portfolio/current.json'), 'utf8'));
  if (pointer.corpusVersion !== release.corpusVersion || pointer.manifest !== `${release.corpusVersion}/manifest.json` || !/^[a-f0-9]{16}$/.test(release.corpusVersion)) throw new Error('PACE-RAG release pointer mismatch');
  const folder = resolve(source, 'knowledge/portfolio', release.corpusVersion);
  const manifest = JSON.parse(await readFile(resolve(source, 'knowledge/portfolio', pointer.manifest), 'utf8'));
  if (manifest.preview || !manifest.semanticReady || manifest.corpusId !== 'portfolio' || manifest.corpusVersion !== release.corpusVersion) throw new Error('PACE-RAG preview or incompatible manifest cannot be published');
  for (const file of ['documents','answers']) {
    const records = JSON.parse(await readFile(resolve(folder, `${file}.json`), 'utf8'));
    if (!records.length || records.some(r => r.corpusId !== 'portfolio' || r.status !== 'approved' || r.approval?.scope !== 'publication' || r.provenance === 'synthetic' || r.provenance === 'implementation-documentation')) throw new Error('PACE-RAG contains unapproved or foreign evidence');
  }
  return release;
}

async function prepare() {
  const target = resolve('public/pace-rag'), marker = resolve(target, '.generated-by-pace-rag');
  const enabled = process.env.VITE_PACE_RAG_ENABLED !== 'false';
  let source;
  if (enabled) {
    source = resolve(dirname(fileURLToPath(import.meta.resolve('@pace-rag/portfolio-assistant'))), '../public');
    await verifyPackage(source);
  }
  let generated = false;
  try { await access(marker); generated = true; } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (generated) await rm(target, {recursive:true});
  else {try {await access(target);throw new Error('Unmanaged public/pace-rag directory: refusing to replace it');}catch(error){if(error.code !== 'ENOENT')throw error;}}
  if (enabled) {
    await cp(source, target, {recursive:true});
    await writeFile(marker, 'Generated from the pinned approved PACE-RAG package.\n');
    console.log('PACE-RAG: verified publication package, professional corpus only.');
  }
}
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) await prepare();

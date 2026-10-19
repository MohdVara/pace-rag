import { cp, mkdir, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { hash, loadContent } from './indexing/content.mjs';
import { verifyModelLock } from './indexing/model-lock.mjs';
await loadContent('portfolio', {release:true});
await (await import('./ranking-review-check.mjs')).verifyRankingReview();
await verifyModelLock();
const pointer=JSON.parse(await readFile('dist/lab/knowledge/portfolio/current.json','utf8'));
if(pointer.corpusVersion!==JSON.parse(await readFile('apps/rag-lab/public/knowledge/portfolio/current.json','utf8')).corpusVersion)throw Error('Portfolio package uses a stale build corpus');
const manifest=JSON.parse(await readFile(`dist/lab/knowledge/portfolio/${pointer.manifest}`,'utf8'));
if(manifest.preview || !manifest.semanticReady) throw new Error('Build an approved semantic release before portfolio packaging');
const target=resolve('output/portfolio-integration'), publicRoot=resolve(target,'public/pace-rag');
await rm(target,{recursive:true,force:true});await mkdir(publicRoot,{recursive:true});
await cp('packages/portfolio-assistant/dist',resolve(target,'package'),{recursive:true});
// Only the professional physical corpus and scoped library enter the portfolio.
for(const folder of ['knowledge/portfolio','knowledge/professional','licenses','technology-ontology.html','privacy.html','examples']) await cp(resolve('dist/lab',folder),resolve(publicRoot,folder),{recursive:true});
const lock=JSON.parse(await readFile('dist/lab/models/assets.lock.json','utf8'));
for(const asset of lock.entries){const destination=resolve(publicRoot,asset.file);await mkdir(resolve(destination,'..'),{recursive:true});await cp(resolve('dist/lab',asset.file),destination);}
await cp('dist/lab/models/assets.lock.json',resolve(publicRoot,'models/assets.lock.json'));
const worker=JSON.parse(await readFile('dist/lab/worker.json','utf8'));
await mkdir(resolve(publicRoot,'assets'),{recursive:true});
await cp(resolve('dist/lab',worker.path),resolve(publicRoot,worker.path));
await cp('dist/lab/worker.json',resolve(publicRoot,'worker.json'));
// Static source pages keep their local citations; their Lab navigation is external.
async function linkLab(dir){for(const item of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,item.name);if(item.isDirectory())await linkLab(p);else if(p.endsWith('.html'))await writeFile(p,(await readFile(p,'utf8')).replaceAll('href="/pace-rag/"','href="https://pace-rag.paramasvara.online/pace-rag/"'));}}
await linkLab(publicRoot);
const files=[];
async function scan(dir){for(const item of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,item.name);if(item.isDirectory())await scan(p);else{const bytes=await readFile(p);files.push({file:relative(publicRoot,p),sha256:hash(bytes),bytes:bytes.length});}}}
await scan(publicRoot);files.sort((a,b)=>a.file.localeCompare(b.file));
const pkg=JSON.parse(await readFile('packages/portfolio-assistant/package.json','utf8'));
await writeFile(resolve(publicRoot,'release.json'),JSON.stringify({schemaVersion:1,packageVersion:pkg.version,corpusId:'portfolio',scopeId:'professional',corpusVersion:manifest.corpusVersion,preview:false,files},null,2)+'\n');
await rm('packages/portfolio-assistant/public',{recursive:true,force:true});
await cp(publicRoot,'packages/portfolio-assistant/public',{recursive:true});
console.log(`Approved professional-only package ${pkg.version}: ${files.length} verified assets; ${manifest.corpusVersion}. No deployment performed.`);

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, access, mkdtemp, cp, rm, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {verifyPackage} from '../scripts/pace-rag-assets.mjs';

test('prerendered assistant is native, closed and absent from eager scripts/preloads', async () => {
  const html=await readFile('dist/index.html','utf8');
  assert.match(html,/Ask about my engineering experience/);
  assert.match(html,/<details class="experience-assistant">/);
  assert.doesNotMatch(html,/<(?:script|link)[^>]+(?:PaceAssistant|embedding-worker|model_quantized)/);
  assert.doesNotMatch(html,/<iframe[^>]+pace/);
  await access('dist/pace-rag/knowledge/professional/index.html');
  await assert.rejects(access('dist/pace-rag/knowledge/lab/current.json'));
  const release=await verifyPackage(resolve('node_modules/@pace-rag/portfolio-assistant/public'));
  assert.equal(release.preview,false);
});

test('pinned assets reject modified evidence and unlisted foreign files', async () => {
  const dir=await mkdtemp(resolve(tmpdir(),'pace-assets-'));
  // Copy the small metadata subset; avoid copying large models for a negative test.
  const source=resolve('node_modules/@pace-rag/portfolio-assistant/public');
  try {
    const release=JSON.parse(await readFile(resolve(source,'release.json'),'utf8'));
    const first=release.files[0];
    await writeFile(resolve(dir,'release.json'),JSON.stringify({...release,files:[first]}));
    const path=resolve(dir,first.file);
    await cp(resolve(source,first.file),path,{recursive:true}).catch(async()=>{
      const {mkdir}=await import('node:fs/promises');
      await mkdir(resolve(path,'..'),{recursive:true});await cp(resolve(source,first.file),path);
    });
    await writeFile(path,'tampered');
    await assert.rejects(verifyPackage(dir),/integrity/);
    release.files[0].file='knowledge/lab/answers.json';
    await writeFile(resolve(dir,'release.json'),JSON.stringify(release));
    await assert.rejects(verifyPackage(dir),/foreign/);
  } finally {await rm(dir,{recursive:true,force:true});}
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {writeImmutable} from '../scripts/indexing/immutable.mjs';
test('immutable index publication permits identical rebuilds and rejects changed bytes',async()=>{
  const directory=await mkdtemp(join(tmpdir(),'pace-rag-publication-'));
  try{const file=join(directory,'index.bin');await writeImmutable(file,'original');await writeImmutable(file,'original');await assert.rejects(writeImmutable(file,'changed'),/Immutable index differs/);assert.equal(await readFile(file,'utf8'),'original');}finally{await rm(directory,{recursive:true,force:true});}
});

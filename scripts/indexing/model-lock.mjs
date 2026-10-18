import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {EMBEDDING} from '../../packages/knowledge-schema/src/validate.mjs';
import {hash} from './content.mjs';
export async function verifyModelLock() {
  const root=resolve('apps/rag-lab/public');
  const lock=JSON.parse(await readFile(resolve(root,'models/assets.lock.json'),'utf8'));
  if(JSON.stringify(lock.embedding)!==JSON.stringify(EMBEDDING)||lock.onnxRuntime!==EMBEDDING.onnxRuntimeVersion)throw new Error('Model assets need preparation with the pinned specification');
  for(const asset of lock.entries){const bytes=await readFile(resolve(root,asset.file));if(bytes.length!==asset.bytes||hash(bytes)!==asset.sha256)throw new Error(`Model/runtime integrity mismatch: ${asset.file}`);}
}

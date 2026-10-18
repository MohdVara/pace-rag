import {readFile,writeFile} from 'node:fs/promises';
export async function writeImmutable(filename,bytes){
  const value=Buffer.from(bytes);
  let old;try{old=await readFile(filename);}catch(error){if(error.code!=='ENOENT')throw error;}
  if(old){if(!old.equals(value))throw new Error('Immutable index differs. Verify embedding parity and bump the declared indexer version before publishing a new release.');return;}
  await writeFile(filename,value,{flag:'wx'});
}

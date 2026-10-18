import {readFile,readdir,stat} from 'node:fs/promises';
import {resolve} from 'node:path';
import {loadContent} from './indexing/content.mjs';
const root=resolve('output/static-site');
let htmlFiles=0,internalLinks=0;
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const path=resolve(dir,entry.name);if(entry.isDirectory())await walk(path);else if(entry.name.endsWith('.html')){
 const text=await readFile(path,'utf8');htmlFiles++;
 if(/local review|local test preview|test-approved|publication not approved|publication pending/i.test(text))throw new Error(`Obsolete public label: ${path}`);
 for(const[,href]of text.matchAll(/href="([^"]+)"/g)){
  if(/^(?:https?:|mailto:|#)/.test(href))continue;
  const url=new URL(href,`https://artifact.test/${path.slice(root.length+1)}`);
  let target=resolve(root,'.'+decodeURIComponent(url.pathname));
  let info;try{info=await stat(target);}catch{throw new Error(`Broken packaged link ${href} in ${path}`);}
  if(info.isDirectory()){target=resolve(target,'index.html');await stat(target);}internalLinks++;
 }
}}}
for(const id of ['portfolio','lab']){
 await loadContent(id,{release:true});
 const base=resolve(root,'pace-rag/knowledge',id),pointer=JSON.parse(await readFile(resolve(base,'current.json'),'utf8'));
 const manifest=JSON.parse(await readFile(resolve(base,pointer.manifest),'utf8'));
 if(manifest.preview||!manifest.semanticReady)throw new Error('Release artifact must be approved and semantic-ready');
 const versions=(await readdir(base,{withFileTypes:true})).filter(e=>e.isDirectory()&&/^[a-f0-9]{16}$/.test(e.name));
 if(versions.length!==1||versions[0].name!==pointer.corpusVersion)throw new Error('Stale release directories in artifact');
}
await walk(root);
console.log(JSON.stringify({htmlFiles,internalLinks,obsoleteLabels:0,staleReleases:0,publication:true,deployed:false},null,2));

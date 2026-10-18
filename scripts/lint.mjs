// Dependency-free syntax/whitespace checks; TypeScript noUnused checks run separately.
import {readdir,readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
let files=0;
async function visit(dir){for(const item of await readdir(dir,{withFileTypes:true})){if(['node_modules','dist','output','public','generated'].includes(item.name))continue;const path=`${dir}/${item.name}`;if(item.isDirectory())await visit(path);else if(/\.(mjs|ts|tsx)$/.test(path)){files++;const text=await readFile(path,'utf8');if(/^(?:<{7}|={7}|>{7})/m.test(text))throw new Error(`Merge marker: ${path}`);if(path.endsWith('.mjs')){const result=spawnSync(process.execPath,['--check',path],{encoding:'utf8'});if(result.status)throw new Error(result.stderr);}}}}
for(const dir of ['packages','apps','scripts','tests','content','evaluation'])await visit(dir);
console.log(`Syntax/merge-marker lint passed for ${files} source files. This is not ESLint.`);

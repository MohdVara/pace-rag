// Local QA server for exact packaged files. Unknown paths return a real 404,
// unlike Vite's SPA preview fallback. This is not a production hosting service.
import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('output/static-site');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.wasm':'application/wasm','.txt':'text/plain','.onnx':'application/octet-stream','.f32':'application/octet-stream'};
const server=createServer(async(req,res)=>{try{
  const path=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
  let file=resolve(root,'.'+path);if(file!==root&&!file.startsWith(root+sep))throw new Error('Invalid path');
  if((await stat(file)).isDirectory())file=resolve(file,'index.html');
  const bytes=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:bytes);
 }catch{const bytes=await readFile(resolve(root,'404.html')).catch(()=>Buffer.from('Not found'));res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(bytes);}});
server.listen(5183,'127.0.0.1',()=>console.log('Local static QA: http://127.0.0.1:5183/pace-rag/ (exact files and real 404s)'));

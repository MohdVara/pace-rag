import {chromium,webkit} from 'playwright';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(resolve(process.env.QA_MODULES_DIR||'/private/tmp/pace-qa','package.json'));
const AxeBuilder=require('@axe-core/playwright').default;
const engine=process.env.QA_BROWSER||'chromium',base=process.env.PACE_RAG_PORTFOLIO_URL||'http://127.0.0.1:5177/';
const out=`output/playwright/public-integration/${engine}`;await mkdir(out,{recursive:true});
const browser=await(engine==='webkit'?webkit:chromium).launch();
const report={engine,measuredAt:new Date().toISOString(),cases:[],layouts:[],inferenceRequests:[],errors:[],limits:['Emulated desktop/mobile, not physical devices or a screen-reader session.','Local release artifacts only; no deployment.']};
async function context(options={}){const ctx=await browser.newContext(options);ctx.on('page',p=>p.on('pageerror',e=>report.errors.push(e.message)));ctx.on('request',r=>{if(/\/v1\/.*\/(session|generate)|workers-ai|\/ai\/run\//.test(r.url()))report.inferenceRequests.push(r.url());});return ctx;}
async function run(name,fn){try{await fn();report.cases.push({name,passed:true});}catch(e){report.cases.push({name,passed:false,error:e.stack});}}
const toggle=p=>p.locator('.experience-assistant > summary');
async function open(p){await toggle(p).click();await p.locator('.pace-starters').waitFor();await p.waitForFunction(()=>document.querySelector('.pace-status')?.textContent?.startsWith('Knowledge ready'));}
async function search(p,q){await p.getByLabel('Your question',{exact:true}).fill(q);await p.getByRole('button',{name:'Search knowledge',exact:true}).click();await p.waitForFunction(()=>!document.querySelector('.pace-actions button')?.disabled,null,{timeout:60000});await p.locator('.pace-answer').waitFor();}
try{
 await run('Lazy native integration; three starters, cache, ontology, citations, lexical abstention and close focus',async()=>{
  const c=await context(),p=await c.newPage(),requests=[];p.on('request',r=>requests.push(r.url()));try{
   await p.goto(base);await p.waitForLoadState('networkidle');assert(!requests.some(u=>/\/pace-rag\/|PaceAssistant-/.test(u)));assert.equal(await p.locator('.experience-assistant').getAttribute('open'),null);
   await open(p);assert.equal(await p.locator('.pace-starters button').count(),3);assert.equal(await p.locator('.pace-inspection').count(),0);
   await p.getByRole('button',{name:'Which projects used React?',exact:true}).click();assert.match(await p.locator('.pace-answer').innerText(),/PolicyStreet/);assert.match(await p.locator('.pace-answer').innerText(),/Modern systems/);assert.equal(await p.locator('.pace-supporting a').count(),2);
   await search(p,'What is your engineering background?');assert.match(await p.locator('.pace-answer').innerText(),/Reviewed cached answer/);assert.equal(await p.locator('.pace-answer > p:not(.pace-kicker)').count(),1);assert(await p.locator('.pace-related').count());
   assert(!requests.some(u=>/\/models\/|\/runtime\/|embedding-worker-/.test(u)));assert.equal(p.workers().length,0);
   await p.locator('.pace-settings summary').click();await p.getByRole('checkbox',{name:/Use semantic search/}).uncheck();await search(p,'How many production requests did you handle at PolicyStreet?');assert.match(await p.locator('.pace-answer').innerText(),/Insufficient evidence/);assert.equal(await p.locator('.pace-supporting').count(),0);
   await search(p,'How does the fictional Atlas Gateway work?');assert.match(await p.locator('.pace-answer').innerText(),/Insufficient evidence/);assert(!requests.some(u=>/knowledge\/(lab|fictional|implementation)\//.test(u)));
   assert(await p.getByRole('link',{name:/Explore the Engineering RAG Lab/}).getAttribute('href')==='https://pace-reg.paramasvara.online/pace-rag/');
   await p.getByRole('button',{name:'Close assistant',exact:true}).click();assert.equal(await p.locator('.pace-assistant').count(),0);assert.equal(await toggle(p).evaluate(e=>e===document.activeElement),true);assert.equal(p.workers().length,0);
   await toggle(p).focus();await p.keyboard.press('Enter');await p.locator('.pace-starters').waitFor();assert.equal(await p.locator('h1').count(),1);
  }finally{await c.close();}
 });
 await run('Custom semantic query starts model only on demand; closing terminates worker',async()=>{
  const c=await context(),p=await c.newPage(),model=[];p.on('request',r=>{if(/\/models\/|\/runtime\/|embedding-worker-/.test(r.url()))model.push(r.url());});try{await p.goto(base);await open(p);assert.deepEqual(model,[]);await search(p,'Find evidence about modernising education workflows and system architecture');assert(model.some(u=>/model_quantized/.test(u)));assert.match(await p.locator('.pace-status').innerText(),/Semantic search ready/);await p.getByRole('button',{name:'Close assistant',exact:true}).click();await p.waitForFunction(()=>!document.querySelector('.pace-assistant'));assert.equal(p.workers().length,0);}finally{await c.close();}
 });
 await run('Worker failure retains lexical results; corrupt evidence fails closed',async()=>{
  const c=await context();await c.route('**/assets/embedding-worker-*.js',r=>r.abort());const p=await c.newPage();try{await p.goto(base);await open(p);await search(p,'Find education architecture and modernisation evidence');assert.match(await p.locator('.pace-status').innerText(),/Lexical search ready/);await search(p,'What is your engineering background?');assert.match(await p.locator('.pace-answer').innerText(),/Reviewed cached answer/);}finally{await c.close();}
  const bad=await context();await bad.route('**/documents.json',r=>r.fulfill({contentType:'application/json',body:'[]'}));const b=await bad.newPage();try{await b.goto(base);await toggle(b).click();await b.waitForFunction(()=>document.querySelector('.pace-status')?.textContent?.startsWith('Knowledge assets are unavailable'));assert.equal(await b.locator('.pace-answer').count(),0);assert(await b.getByRole('link',{name:'Browse professional sources'}).isVisible());}finally{await bad.close();}
 });
 await run('No-JavaScript source fallback and original portfolio routes/SEO',async()=>{const c=await context({javaScriptEnabled:false}),p=await c.newPage();try{await p.goto(base);await toggle(p).click();await p.getByRole('link',{name:'Browse professional sources'}).click();assert.match(await p.locator('h1').innerText(),/Professional Experience/);assert.doesNotMatch(await p.locator('main').innerText(),/Atlas architecture|publication not approved|local test preview/i);for(const path of ['/','/work-with-me/','/no-two-mondays/','/incident-zero/','/incident-zero/defence/']){await p.goto(new URL(path,base).href);assert.equal(await p.locator('h1').count(),1);assert.equal(await p.locator('link[rel="canonical"]').getAttribute('href'),`https://mohd.paramasvara.online${path}`);}}finally{await c.close();}});
 for(const theme of ['light','dark'])for(const width of [320,390,768,1440]){
  const c=await context({viewport:{width,height:1000},reducedMotion:'reduce'}),p=await c.newPage();try{await p.goto(base);await p.evaluate(theme=>{document.documentElement.dataset.theme=theme;document.documentElement.dataset.textSize='largest';},theme);await open(p);await p.getByRole('button',{name:'Which projects used React?',exact:true}).click();assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));const axe=await new AxeBuilder({page:p}).include('.experience-assistant').analyze();assert.deepEqual(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);if(width===390||width===1440)await p.locator('.experience-assistant').screenshot({path:`${out}/assistant-${width}-${theme}.png`});report.layouts.push({theme,width,textSize:'largest',axeViolations:0,overflow:false});}finally{await c.close();}
 }
 assert.deepEqual(report.inferenceRequests,[]);assert.deepEqual(report.errors,[]);
}finally{await browser.close();await writeFile(`${out}/results.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));}
if(report.cases.some(c=>!c.passed))process.exitCode=1;

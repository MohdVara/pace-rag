import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
const mode=process.argv[2];
if(!['preview','disabled'].includes(mode))throw new Error('Choose preview or disabled build');
const directory='output/performance';await mkdir(directory,{recursive:true});
const results=[];
for(let i=0;i<3;i++){
  const file=`${directory}/${mode}-${i}.json`;
  await new Promise((resolve,reject)=>{
    const child=spawn('npx',['--yes','--package=lighthouse@13.0.1','lighthouse','http://127.0.0.1:5177/','--chrome-flags=--headless=new','--output=json',`--output-path=${file}`,'--quiet'],{env:{...process.env,CHROME_PATH:chromium.executablePath()},stdio:'inherit'});
    child.once('error',reject);child.once('exit',code=>code===0?resolve():reject(new Error(`Lighthouse exit ${code}`)));
  });
  const report=JSON.parse(await readFile(file,'utf8'));
  results.push({performance:report.categories.performance.score,accessibility:report.categories.accessibility.score,bestPractices:report.categories['best-practices'].score,seo:report.categories.seo.score,lcpMs:report.audits['largest-contentful-paint'].numericValue,cls:report.audits['cumulative-layout-shift'].numericValue,tbtMs:report.audits['total-blocking-time'].numericValue,warnings:report.runWarnings});
  console.log(`${mode} ${i+1}/3: ${JSON.stringify(results.at(-1))}`);
}
await writeFile(`${directory}/${mode}-summary.json`,JSON.stringify({measuredAt:new Date().toISOString(),mode,scope:'Local emulated mobile, assistant unopened. Disabled versus opt-in preview build; not physical-device or field performance.',results},null,2));

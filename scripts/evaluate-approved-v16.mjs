import {readFile,writeFile,mkdir} from 'node:fs/promises';import {resolve} from 'node:path';import assert from 'node:assert/strict';
import {loadContent,hash} from './indexing/content.mjs';

import {scopeCorpus} from '../packages/semantic-core/src/scope.mjs';
import {retrieve,normalizeQuestion} from '../packages/semantic-core/src/retrieval.mjs';
import {resolveAnswer,validateAnswerResult} from '../packages/semantic-core/src/answers.mjs';
import {EMBEDDING} from '../packages/knowledge-schema/src/validate.mjs';
import {portfolio,critical,composites,lab,labCritical} from '../evaluation/efrd-heldout.mjs';
import {verification} from '../evaluation/verification-v13.mjs';
import {verificationV14} from '../evaluation/verification-v14.mjs';
import {positives,negatives} from '../evaluation/knowledge-v16-cases.mjs';

const semantic=process.argv.includes('--semantic'),mode=semantic?'semantic':'lexical',root='output/knowledge-v16-approved';await mkdir(root,{recursive:true});
const decode=bytes=>Float32Array.from({length:bytes.length/4},(_,i)=>bytes.readFloatLE(i*4));
async function embed(texts){const cache=`${root}/${hash(JSON.stringify({texts,embedding:EMBEDDING}))}.f32`;let bytes;try{bytes=await readFile(cache);}catch{try{bytes=await readFile(cache.replace('knowledge-v16-approved/','knowledge-v16/'));}catch{bytes=await(await import('./indexing/embed.mjs')).embedBatch(texts);}await writeFile(cache,bytes);}assert.equal(bytes.length,texts.length*1536);return decode(bytes);}
async function current(corpusId,historical=false){const c=historical?JSON.parse(await readFile('content/portfolio/history/v15-corpus.json')):await loadContent(corpusId,{release:true}),path=historical?'output/knowledge-v16-approved/baseline':`apps/rag-lab/public/knowledge/${corpusId}`,pointer=JSON.parse(await readFile(`${path}/current.json`)),folder=historical?path:`${path}/${pointer.corpusVersion}`,manifest=JSON.parse(await readFile(`${folder}/manifest.json`));const vectors={};if(semantic)for(const name of ['questionVectors','chunkVectors'])vectors[name]=decode(await readFile(resolve(folder,manifest.assets[name].path)));return{...c,documents:JSON.parse(await readFile(`${folder}/documents.json`)),answers:JSON.parse(await readFile(`${folder}/answers.json`)),chunks:JSON.parse(await readFile(`${folder}/chunks.json`)),corpusVersion:pointer.corpusVersion,...vectors};}
const before=scopeCorpus(await current('portfolio',true),'professional'),after=scopeCorpus(await current('portfolio'),'professional');
const pairs=[
 ['How did quotation caching and validity work at PolicyStreet?','insurance-validity'],
 ['What event-driven architecture decisions did you make?','insurance-architecture'],
 ['How did stakeholders influence education platform modernization?','modernisation'],
 ['What education and HR workflows did you work on?','education-workflows'],
 ['What could MegaInfinite realtors do from their phones?','rental-mobile'],
 ['Could realtors send contracts and inspect financial reports remotely?','rental-mobile'],
 ['How did WenSymes accommodate changing organizational roles?','wensymes-work'],
 ['Did WenSymes implement a fully configurable RBAC engine?','wensymes-rbac-boundary']
].map(([question,id],i)=>({id:`candidate-${i+1}`,question,relevantAnswerIds:['portfolio-answer-'+id],isBoundaryAnswer:i===7}));
const groups={development:[...portfolio,...critical,...composites],verification50:verification,verification40:verificationV14,feature:[...positives,...negatives],candidateExact:pairs};
const indexed=new Set(after.answers.flatMap(a=>[a.canonicalQuestion,...a.alternatives.map(q=>q.text)]).map(normalizeQuestion));for(const row of [...positives,...negatives])assert(!indexed.has(normalizeQuestion(row.question)),'Feature query overlaps proposed wording');
const report={version:'professional-knowledge-v16-approved-evaluation',measuredAt:new Date().toISOString(),mode,scope:'Actual owner-approved v1.6 corpus versus preserved approved v1.5 corpus. Local retrieval, not independent evaluation or deployed provider verification.',softwareVersion:JSON.parse(await readFile('package.json','utf8')).version,rankingSha256:hash(await readFile('packages/semantic-core/src/retrieval.mjs','utf8')+await readFile('packages/semantic-core/src/hybrid.mjs','utf8')),publicationApproved:true,approvedCorpusVersion:before.corpusVersion,approvedV16CorpusVersion:after.corpusVersion,liveProviderCalls:0,sets:{},implementationRegression:{},limits:['All query/expected labels are agent-authored and provisional. Existing suites are preserved without relabeling.','Candidate exact questions are indexed wording and measure cache behavior, never holdout ranking.','Source and answer approval is hash-bound to the owner-approved records; prior draft simulations are separately archived.','No deployment or live provider call occurred; local approved indexes were rebuilt.']};const details=[];
async function measure(name,rows,corpus,variant){
 const queries=semantic?await embed(rows.map(r=>r.question)):undefined;let positives=0,top1=0,top3=0,neg=0,abstained=0,wrong=0,citations=0,leaks=0,direct=0,compositeCount=0,compositeCorrect=0;
 for(const [i,row]of rows.entries()){
  const retrieval=retrieve({question:row.question,corpus,vector:queries?.subarray(i*384,(i+1)*384),questionVectors:corpus.questionVectors,chunkVectors:corpus.chunkVectors}),answer=resolveAnswer({question:row.question,corpus,retrieval});
  if(row.relevantAnswerIds){positives++;top1+=Number(row.relevantAnswerIds.includes(retrieval.answerCandidates[0]?.answerId));top3+=Number(retrieval.answerCandidates.some(c=>row.relevantAnswerIds.includes(c.answerId)));if(answer.answer){direct++;wrong+=Number(!row.relevantAnswerIds.includes(answer.answerId));}}
  else if(row.usedFactIds){compositeCount++;if(answer.answer){direct++;const ok=answer.origin==='approved-composite'&&JSON.stringify([...answer.usedFactIds].sort())===JSON.stringify([...row.usedFactIds].sort());compositeCorrect+=Number(ok);wrong+=Number(!ok);}}
  else{neg++;abstained+=Number(answer.origin==='insufficient-evidence');wrong+=Number(answer.origin!=='insufficient-evidence');}
  try{validateAnswerResult(answer,corpus);}catch{citations++;}
  leaks+=answer.sources.filter(s=>s.corpusId!==corpus.corpusId||!corpus.documents.some(d=>d.id===s.sourceId)).length+retrieval.passages.filter(p=>p.corpusId!==corpus.corpusId||!corpus.documents.some(d=>d.id===p.documentId)).length;
  details.push({set:name,variant,id:row.id,question:row.question,expected:row.relevantAnswerIds||row.usedFactIds||'insufficient-evidence',origin:answer.origin,answerId:answer.answerId,answerText:answer.answer,candidates:retrieval.trace.candidates,sources:answer.sources,passageSources:retrieval.passages.map(p=>p.documentId),top1Miss:row.relevantAnswerIds?!row.relevantAnswerIds.includes(retrieval.answerCandidates[0]?.answerId):undefined});
 }
 return{positiveQuestions:positives,top1:positives?top1/positives:null,top3:positives?top3/positives:null,criticalQuestions:neg,criticalAbstained:abstained,abstentionRate:neg?abstained/neg:null,incorrectAutomaticAnswers:wrong,citationFailures:citations,crossCorpusReferences:leaks,directAnswers:direct,compositeCount,compositeCorrect};
}
for(const[name,rows]of Object.entries(groups)){report.sets[name]={datasetSha256:hash(JSON.stringify(rows)),before:await measure(name,rows,before,'current-approved'),after:await measure(name,rows,after,'approved-v16')};}
const implementation=scopeCorpus(await current('lab'),'implementation');report.implementationRegression=await measure('implementation',[...lab,...labCritical],implementation,'unchanged-approved');
await mkdir('evaluation/reports',{recursive:true});await writeFile(`evaluation/reports/knowledge-v16-approved-${mode}.json`,JSON.stringify(report,null,2)+'\n');await writeFile(`evaluation/reports/knowledge-v16-approved-${mode}-cases.json`,JSON.stringify(details,null,2)+'\n');
console.log(JSON.stringify({mode,sets:report.sets,implementation:report.implementationRegression},null,2));
if([...Object.values(report.sets).flatMap(v=>[v.before,v.after]),report.implementationRegression].some(r=>r.incorrectAutomaticAnswers||r.citationFailures||r.crossCorpusReferences))process.exitCode=1;

// Local paired retrieval audit. Existing labels and scoring are frozen; no approvals are written.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {loadContent,hash} from './indexing/content.mjs';
import {EMBEDDING} from '../packages/knowledge-schema/src/validate.mjs';
import {scopeCorpus} from '../packages/semantic-core/src/scope.mjs';
import {retrieve as frozenRetrieve} from '../evaluation/baselines/ranking-v16/retrieval.mjs';
import {retrieve} from '../packages/semantic-core/src/retrieval.mjs';
import {resolveAnswer,validateAnswerResult} from '../packages/semantic-core/src/answers.mjs';
import {portfolio,critical,composites,lab,labCritical} from '../evaluation/efrd-heldout.mjs';
import {verification} from '../evaluation/verification-v13.mjs';
import {verificationV14} from '../evaluation/verification-v14.mjs';
import {positives,negatives} from '../evaluation/knowledge-v16-cases.mjs';

const mode=process.argv.includes('--lexical')?'lexical':'semantic',semantic=mode==='semantic';
const freeze=JSON.parse(await readFile('evaluation/baselines/ranking-v16/freeze.json'));
for(const [path,digest] of Object.entries({...freeze.files,...freeze.baselineFiles}))if(!path.startsWith('packages/semantic-core/'))assert.equal(hash(await readFile(path)),digest,'Frozen input changed: '+path);
const decode=bytes=>Float32Array.from({length:bytes.length/4},(_,i)=>bytes.readFloatLE(i*4));
async function corpus(id,historical=false){
 const path=historical?'output/knowledge-v16-approved/baseline':`apps/rag-lab/public/knowledge/${id}`;
 const archived=process.env.PACE_V15_ARCHIVE||'../mohdvara.github.io/vendor/pace-rag-ranking-baseline-1.5.0.tgz';
 const asset=async(file,entry)=>{try{return await readFile(file);}catch(error){if(!historical||error.code!=='ENOENT')throw error;return execFileSync('tar',['-xOf',archived,'package/public/knowledge/portfolio/'+entry]);}};
 const pointer=JSON.parse(await asset(`${path}/current.json`,'current.json')),folder=historical?path:`${path}/${pointer.corpusVersion}`;
 const manifest=JSON.parse(await asset(`${folder}/manifest.json`,`${pointer.corpusVersion}/manifest.json`));assert.deepEqual(manifest.embedding,EMBEDDING);
 const data=historical?JSON.parse(await readFile('content/portfolio/history/v15-corpus.json')):await loadContent(id,{release:true});
 for(const [name,entry]of Object.entries(manifest.assets)){const bytes=await asset(resolve(folder,entry.path),`${pointer.corpusVersion}/${entry.path}`);assert.equal(hash(bytes),entry.sha256,'Index hash: '+name);assert.equal(bytes.length,entry.bytes);if(['documents','answers','chunks'].includes(name))data[name]=JSON.parse(bytes);if(semantic&&name.endsWith('Vectors'))data[name]=decode(bytes);}
 return scopeCorpus({...data,corpusVersion:pointer.corpusVersion},id==='portfolio'?'professional':'implementation');
}
async function vectors(rows){if(!semantic)return undefined;const texts=rows.map(r=>r.question),key=hash(JSON.stringify({texts,embedding:EMBEDDING})),path=`output/knowledge-v16-approved/${key}.f32`;let bytes;try{bytes=await readFile(path);}catch(error){if(error.code!=='ENOENT')throw error;bytes=await(await import('./indexing/embed.mjs')).embedBatch(texts);await mkdir('output/knowledge-v16-approved',{recursive:true});await writeFile(path,bytes);}assert.equal(bytes.length,rows.length*1536);return decode(bytes);}
const before=await corpus('portfolio',true),current=await corpus('portfolio'),implementation=await corpus('lab');
const exact=JSON.parse(await readFile('evaluation/reports/knowledge-v16-approved-semantic-cases.json')).filter(r=>r.set==='candidateExact'&&r.variant==='approved-v16').map(r=>({id:r.id,question:r.question,relevantAnswerIds:r.expected}));
const groups={development:[...portfolio,...critical,...composites],verification50:verification,verification40:verificationV14,feature:[...positives,...negatives],candidateExact:exact};
const report={version:'pace-ranking-diff-v161',mode,scope:'Local paired actual artifacts. Agent-authored suites; no external holdout, live inference or deployment.',contentFingerprint:hash(JSON.stringify(await loadContent('portfolio',{release:true}))),evaluationFreezeHash:hash(await readFile('evaluation/baselines/ranking-v16/freeze.json')),corpora:{v15:before.corpusVersion,v16:current.corpusVersion},embedding:EMBEDDING,rankingSha256:hash(await readFile('packages/semantic-core/src/retrieval.mjs','utf8')+await readFile('packages/semantic-core/src/hybrid.mjs','utf8')),frozenRankingSha256:'95423a7169c73cff33e24902f48e6bcbd77e8109ff62eb3dc9c7aa8b1ab2422c',sets:{},paired:[],cases:[]};
function candidates(result,c){const max=Math.max(...result.trace.candidates.map(x=>x.answerLexicalScore),1);return result.trace.candidates.map(x=>({...x,projectSources:c.answers.find(a=>a.id===x.answerId).citations.map(s=>({id:s.sourceId,title:s.title,url:s.url})),semanticContribution:semantic?.8*x.semanticScore:0,bm25Contribution:(semantic?.2:1)*x.answerLexicalScore/max,intentEntityContribution:x.intentAdjustment,finalScore:x.score,newAnswer:!before.answers.some(a=>a.id===x.answerId)}));}
function summary(rows,c,fn,queryVectors){let positiveQuestions=0,top1=0,top3=0,criticalQuestions=0,criticalAbstained=0,incorrectAutomaticAnswers=0,citationFailures=0,crossCorpusReferences=0,directAnswers=0,compositeCount=0,compositeCorrect=0;const details=[];
 for(const [i,row]of rows.entries()){
  const retrieval=fn({question:row.question,corpus:c,vector:queryVectors?.subarray(i*384,(i+1)*384),questionVectors:c.questionVectors,chunkVectors:c.chunkVectors,policy:{auditAllCandidates:true}}),answer=resolveAnswer({question:row.question,corpus:c,retrieval});
  if(row.relevantAnswerIds){positiveQuestions++;top1+=Number(row.relevantAnswerIds.includes(retrieval.answerCandidates[0]?.answerId));top3+=Number(retrieval.answerCandidates.some(x=>row.relevantAnswerIds.includes(x.answerId)));if(answer.answer){directAnswers++;incorrectAutomaticAnswers+=Number(!row.relevantAnswerIds.includes(answer.answerId));}}
  else if(row.usedFactIds){compositeCount++;if(answer.answer){directAnswers++;const ok=answer.origin==='approved-composite'&&JSON.stringify([...answer.usedFactIds].sort())===JSON.stringify([...row.usedFactIds].sort());compositeCorrect+=Number(ok);incorrectAutomaticAnswers+=Number(!ok);}}
  else{criticalQuestions++;criticalAbstained+=Number(answer.origin==='insufficient-evidence');incorrectAutomaticAnswers+=Number(answer.origin!=='insufficient-evidence');}
  try{validateAnswerResult(answer,c);}catch{citationFailures++;}
  crossCorpusReferences+=answer.sources.filter(s=>s.corpusId!==c.corpusId||!c.documents.some(d=>d.id===s.sourceId)).length+retrieval.passages.filter(p=>p.corpusId!==c.corpusId||!c.documents.some(d=>d.id===p.documentId)).length;
  const ranked=candidates(retrieval,c);details.push({id:row.id,question:row.question,expected:row.relevantAnswerIds||row.usedFactIds||'insufficient-evidence',origin:answer.origin,answerId:answer.answerId,ranks:row.relevantAnswerIds?.map(id=>({answerId:id,rank:ranked.findIndex(x=>x.answerId===id)+1||null})),candidates:ranked,sources:answer.sources});
 }
 return{metrics:{positiveQuestions,top1:positiveQuestions?top1/positiveQuestions:null,top3:positiveQuestions?top3/positiveQuestions:null,criticalQuestions,criticalAbstained,incorrectAutomaticAnswers,citationFailures,crossCorpusReferences,directAnswers,compositeCount,compositeCorrect},details};
}
for(const [name,rows]of Object.entries(groups)){
 const q=await vectors(rows),runs={v15:summary(rows,before,frozenRetrieve,q),v16:summary(rows,current,frozenRetrieve,q),corrected:summary(rows,current,retrieve,q)};
 report.sets[name]=Object.fromEntries(Object.entries(runs).map(([k,v])=>[k,v.metrics]));
 for(const [variant,run]of Object.entries(runs))for(const detail of run.details)report.cases.push({set:name,variant,...detail,candidates:detail.candidates.slice(0,5)});
 for(let i=0;i<rows.length;i++){const a=runs.v15.details[i],b=runs.v16.details[i];if(!a.ranks||JSON.stringify(a.ranks)===JSON.stringify(b.ranks))continue;
  const expected=new Set(a.expected),best=x=>Math.min(...x.ranks.map(r=>r.rank??Infinity)),aRank=best(a),bRank=best(b),corrected=runs.corrected.details[i];
  const displacedBy=b.candidates.slice(0,bRank===Infinity?5:bRank-1).filter(c=>!expected.has(c.answerId)&&(!a.candidates.some(p=>p.answerId===c.answerId)||a.candidates.findIndex(p=>p.answerId===c.answerId)>=aRank));
  report.paired.push({set:name,id:a.id,question:a.question,expected:a.expected,v15Ranks:a.ranks,v16Ranks:b.ranks,correctedRanks:corrected.ranks,regressed:bRank>aRank,v15Top5:a.candidates.slice(0,5),v16Top5:b.candidates.slice(0,5),correctedTop5:corrected.candidates.slice(0,5),expectedCandidates:{v15:a.candidates.filter(c=>expected.has(c.answerId)),v16:b.candidates.filter(c=>expected.has(c.answerId))},disappeared:b.ranks.every(r=>r.rank===null),displacedBy});
 }
}
const implRows=[...lab,...labCritical];report.implementation=summary(implRows,implementation,retrieve,await vectors(implRows)).metrics;
// Reproduction uses frozen artifacts and identical scoring; equality is checked before correction acceptance.
const reference=JSON.parse(await readFile(`evaluation/reports/knowledge-v16-approved-${mode}.json`));for(const [name,metrics]of Object.entries(report.sets))for(const [variant,key]of [['v15','before'],['v16','after']])for(const metric of Object.keys(metrics[variant]))assert.equal(metrics[variant][metric],reference.sets[name][key][metric],`Baseline mismatch ${name}/${variant}/${metric}`);
for(const pair of report.paired){
 const e=pair.expectedCandidates.v16.reduce((best,c)=>!best||c.rank<best.rank?c:best,null),winner=pair.v16Top5[0];
 pair.diagnosis={newAnswerInterference:pair.displacedBy.some(c=>c.newAnswer),lexicalDisplacement:!!e&&winner.answerId!==e.answerId&&winner.semanticContribution<e.semanticContribution&&winner.bm25Contribution>e.bm25Contribution,semanticCollision:!!e&&winner.answerId!==e.answerId&&winner.semanticContribution>e.semanticContribution,intentMismatch:!!e&&winner.intentAdjustment>e.intentAdjustment,crossProject:!!e&&!winner.projectSources.some(s=>e.projectSources.some(t=>t.id===s.id)),overlappingSource:!!e&&winner.answerId!==e.answerId&&winner.projectSources.some(s=>e.projectSources.some(t=>t.id===s.id)),indexOrEligibilityLoss:pair.disappeared};
}
const regressionPairs=report.paired.filter(p=>p.regressed&&['development','verification50','verification40'].includes(p.set));
report.diagnosisCounts=Object.fromEntries(Object.keys(regressionPairs[0]?.diagnosis||{}).map(key=>[key,regressionPairs.filter(p=>p.diagnosis[key]).length]));
report.diagnosisNote='Overlapping evidence-based flags, not mutually exclusive causal estimates. Exact scores and source IDs are retained per query for adjudication.';
await mkdir('evaluation/reports',{recursive:true});await writeFile(`evaluation/reports/v161-${mode}-paired.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({mode,sets:report.sets,changedRanks:report.paired.length,regressions:report.paired.filter(r=>r.regressed).length,implementation:report.implementation},null,2));
if([...Object.values(report.sets).map(x=>x.corrected),report.implementation].some(r=>r.incorrectAutomaticAnswers||r.citationFailures||r.crossCorpusReferences||r.criticalAbstained!==r.criticalQuestions))process.exitCode=1;

import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import os from 'node:os';
import {loadContent,chunksFor} from './indexing/content.mjs';
import {retrieve,normalizeQuestion,answerCurrent} from '../packages/semantic-core/src/retrieval.mjs';
import {resolveAnswer,validateAnswerResult} from '../packages/semantic-core/src/answers.mjs';
import {version,portfolio,lab,composites,critical,labCritical,calibration} from '../evaluation/efrd-heldout.mjs';
import {scopeCorpus} from '../packages/semantic-core/src/scope.mjs';
import {inScope} from '../packages/knowledge-schema/src/provenance.mjs';
const semantic=process.argv.includes('--semantic');
const scoped=process.argv.includes('--scoped');
const groups=scoped?{professional:[...portfolio,...composites,...critical],implementation:[...lab,...labCritical]}:{portfolio:[...portfolio,...composites,...critical],lab:[...lab,...labCritical]};
const scorecards={},details=[];
const digest=data=>createHash('sha256').update(JSON.stringify(data)).digest('hex');
const packageJson=JSON.parse(await readFile('package.json','utf8'));
for(const id of Object.keys(groups)){
 const physicalId=id==='professional'?'portfolio':id==='implementation'?'lab':id;
 const content=await loadContent(physicalId),root=resolve('apps/rag-lab/public/knowledge',physicalId),pointer=JSON.parse(await readFile(resolve(root,'current.json'),'utf8')),folder=resolve(root,pointer.corpusVersion),manifest=JSON.parse(await readFile(resolve(folder,'manifest.json'),'utf8'));
 const runtimeAnswers=JSON.parse(await readFile(resolve(folder,'answers.json'),'utf8'));
 let corpus={...content,answers:runtimeAnswers,corpusVersion:pointer.corpusVersion,chunks:JSON.parse(await readFile(resolve(folder,'chunks.json'),'utf8'))};
 const rows=groups[id];const indexed=new Set(content.answers.flatMap(a=>[a.canonicalQuestion,...a.alternatives.map(q=>q.text)]).map(normalizeQuestion));
 for(const row of rows.filter(r=>r.relevantAnswerIds))if(indexed.has(normalizeQuestion(row.question)))throw new Error(`Held-out overlap: ${row.id}`);
 const readVectors=async name=>{const bytes=await readFile(resolve(folder,manifest.assets[name].path));return Float32Array.from({length:bytes.length/4},(_,i)=>bytes.readFloatLE(i*4));};
 let questionVectors,chunkVectors,queries;
 if(semantic){if(!manifest.semanticReady)throw new Error('Semantic index required');questionVectors=await readVectors('questionVectors');chunkVectors=await readVectors('chunkVectors');const{embedBatch}=await import('./indexing/embed.mjs');const bytes=await embedBatch(rows.map(r=>r.question));queries=Float32Array.from({length:bytes.length/4},(_,i)=>bytes.readFloatLE(i*4));}
 if(scoped){corpus=scopeCorpus({...corpus,questionVectors,chunkVectors},id);questionVectors=corpus.questionVectors;chunkVectors=corpus.chunkVectors;}
 let positive=0,top1=0,top3=0,negative=0,abstained=0,wrongAuto=0,answered=0,compositeCount=0,compositeCorrect=0,citationErrors=0,foreign=0;
 const latency=[];
 for(const [index,row]of rows.entries()){
  const start=performance.now();const retrieval=retrieve({question:row.question,corpus,vector:queries?.subarray(index*384,(index+1)*384),questionVectors,chunkVectors});const answer=resolveAnswer({question:row.question,corpus,retrieval});latency.push(performance.now()-start);
  if(row.relevantAnswerIds){positive++;if(row.relevantAnswerIds.includes(retrieval.answerCandidates[0]?.answerId))top1++;if(retrieval.answerCandidates.some(c=>row.relevantAnswerIds.includes(c.answerId)))top3++;if(answer.answer){answered++;if(!row.relevantAnswerIds.includes(answer.answerId))wrongAuto++;}}
  else if(row.usedFactIds){compositeCount++;if(answer.answer){answered++;if(answer.origin==='approved-composite'&&JSON.stringify([...answer.usedFactIds].sort())===JSON.stringify([...row.usedFactIds].sort()))compositeCorrect++;else wrongAuto++;}}
  else {negative++;if(answer.origin==='insufficient-evidence')abstained++;else wrongAuto++;}
  try{validateAnswerResult(answer,corpus);}catch{citationErrors++;}
  foreign+=answer.sources.filter(s=>s.corpusId!==physicalId||(scoped&&!inScope(corpus.documents.find(d=>d.id===s.sourceId),id))).length+retrieval.passages.filter(p=>p.corpusId!==physicalId||(scoped&&!inScope(corpus.documents.find(d=>d.id===p.documentId),id))).length;
  details.push({id:row.id,corpusId:id,question:row.question,expected:row.expect,relevantAnswerIds:row.relevantAnswerIds,usedFactIds:row.usedFactIds,candidates:retrieval.answerCandidates.map(c=>({answerId:c.answerId,score:c.score})),actualOrigin:answer.origin,actualAnswerId:answer.answerId,actualFactIds:answer.usedFactIds,sources:answer.sources.map(s=>s.sourceId)});
 }
 latency.sort((a,b)=>a-b);
 scorecards[id]={corpusVersion:corpus.corpusVersion,positiveQuestions:positive,criticalQuestions:negative,compositeQuestions:compositeCount,top1ApprovedAnswerRankingAccuracy:top1/positive,top3CandidateRecall:top3/positive,appropriateAbstentionRate:abstained/negative,incorrectAutomaticMatches:wrongAuto,invalidCitationReferences:citationErrors,crossCorpusReferences:foreign,directAnswerCoverageCommonIntents:answered/(positive+compositeCount),compositesCorrect:compositeCorrect,compositeCoverage:compositeCount?compositeCorrect/compositeCount:null,localRankAndAnswerP50Ms:latency[Math.floor(latency.length*.5)],localRankAndAnswerP95Ms:latency[Math.floor(latency.length*.95)],activeReviewedAnswers:content.answers.filter(a=>answerCurrent(a,corpus)).length};
}
await mkdir('evaluation/reports',{recursive:true});
const dataset={version,hash:digest(groups),portfolioPositive:portfolio.length,labPositive:lab.length,composites:composites.length,critical:critical.length+labCritical.length,calibrationQuestions:calibration.length,calibrationUsedForAutomaticMatching:false,ownerReviewedLabels:false};
const report={reportVersion:'efrd-evaluation-v1',measuredAt:new Date().toISOString(),softwareVersion:`${packageJson.version}+${scoped?'ux-v1.2':'efrd-v1.1'}`,scope:scoped?'Separated professional/implementation views; no new held-out fictional dataset measured. Previously inspected agent-authored labels.':'Historical combined-index baseline',sourceDigest:digest(await readFile('packages/semantic-core/src/retrieval.mjs','utf8')+await readFile('packages/semantic-core/src/answers.mjs','utf8')+await readFile('packages/semantic-core/src/scope.mjs','utf8')+await readFile('packages/semantic-core/src/technology/ontology.mjs','utf8')+await readFile('packages/semantic-core/src/technology/resolve.mjs','utf8')),mode:semantic?'semantic':'lexical',dataset,environment:{node:process.version,platform:process.platform,arch:process.arch,cpu:os.cpus()[0]?.model,browser:'Pinned Playwright Chromium for model execution; not a physical device'},scorecards,liveProviderCalls:0,cacheOnlyProviderCallsEvidence:'Evaluation calls pure local retrieval/composition functions; browser request observations recorded separately.',generationGrounding:{scenarios:20,executedLive:false,status:'Live generation disabled; fixture-only server citation tests do not establish claim entailment.'},targets:{top3Recall:.9,criticalWrongAnswers:0,citationErrors:0,crossCorpusLeaks:0},targetResults:Object.fromEntries(Object.entries(scorecards).map(([id,m])=>[id,{top3Recall:m.top3CandidateRecall>=.9,criticalWrongAnswers:m.incorrectAutomaticMatches===0,citationIntegrity:m.invalidCitationReferences===0,corpusIsolation:m.crossCorpusReferences===0}])),automaticSemanticMatchingEnabled:false,releaseAccepted:false,limits:['Agent-authored held-out wording is distinct from indexed aliases but not independently reviewed.','No statistical guarantee or live-provider grounding claim follows from a finite dataset.','Incorrect automatic-match counts and ranking accuracy are distinct; most paraphrases deliberately require explicit answer selection.','Cloudflare runtime, billing, physical-device memory and screen-reader verification remain outside this local evaluation.']};
await writeFile(`evaluation/reports/${scoped?'ux-scoped':'efrd'}-${semantic?'semantic':'lexical'}-v1.json`,JSON.stringify(report,null,2)+'\n');
await writeFile(`evaluation/reports/${scoped?'ux-scoped':'efrd'}-${semantic?'semantic':'lexical'}-cases-v1.json`,JSON.stringify(details,null,2)+'\n');
if(!scoped)await writeFile('evaluation/reports/current.json',JSON.stringify(report,null,2)+'\n');
await mkdir('evaluation/datasets',{recursive:true});for(const[id,rows]of Object.entries(groups))await writeFile(`evaluation/datasets/${scoped?'ux-scoped':'efrd'}-${id}-heldout-v1.jsonl`,rows.map(r=>JSON.stringify({...r,labelStatus:'agent-proposed-independent-review-pending'})).join('\n')+'\n');
console.log(JSON.stringify(report,null,2));
if(Object.values(scorecards).some(m=>m.incorrectAutomaticMatches||m.invalidCitationReferences||m.crossCorpusReferences))process.exitCode=1;

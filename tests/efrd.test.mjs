import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {loadContent,chunksFor} from '../scripts/indexing/content.mjs';
import {retrieve,answerCurrent,normalizeQuestion,rankVectors,lexicalScore} from '../packages/semantic-core/src/retrieval.mjs';
import {resolveAnswer,validateAnswerResult,validateRemoteGeneration} from '../packages/semantic-core/src/answers.mjs';
import {demonstrateFailure} from '../packages/semantic-core/src/failures.mjs';
import {portfolio,lab,composites,critical,labCritical,calibration} from '../evaluation/efrd-heldout.mjs';
import {fixture,unitVector} from './helpers.mjs';
async function corpus(id='portfolio'){const data=await loadContent(id);return {...data,corpusVersion:'a'.repeat(16),chunks:chunksFor(data,'a'.repeat(16))};}
const ask=(data,question)=>resolveAnswer({question,corpus:data,retrieval:retrieve({question,corpus:data})});
test('owner-approved EFRD publication records stay separate from synthetic sources',async()=>{
 const data=await corpus('lab');assert.equal(data.answers.filter(a=>a.id.startsWith('lab-answer-efrd-')).length,20);
 for(const answer of data.answers.filter(a=>a.id.startsWith('lab-answer-efrd-'))){assert.equal(answer.approval.scope,'publication');assert.ok(answerCurrent(answer,data));assert.ok(answer.alternatives.length>=3&&answer.alternatives.length<=5);assert.ok(answer.citations.every(c=>data.documents.find(d=>d.id===c.sourceId).provenance==='implementation-documentation'));}
});
test('technology importer preserves upstream hashes and independent portfolio remains canonical',async()=>{
 const data=await corpus();const upstream=JSON.parse(await readFile('../mohdvara.github.io/public/evidence/technology-experience.v1.json','utf8'));assert.equal(data.technologyEvidence.contentHash,upstream.contentHash);
 assert.equal(data.answers.find(a=>a.id==='portfolio-answer-insurance-stack').status,'retired');assert.equal(data.answers.find(a=>a.id==='portfolio-answer-wensymes-tools').status,'retired');
 assert.ok(!data.chunks.some(c=>data.retirements.retrievalExcludedDocuments.includes(c.documentId)));
});
test('all bounded technology composites use only expected approved facts and at most four citations',async()=>{
 const data=await corpus();for(const row of composites){const answer=ask(data,row.question);assert.equal(answer.origin,'approved-composite',row.question);assert.deepEqual([...answer.usedFactIds].sort(),[...row.usedFactIds].sort(),row.question);assert.ok(answer.sources.length>0&&answer.sources.length<=4);validateAnswerResult(answer,data);}
 const react=ask(data,'Which projects used React?');assert.match(react.answer,/PolicyStreet/);assert.match(react.answer,/Modern systems/);assert.doesNotMatch(react.answer,/WenSymes/);
 const hostel=ask(data,'Has he used PHP without a framework?');assert.match(hostel.answer,/unmaintained/);
 const education=ask(data,'What technologies were used in legacy education systems?');assert.match(education.answer,/PHP 5/);assert.doesNotMatch(education.answer,/Laravel/);
});
test('critical questions never become a confident technology or unrelated cached answer',async()=>{
 for(const id of ['portfolio','lab']){const data=await corpus(id);for(const row of id==='portfolio'?critical:labCritical){const answer=ask(data,row.question);assert.equal(answer.origin,'insufficient-evidence',row.question);assert.equal(answer.sources.length,0);}}
});
test('supporting citations are fixed by the cache record, never substituted from related passages',async()=>{
 const data=await corpus();const question='How can I contact you?';const retrieval=retrieve({question,corpus:data});retrieval.passages=[...data.chunks].reverse().slice(0,4);const answer=resolveAnswer({question,corpus:data,retrieval});assert.equal(answer.origin,'approved-cache');assert.deepEqual(answer.sources.map(s=>s.sourceId),['resume']);
});
test('retirement preserves vector row identity and rejects stale/foreign/expired sources',async()=>{
 const data=await fixture();data.answers[0].status='retired';const count=data.answers.reduce((n,a)=>n+1+a.alternatives.length,0),q=new Float32Array(count*384),c=new Float32Array(data.chunks.length*384);for(let i=0;i<count;i++)q[i*384+(i===2?0:1)]=1;for(let i=0;i<data.chunks.length;i++)c[i*384]=1;
 const result=retrieve({question:'unique retirement query',corpus:data,vector:unitVector(),questionVectors:q,chunkVectors:c});assert.equal(result.method,'semantic');assert.equal(result.trace.candidates[0].matchedQuestionId,data.answers[1].id);assert.ok(!result.trace.candidates.some(r=>r.answerId===data.answers[0].id));
 data.chunks[0].corpusVersion='wrong';data.documents[1].reviewAfter='2000-01-01';const filtered=retrieve({question:'engineering',corpus:data});assert.ok(!filtered.passages.some(p=>p.id===data.chunks[0].id||p.documentId===data.documents[1].id));
});
test('trace scores are actual cosine and lexical computations, with no correctness probability',async()=>{
 const data=await fixture();const count=data.answers.reduce((n,a)=>n+1+a.alternatives.length,0),vectors=new Float32Array(count*384),chunks=new Float32Array(data.chunks.length*384);for(let i=0;i<count;i++)vectors[i*384]=1;for(let i=0;i<data.chunks.length;i++)chunks[i*384]=1;
 const query='evidence relevance example';const retrieval=retrieve({question:query,corpus:data,vector:unitVector(),questionVectors:vectors,chunkVectors:chunks});for(const row of retrieval.trace.candidates){const answer=data.answers.find(a=>a.id===row.answerId);const text=row.matchedQuestionId===answer.id?answer.canonicalQuestion:answer.alternatives.find(q=>q.id===row.matchedQuestionId).text;assert.equal(row.semanticScore,1);assert.equal(row.lexicalScore,lexicalScore(query,text));assert.equal(row.selected,false);}assert.equal(rankVectors(unitVector(),vectors,count)[0].score,1);
});
test('remote generated responses reject invented URLs, wrong versions, foreign claims and excessive answer length',async()=>{
 const data=await fixture();const passages=data.chunks.slice(0,1),p=passages[0];const response={kind:'generated',requestId:'test',corpusId:data.corpusId,corpusVersion:data.corpusVersion,claims:[{text:'A bounded supported claim.',sourceIds:[p.id]}],citations:[p.citation],usage:{basis:'conservative-estimate',accountedNeurons:1}};
 assert.equal(validateRemoteGeneration(response,{corpus:data,requestId:'test',passages}),response);
 for(const mutated of [{...response,corpusVersion:'stale'},{...response,citations:[{...p.citation,url:'https://evil.test'}]},{...response,claims:[{text:'Forged',sourceIds:['foreign']}]},{...response,claims:[{text:Array(121).fill('word').join(' '),sourceIds:[p.id]}]}])assert.throws(()=>validateRemoteGeneration(mutated,{corpus:data,requestId:'test',passages}));
});
test('six isolated failure fixtures preserve local cache and never contact a generation provider',async()=>{
 const data=await corpus();for(const kind of ['model','quota','provider','wrong-match','stale','cross-corpus']){const result=await demonstrateFailure(kind,data);assert.equal(result.label,'Simulated failure scenario');assert.equal(result.realGenerationRequests,0);if(kind==='wrong-match'){assert.equal(result.topCosine,1);assert.equal(result.origin,'insufficient-evidence');}if(kind==='quota'||kind==='provider'){assert.equal(result.simulatedRequests,1);assert.equal(result.second,'blocked-locally');assert.equal(result.cacheStillAvailable,true);}if(kind==='cross-corpus')assert.equal(result.foreignPassages,0);}
});
test('held-out questions are disjoint from indexed questions and calibration without corpus mixing',async()=>{
 const data=[await corpus(),await corpus('lab')];const indexed=new Set(data.flatMap(c=>c.answers.flatMap(a=>[a.canonicalQuestion,...a.alternatives.map(q=>q.text)]).map(normalizeQuestion)));
 assert.ok(portfolio.length>=100);assert.ok(lab.length>=40);assert.ok(critical.length>=50);const questions=[...portfolio,...lab,...critical,...labCritical].map(row=>normalizeQuestion(row.question));assert.equal(new Set(questions).size,questions.length);for(const row of [...portfolio,...lab])assert.ok(!indexed.has(normalizeQuestion(row.question)),row.question);for(const row of calibration)assert.ok(!questions.includes(normalizeQuestion(row.question)));
 for(const row of [...portfolio,...lab])assert.ok(row.relevantAnswerIds.every(id=>data.find(c=>c.corpusId===row.corpusId).answers.some(a=>a.id===id&&a.status==='approved')));
});

test('professional responsibilities must not be collapsed to technology inventory answers', async()=>{
 const data=await corpus();for(const question of ['Which engagement shows work evolving an established education platform?','What public work demonstrates maintainability-focused platform evolution?','Which engagement concerns internal human-resources administration tools?'])assert.equal(ask(data,question).origin,'insufficient-evidence',question);
});
test('unsupported schema, draft evidence and forged composite facts cannot pass the answer contract',async()=>{
 const data=await corpus();const answer=ask(data,'Which projects used React?');const source=data.documents.find(d=>d.id===answer.sources[0].sourceId);source.status='draft';assert.throws(()=>validateAnswerResult(answer,data));
 const fresh=await corpus();assert.throws(()=>validateAnswerResult({...ask(fresh,'Which projects used React?'),usedFactIds:['invented']},fresh));
});
test('remote generation adapts to the same bounded answer contract only after runtime validation',async()=>{
 const {generatedAnswer}=await import('../packages/semantic-core/src/answers.mjs');const data=await fixture();const p=data.chunks[0];const value={kind:'generated',requestId:'test',corpusId:data.corpusId,corpusVersion:data.corpusVersion,modelId:'mocked-model',claims:[{text:'A bounded supported claim.',sourceIds:[p.id]}],citations:[p.citation],usage:{basis:'conservative-estimate',accountedNeurons:1}};validateRemoteGeneration(value,{corpus:data,requestId:'test',passages:[p]});const answer=generatedAnswer(value,data);assert.equal(answer.origin,'live-generation');assert.equal(answer.retrievalMethod,'live-rag');assert.equal(answer.answer,'A bounded supported claim.');
});

test('composite grammar cannot discard an additional unverified predicate',async()=>{
 const data=await corpus();for(const question of ['Which projects used React for blockchain banking?','Which projects used AWS EKS?','What technologies did you use to guarantee uptime?','Which projects used React and an undisclosed secret framework?'])assert.equal(ask(data,question).origin,'insufficient-evidence',question);
});

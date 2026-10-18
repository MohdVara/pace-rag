import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {loadContent,chunksFor} from '../scripts/indexing/content.mjs';
import {SCOPES,inScope,sourceProvenance} from '../packages/knowledge-schema/src/provenance.mjs';
import {scopeCorpus} from '../packages/semantic-core/src/scope.mjs';
import {retrieve,sourceCurrent} from '../packages/semantic-core/src/retrieval.mjs';
import {resolveAnswer,validateAnswerResult} from '../packages/semantic-core/src/answers.mjs';
async function content(id='lab') {const data=await loadContent(id);return {...data,corpusVersion:'scope-test',chunks:chunksFor(data,'scope-test')};}
test('three source views have explicit, disjoint document and answer membership',async()=>{
 const data=await content();const implementation=scopeCorpus(data,'implementation'),fictional=scopeCorpus(data,'fictional');
 assert.equal(implementation.documents.length,4);assert.equal(implementation.answers.length,20);assert.equal(fictional.documents.length,20);assert.equal(fictional.answers.length,20);
 assert(!implementation.documents.some(d=>fictional.documents.some(f=>f.id===d.id)));
 for(const [id,view]of [['implementation',implementation],['fictional',fictional]]) {
  assert(view.documents.every(d=>inScope(d,id)));assert(view.chunks.every(c=>view.documents.some(d=>d.id===c.documentId)));
  for(const record of view.answers){const result=retrieve({question:record.canonicalQuestion,corpus:view});const answer=resolveAnswer({question:record.canonicalQuestion,corpus:view,retrieval:result});assert.equal(answer.answerId,record.id);assert.equal(answer.origin,'approved-cache');validateAnswerResult(answer,view);assert(answer.sources.every(s=>view.documents.some(d=>d.id===s.sourceId)));assert(answer.relatedQuestions.every(q=>view.answers.some(a=>a.canonicalQuestion===q)));}
 }
 const professional=scopeCorpus(await content('portfolio'),'professional');assert.equal(professional.documents.length,18);assert.equal(professional.answers.filter(a=>a.status==='approved').length,38);assert(professional.documents.every(d=>inScope(d,'professional')));
});
test('view vectors retain exact original row identity including alternatives and chunks',async()=>{
 const data=await content();const rows=data.answers.flatMap(a=>[a.id,...a.alternatives.map(()=>a.id)]);
 data.questionVectors=Float32Array.from({length:rows.length*384},(_,i)=>Math.floor(i/384)+.25);
 data.chunkVectors=Float32Array.from({length:data.chunks.length*384},(_,i)=>Math.floor(i/384)+.5);
 for(const scopeId of ['implementation','fictional']){const view=scopeCorpus(data,scopeId);view.scopeRows.questionPositions.forEach((row,i)=>assert.equal(view.questionVectors[i*384],row+.25));view.scopeRows.chunkPositions.forEach((row,i)=>assert.equal(view.chunkVectors[i*384],row+.5));assert.equal(view.questionVectors.length,view.answers.reduce((n,a)=>n+1+a.alternatives.length,0)*384);assert.equal(view.chunkVectors.length,view.chunks.length*384);}
 assert.equal(data.answers.length,40);assert.equal(data.documents.length,24);
});
test('wrong source and mixed-source answers cannot survive view derivation',async()=>{
 const data=await content();data.answers.push({...data.answers[0],id:'mixed',citations:[...data.answers[0].citations,data.answers.find(a=>a.id.startsWith('lab-answer-efrd-')).citations[0]]});
 for(const id of ['implementation','fictional'])assert(!scopeCorpus(data,id).answers.some(a=>a.id==='mixed'));
 assert.throws(()=>scopeCorpus(data,'professional'),/Incompatible/);assert.throws(()=>scopeCorpus(data,'invented'),/Incompatible/);
 data.questionVectors=new Float32Array(384);assert.throws(()=>scopeCorpus(data,'implementation'),/row mismatch/);
});
test('same physical Lab corpus cannot authorize an out-of-scope citation or exact answer',async()=>{
 const all=await content();const view=scopeCorpus(all,'implementation'),foreignAnswer=all.answers.find(a=>a.id==='lab-answer-fallback'),foreign=all.documents.find(d=>d.id===foreignAnswer.citations[0].sourceId);
 view.documents.push(foreign);view.answers.push(foreignAnswer);view.chunks.push(...all.chunks.filter(c=>c.documentId===foreign.id));
 assert.equal(sourceCurrent(foreign,view),false);
 const result=retrieve({question:foreignAnswer.canonicalQuestion,corpus:view});assert.equal(result.selectedAnswer,undefined);assert(!result.passages.some(p=>p.documentId===foreign.id));
 const answer=resolveAnswer({question:foreignAnswer.canonicalQuestion,corpus:view,retrieval:result});assert.equal(answer.origin,'insufficient-evidence');assert(!answer.relatedQuestions.includes(foreignAnswer.canonicalQuestion));
});
test('all fictional sources expose actual file origin while owner-confirmed AI assistance remains separate from publication approval',async()=>{
 const data=await content(),fixtures=data.documents.filter(d=>d.provenance==='synthetic');assert.equal(fixtures.length,20);
 for(const doc of fixtures){const meta=sourceProvenance(doc);assert.equal(meta.authorship,'ai-assisted');assert.match(meta.authorshipDescription,/Human-authored with AI assistance/);assert.equal(meta.sourceNature,'synthetic-fixture');assert.equal(meta.sourceFileReference,'content/lab/records.mjs');assert.equal(meta.publicationApproved,false);assert.match(meta.documentType,/Fictional/);assert(meta.purpose);assert.match(meta.origin,/literal text/);assert(!meta.sourceFileReference.startsWith('/'));assert.equal(meta.updatedAt,undefined);}
});
test('unregistered fictional/implementation records fail closed instead of receiving invented provenance',async()=>{
 const data=await content();const unknown={...data.documents[0],id:'unverified-import'};assert.equal(inScope(unknown,'fictional'),false);assert.equal(inScope({...unknown,provenance:'implementation-documentation'},'implementation'),false);
 data.documents.push(unknown);assert(!scopeCorpus(data,'fictional').documents.some(d=>d.id===unknown.id));
});
test('real semantic vectors search each scoped view without row shifts or foreign candidates',async()=>{
 const root='apps/rag-lab/public/knowledge/lab',pointer=JSON.parse(await readFile(`${root}/current.json`,'utf8')),folder=`${root}/${pointer.corpusVersion}`,manifest=JSON.parse(await readFile(`${folder}/manifest.json`,'utf8'));
 const data={...await content(),answers:JSON.parse(await readFile(`${folder}/answers.json`,'utf8')),documents:JSON.parse(await readFile(`${folder}/documents.json`,'utf8')),chunks:JSON.parse(await readFile(`${folder}/chunks.json`,'utf8')),corpusVersion:pointer.corpusVersion};
 for(const name of ['questionVectors','chunkVectors']){const b=await readFile(`${folder}/${manifest.assets[name].path}`);data[name]=Float32Array.from({length:b.length/4},(_,i)=>b.readFloatLE(i*4));}
 for(const id of ['implementation','fictional']){const view=scopeCorpus(data,id);let row=0;for(const a of view.answers){const vector=view.questionVectors.subarray(row*384,(row+1)*384);const result=retrieve({question:a.canonicalQuestion,corpus:view,vector,questionVectors:view.questionVectors,chunkVectors:view.chunkVectors});assert.equal(result.method,'semantic');assert.equal(result.answerCandidates[0].answerId,a.id);assert(result.trace.candidates.every(c=>view.answers.some(a=>a.id===c.answerId)));assert(result.passages.every(p=>inScope(view.documents.find(d=>d.id===p.documentId),id)));row+=1+a.alternatives.length;}}
});
test('scope metadata has no unknown or duplicate primary source titles',()=>{assert.equal(Object.keys(SCOPES).length,3);assert.equal(new Set(Object.values(SCOPES).map(s=>s.title)).size,3);});

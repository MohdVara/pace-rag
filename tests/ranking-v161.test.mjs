import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fixture,unitVector} from './helpers.mjs';
import {retrieve,normalizeQuestion} from '../packages/semantic-core/src/retrieval.mjs';
import {intentAdjustment} from '../packages/semantic-core/src/hybrid.mjs';
import {resolveAnswer,validateAnswerResult} from '../packages/semantic-core/src/answers.mjs';
import {loadContent,hash} from '../scripts/indexing/content.mjs';

// Controlled equal vectors test tie and intent behavior, not embedding quality.
function equalVectors(corpus){const rows=corpus.answers.reduce((n,a)=>n+1+a.alternatives.length,0),q=new Float32Array(rows*384),c=new Float32Array(corpus.chunks.length*384);for(let i=0;i<rows;i++)q[i*384]=1;for(let i=0;i<corpus.chunks.length;i++)c[i*384]=1;return{vector:unitVector(),questionVectors:q,chunkVectors:c};}
test('new specialized candidates cannot win an equal-evidence broad intent solely from comparison wording',async()=>{
 const c=await fixture(),base=c.answers[0];c.answers=[{...base,id:'scope',canonicalQuestion:'What is the operational work about?',alternatives:[],answerText:'Operational work.'},{...base,id:'comparison',canonicalQuestion:'Are the old and current projects the same engagement?',alternatives:[],answerText:'Operational work.'}];
 const r=retrieve({question:'Describe operational work',corpus:c,...equalVectors(c)});assert.equal(r.answerCandidates[0].answerId,'scope');assert.equal(r.selectedAnswer,undefined);
 assert(intentAdjustment('Are these the same engagement?',c.answers[1])>intentAdjustment('Describe operational work',c.answers[1]));
});
test('plain what-is wording and property income do not imply overview or measured financial uplift',()=>{
 assert.equal(intentAdjustment('What is the general approach to solving problems?',{canonicalQuestion:'What is your current engagement about?'}),0);
 assert(intentAdjustment('Explain income records and contract expenses',{canonicalQuestion:'Is there a measured revenue result?'})<=0);
 assert(intentAdjustment('Was there a measured revenue gain?',{canonicalQuestion:'Is there a measured revenue result?'})>0);
});
test('query token order and eligible record order preserve deterministic candidate IDs under equal evidence',async()=>{
 const c=await fixture();c.answers=c.answers.slice(0,5).map(a=>({...a,canonicalQuestion:'Shared searchable topic?',alternatives:[],answerText:'Shared topic evidence.'}));
 const run=(question,corpus)=>retrieve({question,corpus,...equalVectors(corpus)}).answerCandidates.map(a=>a.answerId);
 const expected=run('shared topic',c);assert.deepEqual(run('topic shared',c),expected);assert.deepEqual(run('shared topic',{...c,answers:[...c.answers].reverse()}),expected);assert.deepEqual(run('shared topic',c),expected);
});
test('explicit project aliases preserve project ownership when unrelated new candidates share generic semantic evidence',async()=>{
 const c=await fixture(),base=c.answers[0];c.answers=[{...base,id:'insurance-scope',canonicalQuestion:'What engineering work is disclosed for PolicyStreet?',alternatives:[],answerText:'Engineering work.'},{...base,id:'other-project',canonicalQuestion:'What engineering work is disclosed for WenSymes?',alternatives:[],answerText:'Engineering work.'}];
 for(const question of ['Describe PolicyStreet engineering work','Describe insurance engineering work','Describe insurer engineering work']){const r=retrieve({question,corpus:c,...equalVectors(c)});assert.equal(r.answerCandidates[0].answerId,'insurance-scope');assert.equal(r.selectedAnswer,undefined);}
});
test('new ranker rejects stale v1.5 semantic reuse calibration',async()=>{
 const c=await fixture();for(const a of c.answers)a.matchPolicy={mode:'calibrated-auto',protectedFacets:[]};const question='Unreviewed searchable paraphrase';
 const r=retrieve({question,corpus:c,...equalVectors(c),policy:{rankingVersion:'answer-precision-v15',calibrated:true,corpusVersion:c.corpusVersion,minScore:0,minMargin:-1,eligibleAnswerIds:c.answers.map(a=>a.id),exactQueries:[normalizeQuestion(question)]}});assert.equal(r.selectedAnswer,undefined);
});
test('five newly approved answers and their project ownership survive the correction; stale and foreign citations fail closed',async()=>{
 const c={...await loadContent('portfolio',{release:true}),chunks:[],corpusVersion:'v161-unit'};
 const proposal=JSON.parse(await readFile('content/portfolio/staged-v16/proposal.json'));
 for(const n of proposal.newAnswers){const r=retrieve({question:n.canonicalQuestion,corpus:c}),a=resolveAnswer({question:n.canonicalQuestion,corpus:c,retrieval:r});assert.equal(a.answerId,n.id);validateAnswerResult(a,c);assert(a.sources.every(s=>s.corpusId==='portfolio'));const bad=structuredClone(c);bad.answers.find(a=>a.id===n.id).citations[0].sourceHash='0'.repeat(64);assert(!retrieve({question:n.canonicalQuestion,corpus:bad}).selectedAnswer);bad.answers.find(a=>a.id===n.id).citations[0].corpusId='lab';assert(!retrieve({question:n.canonicalQuestion,corpus:bad}).selectedAnswer);}
});
test('legacy answers remain eligible and the frozen evaluation and approved records have not changed',async()=>{
 const freeze=JSON.parse(await readFile('evaluation/baselines/ranking-v16/freeze.json'));for(const [path,digest]of Object.entries({...freeze.files,...freeze.baselineFiles}))if(!path.startsWith('packages/semantic-core/'))assert.equal(hash(await readFile(path)),digest,path);
 const c={...await loadContent('portfolio',{release:true}),chunks:[],corpusVersion:'v161-unit'};for(const a of c.answers.filter(a=>a.status==='approved'))assert.equal(retrieve({question:a.canonicalQuestion,corpus:c}).selectedAnswer?.id,a.id);
});
test('future knowledge, ranker or index changes and safety regressions invalidate publication comparison',async()=>{
 const {assertRankingReview}=await import('../scripts/ranking-review-check.mjs');const r=JSON.parse(await readFile('evaluation/reports/v161-semantic-paired.json'));
 const expected={fingerprint:r.contentFingerprint,ranking:r.rankingSha256,freezeHash:r.evaluationFreezeHash,corpusVersion:r.corpora.v16};assertRankingReview(r,expected);
 for(const key of Object.keys(expected))assert.throws(()=>assertRankingReview(r,{...expected,[key]:'changed'}));
 const unsafe=structuredClone(r);unsafe.sets.development.corrected.citationFailures++;assert.throws(()=>assertRankingReview(unsafe,expected),/safety/);
 const missing=structuredClone(r);missing.sets.candidateExact.corrected.directAnswers--;assert.throws(()=>assertRankingReview(missing,expected),/coverage/);
});

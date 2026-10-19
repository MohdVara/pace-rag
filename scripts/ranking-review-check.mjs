// Read-only freshness guard: a new approved corpus/ranker needs an explicit paired audit.
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {loadContent,hash} from './indexing/content.mjs';
export function assertRankingReview(r,{fingerprint,ranking,freezeHash,corpusVersion}){
 assert.equal(r.contentFingerprint,fingerprint,'Approved knowledge changed: explicit before/after ranking comparison required');
 assert.equal(r.rankingSha256,ranking,'Ranker changed: rerun the paired ranking comparison');
 assert.equal(r.evaluationFreezeHash,freezeHash,'Evaluation freeze changed');
 assert.equal(r.corpora.v16,corpusVersion,'Ranking report uses a stale index');
 for(const metrics of [...Object.values(r.sets).map(s=>s.corrected),r.implementation])assert.equal(metrics.incorrectAutomaticAnswers+metrics.citationFailures+metrics.crossCorpusReferences+metrics.criticalQuestions-metrics.criticalAbstained,0,'Ranking safety regression');
 assert.equal(r.sets.candidateExact.corrected.directAnswers,8,'Approved answer coverage lost');
}
export async function verifyRankingReview(){
 const fingerprint=hash(JSON.stringify(await loadContent('portfolio',{release:true})));
 const ranking=hash(await readFile('packages/semantic-core/src/retrieval.mjs','utf8')+await readFile('packages/semantic-core/src/hybrid.mjs','utf8'));
 const freezeBytes=await readFile('evaluation/baselines/ranking-v16/freeze.json'),freezeHash=hash(freezeBytes),freeze=JSON.parse(freezeBytes);
 for(const [path,digest]of Object.entries({...freeze.files,...freeze.baselineFiles}))if(!path.startsWith('packages/semantic-core/'))assert.equal(hash(await readFile(path)),digest,'Frozen input changed: '+path);
 const pointer=JSON.parse(await readFile('apps/rag-lab/public/knowledge/portfolio/current.json'));
 for(const mode of ['semantic','lexical']){
  const r=JSON.parse(await readFile(`evaluation/reports/v161-${mode}-paired.json`));
  assertRankingReview(r,{fingerprint,ranking,freezeHash,corpusVersion:pointer.corpusVersion});
 }
 console.log('Explicit paired semantic/lexical review matches approved content, ranker and corpus. Recovery targets are reported separately.');
}

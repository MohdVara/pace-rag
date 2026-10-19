import test from 'node:test';import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {draftProfessionalV16} from '../scripts/stage-professional-v16.mjs';
import {simulatedReviewedDraftsV16} from '../scripts/knowledge-v16-fixture.mjs';
import {validateCorpus} from '../packages/knowledge-schema/src/validate.mjs';
import {retrieve,answerCurrent} from '../packages/semantic-core/src/retrieval.mjs';
import {resolveAnswer,validateAnswerResult} from '../packages/semantic-core/src/answers.mjs';
import {scopeCorpus} from '../packages/semantic-core/src/scope.mjs';

test('professional v1.6 drafts carry refreshed citations without becoming eligible or publication-approved',async()=>{
 const{base,corpus,proposal}=await draftProfessionalV16();
 for(const id of Object.keys(proposal.documents)){const d=corpus.documents.find(d=>d.id===id);assert.equal(d.status,'draft');assert.equal(d.version,'2');assert.equal(d.approval,null);assert.notEqual(d.contentHash,base.documents.find(d=>d.id===id).contentHash);}
 for(const a of corpus.answers.filter(a=>a.version==='2'||proposal.newAnswers.some(n=>n.id===a.id))){assert(!answerCurrent(a,corpus));assert.equal(a.approval,null);for(const c of a.citations){const d=corpus.documents.find(d=>d.id===c.sourceId);assert.equal(c.sourceHash,d.contentHash);assert.equal(c.documentVersion,d.version);}}
 assert.throws(()=>validateCorpus(corpus,{release:true}),/approval/);
 for(const n of proposal.newAnswers){const r=retrieve({question:n.canonicalQuestion,corpus:{...corpus,chunks:[],corpusVersion:'draft'}});assert.equal(r.selectedAnswer,undefined);assert(!r.answerCandidates.some(c=>c.answerId===n.id));}
 assert.equal((await readFile('content/portfolio/approvals.json','utf8')).includes('AUTOMATED-HYPOTHETICAL'),false);
});
test('hypothetical draft fixture supports exact candidate wording but is rejected for release',async()=>{
 const c=scopeCorpus(await simulatedReviewedDraftsV16(),'professional'),{proposal}=await draftProfessionalV16();assert.throws(()=>validateCorpus(c,{release:true}),/publication-scoped/);
 for(const n of proposal.newAnswers){const r=retrieve({question:n.canonicalQuestion,corpus:c}),a=resolveAnswer({question:n.canonicalQuestion,corpus:c,retrieval:r});assert.equal(a.answerId,n.id);assert.equal(a.origin,'approved-cache');validateAnswerResult(a,c);assert(a.sources.every(s=>s.corpusId==='portfolio'));}
 const q='Did WenSymes implement a fully configurable RBAC engine?',a=resolveAnswer({question:q,corpus:c,retrieval:retrieve({question:q,corpus:c})});assert.match(a.answer,/does not establish/);assert.doesNotMatch(a.answer,/implemented a fully configurable/);
});
test('refreshed sources keep old HR/education/WenSymes boundaries, retirements and ontology unchanged',async()=>{
 const{base,corpus}=await draftProfessionalV16();assert.deepEqual(corpus.technologyEvidence,base.technologyEvidence);assert.deepEqual(corpus.retirements.answerIds,base.retirements.answerIds);
 assert.deepEqual(corpus.documents.find(d=>d.id==='hr'),base.documents.find(d=>d.id==='hr'));
 assert.match(corpus.documents.find(d=>d.id==='education').text,/not attributed to WenSymes/);assert.match(corpus.documents.find(d=>d.id==='wensymes').text,/distinct from.*2016–2017/);
 for(const id of corpus.retirements.answerIds)assert.equal(corpus.answers.find(a=>a.id===id).status,'retired');
 const sim=scopeCorpus(await simulatedReviewedDraftsV16(),'professional');assert(sim.documents.every(d=>d.provenance!=='synthetic'&&d.provenance!=='implementation-documentation'));
 for(const q of ['Which Redis TTL settings expired PolicyStreet cache keys?','What digital-signature provider signed rental contracts on phones?','Which automated HRMS emails were sent before document expiration?']){const a=resolveAnswer({question:q,corpus:sim,retrieval:retrieve({question:q,corpus:sim})});assert.equal(a.origin,'insufficient-evidence');}
});

test('owner-approved v1.6 activation preserves versions, citations and retirement boundaries',async()=>{
 const {loadContent,approvalHash,hash}=await import('../scripts/indexing/content.mjs');const c=await loadContent('portfolio',{release:true});
 const receipt=JSON.parse(await readFile('content/portfolio/v16-owner-approval.json','utf8'));
 assert.equal(receipt.scope,'publication');assert.equal(receipt.reviewManifestSha256,hash(await readFile('content/portfolio/staged-v16/review-manifest.json')));
 for(const id of ['insurance','education','rental','wensymes']){const d=c.documents.find(d=>d.id===id);assert.equal(d.version,'2');assert.equal(d.approval.scope,'publication');assert.equal(d.approval.contentHash,approvalHash(d));}
 assert.equal(c.answers.filter(a=>a.status==='approved').length,43);for(const id of c.retirements.answerIds)assert.equal(c.answers.find(a=>a.id===id).status,'retired');
 assert.equal(c.retirements.retrievalExcludedDocuments.length,0);
 const scoped=scopeCorpus({...c,corpusVersion:'activation-test',chunks:[]},'professional');
 for(const n of JSON.parse(await readFile('content/portfolio/staged-v16/proposal.json')).newAnswers){const a=resolveAnswer({question:n.canonicalQuestion,corpus:scoped,retrieval:retrieve({question:n.canonicalQuestion,corpus:scoped})});assert.equal(a.answerId,n.id);assert.equal(a.origin,'approved-cache');assert.equal(a.approvalScope,'publication');validateAnswerResult(a,scoped);}
 const unapproved=await loadContent('portfolio',{applyApprovals:false});assert(unapproved.answers.every(a=>a.status!=='approved'));await assert.rejects(loadContent('portfolio',{release:true,applyApprovals:false}),/approval/i);
});

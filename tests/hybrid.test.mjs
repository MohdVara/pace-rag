import test from 'node:test';
import assert from 'node:assert/strict';
import {answerLexicalScores} from '../packages/semantic-core/src/hybrid.mjs';
import {retrieve,normalizeQuestion} from '../packages/semantic-core/src/retrieval.mjs';
import {fixture,unitVector} from './helpers.mjs';
import {verification} from '../evaluation/verification-v13.mjs';
import {portfolio,critical} from '../evaluation/efrd-heldout.mjs';

test('answer-body terms recover a fact absent from question wording without selecting an automatic answer',async()=>{
 const data=await fixture(), location=data.answers.find(a=>a.id==='portfolio-answer-location');
 const query='Sabah geographical base';
 const scores=answerLexicalScores(query,data.answers);
 assert(scores.get(location.id)>0);
 const result=retrieve({question:query,corpus:data});
 assert(result.answerCandidates.some(c=>c.answerId===location.id));
 assert.equal(result.selectedAnswer,undefined);
 location.status='retired';
 assert(!retrieve({question:query,corpus:data}).answerCandidates.some(c=>c.answerId===location.id));
});
test('old cosine calibration cannot authorize hybrid selection, even with exact query allowlist',async()=>{
 const data=await fixture(), count=data.answers.reduce((n,a)=>n+1+a.alternatives.length,0);
 const questions=new Float32Array(count*384), chunks=new Float32Array(data.chunks.length*384);
 for(let i=0;i<count;i++)questions[i*384]=1;
 for(let i=0;i<data.chunks.length;i++)chunks[i*384]=1;
 const query='Sabah geographical base';
 for(const a of data.answers)a.matchPolicy={mode:'calibrated-auto',protectedFacets:[]};
 const result=retrieve({question:query,corpus:data,vector:unitVector(),questionVectors:questions,chunkVectors:chunks,policy:{calibrated:true,corpusVersion:data.corpusVersion,minScore:0,minMargin:0,eligibleAnswerIds:data.answers.map(a=>a.id),exactQueries:[normalizeQuestion(query)]}});
 assert.equal(result.selectedAnswer,undefined);
 assert(result.trace.candidates.every(c=>c.semanticScore===1&&Number.isFinite(c.answerLexicalScore)));
});
test('separate final verification wording overlaps neither indexed aliases nor original development questions',async()=>{
 const data=await fixture();
 const indexed=new Set(data.answers.flatMap(a=>[a.canonicalQuestion,...a.alternatives.map(q=>q.text)]).map(normalizeQuestion));
 const development=new Set([...portfolio,...critical].map(r=>normalizeQuestion(r.question)));
 assert.equal(verification.filter(r=>r.relevantAnswerIds).length,50);
 assert.equal(verification.filter(r=>!r.relevantAnswerIds).length,20);
 for(const row of verification){assert(!indexed.has(normalizeQuestion(row.question)),row.id);assert(!development.has(normalizeQuestion(row.question)),row.id);}
});

test('bounded canonical-question intent adjustment cannot change answer authorization',async()=>{
 const {intentAdjustment}=await import('../packages/semantic-core/src/hybrid.mjs');
 const data=await fixture();
 const impact=data.answers.find(a=>a.id==='portfolio-answer-rental-impact'),report=data.answers.find(a=>a.id==='portfolio-answer-rental-reporting');
 assert(intentAdjustment('Is there a measured revenue result?',impact)>intentAdjustment('Is there a measured revenue result?',report));
 for(const a of data.answers)assert(intentAdjustment('career contact architecture preview availability',a)<=.16);
 const result=retrieve({question:'Is there a measured revenue result?',corpus:data});assert.equal(result.selectedAnswer,undefined);
});
test('v1.4 frozen verification is distinct from indexed, original and prior verification wording',async()=>{
 const {verificationV14}=await import('../evaluation/verification-v14.mjs');const data=await fixture();
 const known=new Set([...data.answers.flatMap(a=>[a.canonicalQuestion,...a.alternatives.map(q=>q.text)]),...[...portfolio,...critical,...verification].map(r=>r.question)].map(normalizeQuestion));
 assert.equal(verificationV14.filter(r=>r.relevantAnswerIds).length,40);assert.equal(verificationV14.filter(r=>!r.relevantAnswerIds).length,20);
 for(const row of verificationV14){assert(!known.has(normalizeQuestion(row.question)),row.id);for(const id of row.relevantAnswerIds||[])assert(data.answers.some(a=>a.id===id),id);}
});

test('summary intent excludes document navigation and broad about clauses',async()=>{
 const {intentAdjustment}=await import('../packages/semantic-core/src/hybrid.mjs');
 const summary={canonicalQuestion:'What is your engineering background?'},topic={canonicalQuestion:'What is this project about?'};
 assert.equal(intentAdjustment('Where is a concise career document?',summary),0);
 assert.equal(intentAdjustment('What do these records establish about migrations?',topic),0);
 assert(intentAdjustment('Where have you been leading teams?',{canonicalQuestion:'What leadership experience is documented?'})>0);
});

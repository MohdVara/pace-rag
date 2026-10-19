import { answerLexicalScores } from './hybrid.mjs';
import { inScope } from '../../knowledge-schema/src/provenance.mjs';
import { normalizeText, validateVector } from '../../knowledge-schema/src/validate.mjs';
const stop = new Set('a an the is are what how has have this that about with of to and in my me can does did for'.split(' '));
const terms = text => (normalizeText(text).toLowerCase().match(/[\p{L}\p{N}]+/gu) || []).filter(t => !stop.has(t));
export const normalizeQuestion = text => normalizeText(text).toLowerCase().replace(/[?!.]+$/g, '').replace(/\s+/g, ' ');
export function lexicalScore(query, text) {
  const q=[...new Set(terms(query))], t=terms(text); if(!q.length||!t.length)return 0;
  const counts=new Map();for(const word of t)counts.set(word,(counts.get(word)||0)+1);
  return q.reduce((score,word)=>score+(counts.has(word)?1+Math.log(1+counts.get(word))/Math.log(3):0),0)/q.length;
}
export function cosine(a,b){let dot=0;for(let i=0;i<a.length;i++)dot+=a[i]*b[i];return dot;}
export function rankVectors(query,vectors,rows){validateVector(query);if(vectors.length!==rows*384)throw new Error('Index length mismatch');return Array.from({length:rows},(_,row)=>({row,score:cosine(query,vectors.subarray(row*384,(row+1)*384))})).sort((a,b)=>b.score-a.score||a.row-b.row);}
export function sourceCurrent(doc, corpus, now=Date.now()) {return !!doc && (!corpus.scopeId || inScope(doc, corpus.scopeId)) && doc.corpusId===corpus.corpusId && doc.status==='approved' && !!doc.approval && Date.parse(doc.reviewAfter)>now;}
export function answerCurrent(answer,corpus,now=Date.now()) {
  return answer.corpusId===corpus.corpusId && answer.status==='approved' && !!answer.approval && Date.parse(answer.reviewAfter)>now && answer.citations.length>0 && answer.citations.every(c=>{
    const doc=corpus.documents.find(d=>d.id===c.sourceId);
    return sourceCurrent(doc,corpus,now)&&c.corpusId===corpus.corpusId&&c.sourceHash===doc.contentHash&&c.documentVersion===doc.version&&c.url===doc.canonicalUrl;
  });
}
/**
 * @param {{question:string, corpus:any, vector?:Float32Array, questionVectors?:Float32Array, chunkVectors?:Float32Array, policy?:any}} input
 * @returns {import("../../knowledge-schema/src/contracts").LocalRetrieval}
 */
export function retrieve({question,corpus,vector=undefined,questionVectors=undefined,chunkVectors=undefined,policy=undefined}) {
  const started=performance.now(),now=Date.now();
  // Preserve original index rows while filtering status; never shift a vector to another answer.
  const allRows=corpus.answers.flatMap(a=>[{answerId:a.id,questionId:a.id,text:a.canonicalQuestion},...a.alternatives.map(q=>({answerId:a.id,questionId:q.id,text:q.text}))]).map((row,index)=>({...row,row:index}));
  const active=corpus.answers.filter(a=>answerCurrent(a,corpus,now));const ids=new Set(active.map(a=>a.id));
  const semantic=!!vector&&questionVectors?.length===allRows.length*384&&chunkVectors?.length===corpus.chunks.length*384;
  const lexical=answerLexicalScores(question,active), maximum=Math.max(...lexical.values(),1);
  const ranked=(semantic?rankVectors(vector,questionVectors,allRows.length).map(r=>({...allRows[r.row],score:r.score,semanticScore:r.score})):allRows.map(row=>({...row,score:lexicalScore(question,row.text),semanticScore:null}))).filter(row=>ids.has(row.answerId));
  const seen=new Map();
  for(const row of ranked){const prior=seen.get(row.answerId);if(!prior||row.score>prior.score)seen.set(row.answerId,row);}
  const distinct=[...seen.values()].map(row=>({...row,score:semantic ? .65*row.score+.35*(lexical.get(row.answerId)||0)/maximum : (lexical.get(row.answerId)||0)/maximum})).filter(row=>row.score>0).sort((a,b)=>b.score-a.score||a.row-b.row);
  const candidates=distinct.slice(0,3);
  const matching=active.find(a=>[a.canonicalQuestion,...a.alternatives.map(q=>q.text)].some(q=>normalizeQuestion(q)===normalizeQuestion(question)));
  let selected=matching;
  const best=active.find(a=>a.id===candidates[0]?.answerId),margin=(candidates[0]?.semanticScore||0)-(candidates[1]?.semanticScore||0);
  if(!selected&&semantic&&policy?.rankingVersion==='answer-hybrid-v1'&&policy?.calibrated&&policy.corpusVersion===corpus.corpusVersion&&best?.matchPolicy.mode==='calibrated-auto'&&!best.matchPolicy.protectedFacets.length&&policy.eligibleAnswerIds?.includes(best.id)&&candidates[0].semanticScore>=policy.minScore&&margin>=policy.minMargin&&policy.exactQueries?.includes(normalizeQuestion(question)))selected=best;
  const chunkRank=(semantic?rankVectors(vector,chunkVectors,corpus.chunks.length).map(r=>({...corpus.chunks[r.row],score:r.score})):corpus.chunks.map(c=>({...c,score:lexicalScore(question,c.embeddingInput)})).sort((a,b)=>b.score-a.score));
  const passages=[],perDoc=new Map();
  for(const chunk of chunkRank){
    const doc=corpus.documents.find(d=>d.id===chunk.documentId);
    if(chunk.score<=0||!sourceCurrent(doc,corpus,now)||corpus.retirements?.retrievalExcludedDocuments.includes(doc.id)||chunk.corpusId!==corpus.corpusId||chunk.corpusVersion!==corpus.corpusVersion||chunk.documentVersion!==doc.version||chunk.citation?.sourceHash!==doc.contentHash||chunk.citation?.url!==doc.canonicalUrl||chunk.citation?.corpusId!==corpus.corpusId)continue;
    if(passages.some(p=>p.documentId===chunk.documentId&&Math.abs(p.ordinal-chunk.ordinal)<=1)||(perDoc.get(chunk.documentId)||0)>=2)continue;
    passages.push({...chunk,chunkId:chunk.id,lexicalScore:lexicalScore(question,chunk.embeddingInput),semanticScore:semantic?chunk.score:null});perDoc.set(chunk.documentId,(perDoc.get(chunk.documentId)||0)+1);if(passages.length===4)break;
  }
  return {corpusId:corpus.corpusId,corpusVersion:corpus.corpusVersion,method:semantic?'semantic':'lexical',answerCandidates:candidates.map(c=>({...c,matchedQuestionId:c.questionId})),passages,selectedAnswer:selected,
    decision:selected?'approved-answer':candidates.length?'related-questions':passages.length?'passages':'insufficient-evidence',
    reasons:[selected?'Exact approved question or reviewed alternative':semantic?'Similarity ranks relevance; equivalence is not assumed':'Lexical fallback; no remote inference'],
    trace:{query:question,corpusId:corpus.corpusId,corpusVersion:corpus.corpusVersion,method:semantic?'semantic':'lexical',candidateRecordsSearched:active.length,questionRowsSearched:ranked.length,retrievedChunks:passages.length,rankingLatencyMs:performance.now()-started,candidates:distinct.slice(0,10).map((row,index)=>({rank:index+1,answerId:row.answerId,title:active.find(a=>a.id===row.answerId).canonicalQuestion,sourceTitles:active.find(a=>a.id===row.answerId).citations.map(c=>c.title),matchedQuestionId:row.questionId,score:row.score,semanticScore:row.semanticScore,lexicalScore:lexicalScore(question,row.text),answerLexicalScore:lexical.get(row.answerId)||0,selected:row.answerId===selected?.id,reason:row.answerId===selected?.id?'Exact reviewed wording':index<3?'Related question; automatic reuse withheld':'Lower-ranked relevant candidate'}))}};
}

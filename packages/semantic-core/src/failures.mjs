import { retrieve } from './retrieval.mjs';
import { resolveAnswer } from './answers.mjs';
export async function demonstrateFailure(kind,corpus) {
  const clone=structuredClone(corpus);delete clone.questionVectors;delete clone.chunkVectors;
  let question='browser embedding model unavailable',vectors;
  if(kind==='quota'||kind==='provider') {
    let simulatedRequests=0,paused=false;
    const attempt=async()=>{if(paused)return 'blocked-locally';simulatedRequests++;if(kind==='provider')await new Promise(resolve=>setTimeout(resolve,25));paused=true;return kind==='quota'?'quota-denied':'provider-unavailable';};
    const first=await attempt(),second=await attempt();
    const row=clone.answers.find(a=>a.status==='approved');
    const retrieval=retrieve({question:row.canonicalQuestion,corpus:clone});
    return {label:'Simulated failure scenario',kind,simulatedRequests,realGenerationRequests:0,first,second,cacheStillAvailable:!!retrieval.selectedAnswer,explanation:'Isolated in-memory transport; no provider outage, quota or bill was observed. No recovery time is promised.'};
  }
  if(kind==='wrong-match') {
    question='Prove an enterprise RAG platform handled a million customers';
    const rows=clone.answers.reduce((sum,a)=>sum+1+a.alternatives.length,0);
    const query=new Float32Array(384);query[0]=1;
    const questions=new Float32Array(rows*384);for(let i=0;i<rows;i++)questions[i*384]=1;
    const chunks=new Float32Array(clone.chunks.length*384);for(let i=0;i<clone.chunks.length;i++)chunks[i*384]=1;
    vectors={vector:query,questionVectors:questions,chunkVectors:chunks};
  }
  if(kind==='stale') {
    const row=clone.answers.find(a=>a.status==='approved');question=row.canonicalQuestion;
    for(const c of row.citations)clone.documents.find(d=>d.id===c.sourceId).status='retired';
    clone.chunks=clone.chunks.map(c=>({...c,corpusVersion:'stale-release'}));
  }
  if(kind==='cross-corpus') {
    question='show injected foreign evidence';
    clone.chunks.unshift({...clone.chunks[0],id:'injected-foreign',corpusId:clone.corpusId==='portfolio'?'lab':'portfolio',embeddingInput:question});
  }
  const retrieval=retrieve({question,corpus:clone,...vectors});const answer=resolveAnswer({question,corpus:clone,retrieval});
  return {label:'Simulated failure scenario',kind,method:retrieval.method,origin:answer.origin,topCosine:retrieval.trace.candidates[0]?.semanticScore??null,topScore:retrieval.trace.candidates[0]?.score??null,passages:retrieval.passages.length,foreignPassages:retrieval.passages.filter(p=>p.corpusId!==clone.corpusId).length,cacheStillAvailable:clone.answers.some(a=>a.status==='approved'),realGenerationRequests:0,explanation:kind==='wrong-match'?'Engineered unit vectors force cosine 1.0; automatic reuse is still withheld. This does not measure model quality.':kind==='model'?'Worker initialization is simulated as unavailable; the real lexical retrieval function is used. Browser tests separately intercept actual worker/model requests.':'The real authorization filters reject the isolated retired/stale/foreign fixture.'};
}

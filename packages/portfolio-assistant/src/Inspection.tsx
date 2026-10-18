import type { AnswerResult, RetrievalResult } from '../../knowledge-schema/src/contracts';
import type { LoadedCorpus } from '../../semantic-core/src/load';
export interface InteractionResources { requested: boolean; sent: number; received: boolean; renderMs?: number; embeddingMs?: number; failure?: string }
export default function Inspection({corpus,retrieval,answer,resources}:{corpus:LoadedCorpus;retrieval:RetrievalResult;answer:AnswerResult;resources:InteractionResources}) {
  return <details className="pace-inspection"><summary>Inspect this retrieval</summary>
    <h3>Retrieval overview</h3>
    <dl><dt>Actual query</dt><dd>{retrieval.trace.query}</dd><dt>Corpus / index version</dt><dd>{corpus.corpusId} / {corpus.corpusVersion}</dd>
      <dt>Method / answer origin</dt><dd>{retrieval.method} / {answer.origin}</dd>
      <dt>Approved records / question rows searched</dt><dd>{retrieval.trace.candidateRecordsSearched} / {retrieval.trace.questionRowsSearched}</dd>
      <dt>Retrieved chunks</dt><dd>{retrieval.trace.retrievedChunks}</dd><dt>Ranking latency</dt><dd>{retrieval.trace.rankingLatencyMs.toFixed(2)} ms</dd>
      <dt>Result preparation (including model when used)</dt><dd>{resources.renderMs?.toFixed(1) ?? 'Not measured'} ms</dd>
      <dt>Embedding model for this interaction</dt><dd>{retrieval.method==='semantic'?`${corpus.manifest.embedding.modelId} · ${corpus.manifest.embedding.dtype} · ${corpus.manifest.embedding.backend}`:'Not used'}</dd>
      {retrieval.method==='semantic'&&<><dt>Model revision</dt><dd>{corpus.manifest.embedding.revision}</dd><dt>Embedding duration</dt><dd>{resources.embeddingMs?.toFixed(1) ?? 'Not measured'} ms</dd></>}
    </dl>
    <h3>Ranked question candidates</h3><p>Cosine similarity is a relevance signal, not a percentage probability that an answer is correct. No combined score is used.</p>
    <ol className="pace-candidate-ranking">{retrieval.trace.candidates.map(candidate=><li key={candidate.answerId}>
      <strong>{candidate.title}</strong><p>Source records: {candidate.sourceTitles.join("; ")}</p><p>Rank {candidate.rank} · cosine: {candidate.semanticScore===null?'Not used':candidate.semanticScore.toFixed(4)} · lexical: {candidate.lexicalScore.toFixed(4)}</p>
      <p>{answer.answerId===candidate.answerId?'Selected reviewed answer':candidate.reason}.</p>
    </li>)}</ol>
    <h3>Evidence selection</h3><p>{answer.sources.length} supporting sources belong to the chosen answer. Other retrieved passages remain separately labelled below.</p>
    {answer.usedFactIds&&<p>Structured records used: {answer.usedFactIds.join(', ')}. Template version: {answer.answerVersion}.</p>}
    <h3>Generation and resource behavior</h3><dl><dt>Remote generation requested</dt><dd>{resources.requested?'Yes':'No'}</dd><dt>Generation API requests sent</dt><dd>{resources.sent}</dd><dt>Response received</dt><dd>{resources.received?'Yes':'No'}</dd><dt>Workers AI inference calls</dt><dd>{resources.sent?'Not measured (gateway dispatch is not provider billing)':'0'}</dd><dt>Provider tokens / neuron bill</dt><dd>Not measured</dd><dt>Browser memory</dt><dd>Not measured</dd><dt>Path</dt><dd>{resources.sent?'Explicit remote attempt; local results preserved':'Local cache / facts / retrieval only'}</dd>{resources.failure&&<><dt>Failure</dt><dd>{resources.failure}</dd></>}</dl>
    <p>Traces stay in this component’s memory. No visitor query is written to analytics or public evaluation artifacts.</p>
  </details>;
}

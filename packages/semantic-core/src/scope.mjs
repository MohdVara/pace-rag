import { SCOPES, inScope } from '../../knowledge-schema/src/provenance.mjs';
/** Derive a search view only AFTER the immutable release has passed integrity checks.
 * Copy vector rows using original positions, never reinterpret a filtered row number.
 * Original manifest remains the immutable-release contract; view rows are explicit.
 */
export function scopeCorpus(corpus, scopeId) {
 const scope = SCOPES[scopeId];
 if (!scope || scope.corpusId !== corpus.corpusId) throw new Error('Incompatible knowledge source');
 const documents = corpus.documents.filter(doc => inScope(doc, scopeId));
 const ids = new Set(documents.map(doc => doc.id));
 const answers = corpus.answers.filter(a => a.citations.length && a.citations.every(c => ids.has(c.sourceId)));
 const answerIds = new Set(answers.map(a => a.id));
 const rows = corpus.answers.flatMap(a => [a.id, ...a.alternatives.map(() => a.id)]);
 const questionPositions = rows.flatMap((id, row) => answerIds.has(id) ? [row] : []);
 const chunkPositions = corpus.chunks.flatMap((c, row) => ids.has(c.documentId) ? [row] : []);
 const select = (vectors, positions, total) => {
  if (!vectors) return undefined;
  if (vectors.length !== total * 384) throw new Error('Scope vector row mismatch');
  const selected = new Float32Array(positions.length * 384);
  positions.forEach((row, i) => selected.set(vectors.subarray(row * 384, (row + 1) * 384), i * 384));
  return selected;
 };
 return {...corpus, scopeId, documents, answers,
  chunks: chunkPositions.map(row => corpus.chunks[row]),
  scopeRows: {questionPositions, chunkPositions},
  questionVectors: select(corpus.questionVectors, questionPositions, rows.length),
  chunkVectors: select(corpus.chunkVectors, chunkPositions, corpus.chunks.length),
  technologyEvidence: scopeId === 'professional' ? corpus.technologyEvidence : undefined,
 };
}

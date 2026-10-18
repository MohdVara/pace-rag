import test from "node:test";
import assert from "node:assert/strict";
import { fixture, unitVector } from "./helpers.mjs";
import {
  retrieve,
  rankVectors,
} from "../packages/semantic-core/src/retrieval.mjs";
const search = (corpus, question, extra = {}) =>
  retrieve({ corpus, question, ...extra });
test("exact approved question returns its own answer with citations", async () => {
  const data = await fixture();
  const result = search(data, data.answers[0].canonicalQuestion);
  assert.equal(result.selectedAnswer.id, data.answers[0].id);
  assert.ok(result.selectedAnswer.citations.length);
});
test("draft exact question does not become an approved automatic answer", async () => {
  const data = await fixture();
  data.answers[0].status = "draft";
  assert.equal(
    search(data, data.answers[0].canonicalQuestion).selectedAnswer,
    undefined,
  );
});
test("near-miss enterprise RAG query cannot reuse capability answer", async () => {
  const data = await fixture();
  const result = search(
    data,
    "Did you deploy enterprise production RAG at huge scale?",
  );
  assert.equal(result.selectedAnswer, undefined);
  assert.ok(result.answerCandidates.length);
});
test("lexical fallback returns sources without a model", async () => {
  const result = search(await fixture("lab"), "browser embeddings fail");
  assert.equal(result.method, "lexical");
  assert.ok(result.passages.some((p) => p.documentId === "search-runbook"));
});
test("alternatives collapse to distinct answer candidates", async () => {
  const data = await fixture();
  const result = search(data, "engineering professional background");
  assert.equal(
    new Set(result.answerCandidates.map((a) => a.answerId)).size,
    result.answerCandidates.length,
  );
  assert.ok(result.answerCandidates.length <= 3);
});
test("semantic suggestions do not imply equivalence even at perfect cosine", async () => {
  const data = await fixture();
  const rows = data.answers.reduce((n, a) => n + 1 + a.alternatives.length, 0);
  const vectors = new Float32Array(rows * 384);
  for (let i = 0; i < rows; i++) vectors[i * 384] = 1;
  const chunks = new Float32Array(data.chunks.length * 384);
  for (let i = 0; i < data.chunks.length; i++) chunks[i * 384] = 1;
  const result = search(data, "Invented enterprise certification claim", {
    vector: unitVector(),
    questionVectors: vectors,
    chunkVectors: chunks,
  });
  assert.equal(result.method, "semantic");
  assert.equal(result.selectedAnswer, undefined);
});
test("malformed vector index cannot be scanned", () => {
  assert.throws(
    () => rankVectors(unitVector(), new Float32Array(2), 1),
    /length/,
  );
});
test("retrieval does not leak a different corpus", async () => {
  const data = await fixture("lab");
  const result = search(data, "PolicyStreet insurance");
  assert.ok(result.passages.every((p) => p.corpusId === "lab"));
  assert.equal(result.selectedAnswer, undefined);
});

test("exact enterprise-scale question returns the cached evidence limitation, never a capability claim", async () => {
  const data = await fixture();
  const result = search(data, "Have you deployed RAG at enterprise production scale?");
  assert.equal(result.selectedAnswer.id, "portfolio-answer-rag-scale");
  assert.match(result.selectedAnswer.answerText, /does not establish/);
});

import test from "node:test";
import assert from "node:assert/strict";
import {
  loadContent,
  chunksFor,
  approvalHash,
  hash,
} from "../scripts/indexing/content.mjs";
import {
  validateCorpus,
  validateVector,
  validateGenerate,
  safeUrl,
} from "../packages/knowledge-schema/src/validate.mjs";
import { fixture, unitVector } from "./helpers.mjs";
test("portfolio and Lab content are independently approved for testing only", async () => {
  const p = await loadContent("portfolio"),
    l = await loadContent("lab");
  assert.equal(p.answers.length, 40);
  assert.equal(l.answers.length, 40);
  assert.equal(l.documents.length, 24);
  assert.ok(
    [...p.answers, ...p.documents, ...l.answers, ...l.documents].every(
      (r) => ["approved", "retired"].includes(r.status) && r.approval.scope === "local-test",
    ),
  );
});
test("release blocks every unapproved corpus", async () => {
  await assert.rejects(
    loadContent("portfolio", { release: true }),
    /approval/i,
  );
  await assert.rejects(loadContent("lab", { release: true }), /approval/i);
});
test("foreign citation rejected", async () => {
  const data = await fixture();
  data.answers[0].citations[0].corpusId = "lab";
  assert.throws(() => validateCorpus(data), /citation/);
});
test("stale source hash rejected", async () => {
  const data = await fixture();
  data.answers[0].citations[0].sourceHash = "f".repeat(64);
  assert.throws(() => validateCorpus(data), /Stale/);
});
test("expired approval rejected", async () => {
  const data = await fixture();
  data.answers[0].reviewAfter = "2020-01-01";
  assert.throws(() => validateCorpus(data), /Expired/);
});
test("source text change invalidates approval digest", async () => {
  const data = await fixture();
  const doc = data.documents[0],
    prior = approvalHash(doc);
  doc.text += " Changed";
  assert.notEqual(approvalHash(doc), prior);
});
test("chunks are deterministic, corpus-bound and hashed", async () => {
  const data = await fixture();
  const chunks = chunksFor(data, data.corpusVersion);
  assert.deepEqual(chunks, chunksFor(data, data.corpusVersion));
  assert.ok(
    chunks.every(
      (c) =>
        c.corpusId === "portfolio" &&
        c.textHash === hash(c.text) &&
        c.embeddingInputHash === hash(c.embeddingInput),
    ),
  );
});
test("vectors reject malformed dimensions, NaN and non-unit norms", () => {
  validateVector(unitVector());
  assert.throws(() => validateVector([1]));
  const bad = unitVector();
  bad[4] = NaN;
  assert.throws(() => validateVector(bad));
  assert.throws(() => validateVector(new Float32Array(384)));
});
test("source URL allowlist excludes scripts, credentials and foreign hosts", () => {
  for (const url of [
    "javascript:alert(1)",
    "https://evil.test/",
    "https://x:y@mohd.paramasvara.online/",
    "https://mohd.paramasvara.online:444/",
  ])
    assert.equal(safeUrl(url, "portfolio"), false);
  assert.equal(
    safeUrl("https://mohd.paramasvara.online/#about", "portfolio"),
    true,
  );
});
test("generation input rejects client text, excessive IDs and long question", () => {
  const body = {
    requestId: crypto.randomUUID(),
    corpusVersion: "a".repeat(16),
    question: "What is public?",
    selectedChunkIds: [],
    visitorToken: "",
    turnstileToken: "",
  };
  validateGenerate(body);
  assert.throws(() => validateGenerate({ ...body, text: "forged" }));
  assert.throws(() => validateGenerate({ ...body, question: "x".repeat(601) }));
  assert.throws(() =>
    validateGenerate({ ...body, selectedChunkIds: Array(6).fill("id") }),
  );
});

test("test approvals exercise exact cache answers but cannot authorize publication", async () => {
  const data = await loadContent("portfolio");
  const { retrieve } = await import("../packages/semantic-core/src/retrieval.mjs");
  const { selectedAnswer } = retrieve({ corpus: { ...data, chunks: [] }, question: data.answers[0].canonicalQuestion });
  assert.equal(selectedAnswer.approval.scope, "local-test");
  assert.throws(() => validateCorpus(data, { release: true }), /local-test/);
});

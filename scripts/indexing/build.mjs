import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { loadContent, chunksFor, hash, approvalHash } from "./content.mjs";
import { EMBEDDING } from "../../packages/knowledge-schema/src/validate.mjs";
import {verifyModelLock} from './model-lock.mjs';
import {writeImmutable} from './immutable.mjs';
const release = process.argv.includes("--release");
const embedding = process.argv.includes("--embed");
const validateOnly = process.argv.includes("--validate");
const root = resolve("apps/rag-lab/public/knowledge");
const serverCorpora = {};
if(embedding) await verifyModelLock();
for (const corpusId of ["portfolio", "lab"]) {
  const input = await loadContent(corpusId, { release });
  // Runtime artifacts contain only authorized current records. Drafts/retired answers
  // remain in the editorial registry, never an alternate public cache endpoint.
  const documents = input.documents.filter(doc => doc.status === 'approved');
  const data = {...input, documents, answers: input.answers.filter(answer => answer.status === 'approved' && answer.citations.every(c => documents.some(doc => doc.id === c.sourceId)))};
  const sourceFingerprint=hash(JSON.stringify({data,embedding:EMBEDDING,chunker:'sections-650-v1',indexerVersion:'efrd-v3'}));
  let priorManifest;
  try{const pointer=JSON.parse(await readFile(resolve(root,corpusId,'current.json'),'utf8'));priorManifest=JSON.parse(await readFile(resolve(root,corpusId,pointer.manifest),'utf8'));}catch{}
  const wantsSemantic=embedding||(priorManifest?.sourceFingerprint===sourceFingerprint&&priorManifest.semanticReady);
  const corpusVersion=hash(JSON.stringify({sourceFingerprint,indexKind:wantsSemantic?'semantic':'lexical',preview:!release})).slice(0,16);
  const chunks = chunksFor(data, corpusVersion);
  const rows = data.answers
    .flatMap((a) => [
      { answerId: a.id, questionId: a.id, text: a.canonicalQuestion },
      ...a.alternatives.map((q) => ({
        answerId: a.id,
        questionId: q.id,
        text: q.text,
      })),
    ])
    .map((r, row) => ({ ...r, row }));
  if (validateOnly) {
    console.log(
      `${corpusId}: ${data.documents.length} documents, ${data.answers.length} answers, ${chunks.length} chunks; ${release ? "release approved" : "draft validation passed"}`,
    );
    continue;
  }
  const directory = resolve(root, corpusId, corpusVersion);
  await mkdir(directory, { recursive: true });
  const assets = {};
  for (const [name, value] of Object.entries({
    answers: data.answers,
    documents: data.documents,
    chunks,
    technology: data.technologyEvidence || null,
    retirements: data.retirements || null,
  })) {
    const bytes = Buffer.from(JSON.stringify(value));
    const filename = `${name}.json`;
    await writeImmutable(resolve(directory, filename), bytes);
    assets[name] = {
      path: filename,
      sha256: hash(bytes),
      bytes: bytes.length,
      mediaType: "application/json",
    };
  }
  let semanticReady = false;
  if (embedding) {
    const { embedBatch } = await import("./embed.mjs");
    for (const [name, texts] of [
      ["questionVectors", rows.map((r) => r.text)],
      ["chunkVectors", chunks.map((c) => c.embeddingInput)],
    ]) {
      const bytes = await embedBatch(texts);
      const filename = `${name}.f32`;
      await writeImmutable(resolve(directory, filename), bytes);
      assets[name] = {
        path: filename,
        sha256: hash(bytes),
        bytes: bytes.length,
        mediaType: "application/octet-stream",
      };
    }
    semanticReady = true;
  } else {
    // Preserve only fully verified embeddings from exactly this immutable content version.
    try {
      const old = JSON.parse(
        await readFile(resolve(directory, "manifest.json"), "utf8"),
      );
      for (const name of ["questionVectors", "chunkVectors"]) {
        const asset = old.assets[name];
        const bytes = await readFile(resolve(directory, asset.path));
        if (hash(bytes) !== asset.sha256) throw new Error("Hash mismatch");
        assets[name] = asset;
      }
      semanticReady =
        old.embedding.id === EMBEDDING.id &&
        old.corpusVersion === corpusVersion;
    } catch {}
  }
  const manifest = {
    schemaVersion: 1,
    sourceFingerprint,
    corpusId,
    corpusVersion,
    preview: !release,
    embedding: EMBEDDING,
    assets,
    questionRows: rows.map(({ row, answerId, questionId }) => ({
      row,
      answerId,
      questionId,
    })),
    vectorEncoding: "float32-le",
    sourceHashes: Object.fromEntries(
      data.documents.map((d) => [d.id, d.contentHash]),
    ),
    matchPolicyVersion: "suggest-only-v1",
    builtAt: priorManifest?.corpusVersion===corpusVersion?priorManifest.builtAt:new Date().toISOString(),
    semanticReady,
  };
  await writeImmutable(
    resolve(directory, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );
  await writeFile(
    resolve(root, corpusId, "current.json"),
    JSON.stringify({
      corpusVersion,
      manifest: `${corpusVersion}/manifest.json`,
    }),
  );
  serverCorpora[corpusId] = {
    corpusId,
    corpusVersion,
    documents: data.documents.filter((d) => d.status === "approved" && d.approval?.scope !== "local-test"),
    chunks: chunks.filter(
      (c) =>
        data.documents.some((d) => d.id === c.documentId && d.status === "approved" && d.approval?.scope !== "local-test"),
    ),
  };
  console.log(
    `${corpusId}: ${corpusVersion}, ${rows.length} questions, ${chunks.length} chunks, ${semanticReady ? "semantic + lexical" : "lexical (run index:build for semantic vectors)"}, ${release ? "approved release" : "DRAFT PREVIEW"}`,
  );
  await mkdir("output", { recursive: true });
  await writeFile(
    `output/${corpusId}-approval-candidates.json`,
    JSON.stringify(
      Object.fromEntries(
        [...data.documents, ...data.answers].map((record) => [
          record.id,
          {
            contentHash: approvalHash(record),
            reviewer: "OWNER_REVIEW_REQUIRED",
            approvedAt: null,
          },
        ]),
      ),
      null,
      2,
    ),
  );
}
if (!validateOnly) {
  await mkdir("apps/rag-api/generated", { recursive: true });
  await writeFile(
    "apps/rag-api/generated/corpora.json",
    JSON.stringify(serverCorpora),
  );
}

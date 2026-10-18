import {
  EMBEDDING,
  validateVector,
  validateCorpus,
} from "../../knowledge-schema/src/validate.mjs";
import type {
  EmbeddingManifest,
  ApprovedAnswer,
  DocumentChunk,
  PublicDocument,
  CorpusId,
} from "../../knowledge-schema/src/contracts";
import { scopeCorpus } from "./scope.mjs";
import type { KnowledgeScope } from "../../knowledge-schema/src/contracts";
import { validateTechnology } from "../../knowledge-schema/src/technology.mjs";
export interface LoadedCorpus {
  scopeId?: KnowledgeScope;
  scopeRows?: {questionPositions:number[];chunkPositions:number[]};
  technologyEvidence?: any;
  retirements?: { answerIds: string[]; retrievalExcludedDocuments: string[]; reason: string; supersededBy: string };
  corpusId: CorpusId;
  corpusVersion: string;
  manifest: EmbeddingManifest;
  answers: ApprovedAnswer[];
  documents: PublicDocument[];
  chunks: DocumentChunk[];
  workerPath?: string;
  questionVectors?: Float32Array;
  chunkVectors?: Float32Array;
  vectorError?: string;
}
async function json(url: URL, signal: AbortSignal) {
  const response = await fetch(url, { signal, cache: "no-cache" });
  if (!response.ok)
    throw new Error(`Knowledge asset unavailable (${response.status})`);
  return response.json();
}
export async function loadCorpus(
  base: string,
  corpusId: CorpusId,
  signal: AbortSignal,
  onStatic?: (data: LoadedCorpus) => void,
  scopeId?: KnowledgeScope,
): Promise<LoadedCorpus> {
  const root = new URL(
    `knowledge/${corpusId}/`,
    new URL(base, location.origin),
  );
  const pointer = await json(new URL("current.json", root), signal);
  if (
    !/^[a-f0-9]{16}$/.test(pointer.corpusVersion) ||
    pointer.manifest !== `${pointer.corpusVersion}/manifest.json`
  )
    throw new Error("Invalid knowledge pointer");
  const manifest: EmbeddingManifest = await json(
    new URL(pointer.manifest, root),
    signal,
  );
  if (
    manifest.schemaVersion !== 1 ||
    manifest.corpusId !== corpusId ||
    manifest.corpusVersion !== pointer.corpusVersion ||
    JSON.stringify(manifest.embedding) !== JSON.stringify(EMBEDDING)
  )
    throw new Error("Incompatible knowledge release");
  const folder = new URL(`${manifest.corpusVersion}/`, root);
  async function asset(name: string) {
    const record = manifest.assets[name];
    if (!record || !/^[a-zA-Z]+\.(json|f32)$/.test(record.path))
      throw new Error("Invalid asset path");
    const response = await fetch(new URL(record.path, folder), { signal });
    if (!response.ok) throw new Error("Missing knowledge asset");
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength !== record.bytes)
      throw new Error("Asset size mismatch");
    const digest = Array.from(
      new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
      (v) => v.toString(16).padStart(2, "0"),
    ).join("");
    if (digest !== record.sha256) throw new Error("Asset integrity mismatch");
    return bytes;
  }
  const [answers, documents, chunks] = await Promise.all(
    ["answers", "documents", "chunks"].map(async (name) =>
      JSON.parse(new TextDecoder().decode(await asset(name))),
    ),
  );
  validateCorpus({ corpusId, answers, documents }, { release: !manifest.preview });
  const technologyEvidence = manifest.assets.technology ? JSON.parse(new TextDecoder().decode(await asset("technology"))) : undefined;
  const retirements = manifest.assets.retirements ? JSON.parse(new TextDecoder().decode(await asset("retirements"))) : undefined;
  if (technologyEvidence) validateTechnology(technologyEvidence);
  const expectedRows = answers
    .flatMap((answer: ApprovedAnswer) => [
      { answerId: answer.id, questionId: answer.id },
      ...answer.alternatives.map((question) => ({
        answerId: answer.id,
        questionId: question.id,
      })),
    ])
    .map((row: any, index: number) => ({ row: index, ...row }));
  if (JSON.stringify(expectedRows) !== JSON.stringify(manifest.questionRows))
    throw new Error("Question row mapping mismatch");
  if (
    chunks.some(
      (c: DocumentChunk) =>
        c.corpusId !== corpusId ||
        c.corpusVersion !== manifest.corpusVersion ||
        !documents.some(
          (d: PublicDocument) =>
            d.id === c.documentId && d.contentHash === c.citation.sourceHash,
        ),
    )
  )
    throw new Error("Chunk boundary/integrity violation");
  const data: LoadedCorpus = {
    corpusId,
    corpusVersion: manifest.corpusVersion,
    manifest,
    answers,
    documents,
    chunks,
    technologyEvidence,
    retirements,
  };
  onStatic?.(scopeId ? scopeCorpus(data, scopeId) : data);
  if (manifest.semanticReady)
    try {
      const worker = await json(
        new URL("worker.json", new URL(base, location.origin)),
        signal,
      );
      if (!/^assets\/embedding-worker-[a-zA-Z0-9_-]+\.js$/.test(worker.path))
        throw new Error("Invalid worker asset");
      data.workerPath = worker.path;
      const vectors = await Promise.all(
        ["questionVectors", "chunkVectors"].map(async (name) => {
          const bytes = await asset(name);
          if (bytes.byteLength % 1536) throw new Error("Invalid vector length");
          const values = new Float32Array(bytes.byteLength / 4),
            view = new DataView(bytes);
          for (let i = 0; i < values.length; i++)
            values[i] = view.getFloat32(i * 4, true);
          for (let i = 0; i < values.length; i += 384)
            validateVector(values.subarray(i, i + 384));
          return values;
        }),
      );
      if (
        vectors[0].length !== manifest.questionRows.length * 384 ||
        vectors[1].length !== chunks.length * 384
      )
        throw new Error("Vector row mismatch");
      data.questionVectors = vectors[0];
      data.chunkVectors = vectors[1];
    } catch {
      data.vectorError =
        "Semantic index unavailable; lexical search remains available.";
    }
  return scopeId ? scopeCorpus(data, scopeId) : data;
}

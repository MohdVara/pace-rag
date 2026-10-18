import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { dataset } from "./dataset.mjs";
import { retrieve } from "../packages/semantic-core/src/retrieval.mjs";
import { loadContent, chunksFor } from "./indexing/content.mjs";
const data = await dataset();
await mkdir("evaluation/datasets", { recursive: true });
for (const [name, records] of Object.entries(data))
  await writeFile(
    `evaluation/datasets/${name}.jsonl`,
    records.map((record) => JSON.stringify(record)).join("\n") + "\n",
  );
const content = await loadContent("portfolio"),
  root = resolve("apps/rag-lab/public/knowledge/portfolio"),
  pointer = JSON.parse(await readFile(resolve(root, "current.json"), "utf8")),
  folder = resolve(root, pointer.corpusVersion),
  manifest = JSON.parse(
    await readFile(resolve(folder, "manifest.json"), "utf8"),
  );
const corpus = {
  ...content,
  corpusVersion: pointer.corpusVersion,
  chunks: chunksFor(content, pointer.corpusVersion),
};
const semantic = process.argv.includes("--semantic");
const readVectors = async (name) => {
  const bytes = await readFile(resolve(folder, manifest.assets[name].path));
  return Float32Array.from({ length: bytes.length / 4 }, (_, i) =>
    bytes.readFloatLE(i * 4),
  );
};
let questionVectors, chunkVectors, queryVectors;
if (semantic) {
  if (!manifest.semanticReady)
    throw new Error("Build semantic indexes before evaluation");
  questionVectors = await readVectors("questionVectors");
  chunkVectors = await readVectors("chunkVectors");
  const { embedBatch } = await import("./indexing/embed.mjs");
  const bytes = await embedBatch(
    [...data.positives, ...data.negatives].map((row) => row.question),
  );
  queryVectors = Float32Array.from({ length: bytes.length / 4 }, (_, i) =>
    bytes.readFloatLE(i * 4),
  );
}
let successes = 0,
  incorrectAutomatic = 0;
const latencies = [];
const incorrectAutomaticDetails = [];
let boundaryClarifications = 0;
for (const [i, row] of [...data.positives, ...data.negatives].entries()) {
  const start = performance.now();
  const result = retrieve({
    corpus,
    question: row.question,
    vector: queryVectors?.subarray(i * 384, (i + 1) * 384),
    questionVectors,
    chunkVectors,
  });
  latencies.push(performance.now() - start);
  if (
    row.relevantAnswerIds &&
    result.answerCandidates.some((candidate) =>
      row.relevantAnswerIds.includes(candidate.answerId),
    )
  )
    successes++;
  if (result.selectedAnswer) {
    const permitted = row.relevantAnswerIds || row.allowedAutomaticAnswerIds || [];
    if (!permitted.includes(result.selectedAnswer.id)) {
      incorrectAutomatic++;
      incorrectAutomaticDetails.push({ questionId: row.id, selectedAnswerId: result.selectedAnswer.id });
    } else if (!row.relevantAnswerIds) boundaryClarifications++;
  }
}
latencies.sort((a, b) => a - b);
const report = {
  measuredAt: new Date().toISOString(),
  mode: semantic ? "semantic" : "lexical",
  corpusVersion: corpus.corpusVersion,
  dataset: {
    positives: data.positives.length,
    negatives: data.negatives.length,
    groundingQuestions: data.grounding.length,
    ownerReviewed: false,
  },
  top3Success: successes / data.positives.length,
  incorrectAutomaticMatches: incorrectAutomatic,
  incorrectAutomaticDetails,
  exactBoundaryClarifications: boundaryClarifications,
  automaticSemanticMatchingEnabled: false,
  rankingP95Ms: latencies[Math.floor(latencies.length * 0.95)],
  liveProviderCalls: 0,
  groundingEvaluation:
    "not executed against live provider; deterministic validation tests are separate",
  releaseAccepted: false,
  limitations: [
    "Proposed labels and templated paraphrases await owner review.",
    "These measurements do not establish independent semantic reliability.",
    "Current approvals permit local testing only. Exact cached answers can return automatically; arbitrary semantic reuse stays disabled.",
    "Human claim-support review, mobile performance and live-provider behavior remain release gates.",
  ],
};
await mkdir("evaluation/reports", { recursive: true });
await writeFile(
  "evaluation/reports/current.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));

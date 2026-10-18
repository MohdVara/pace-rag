export const CORPORA = ["portfolio", "lab"];
export const LIMITS = Object.freeze({
  daily: { portfolio: 30, lab: 20 },
  visitor: 3,
  neurons: 2000,
  concurrency: 2,
  leaseMs: 120000,
  questionChars: 600,
  bodyBytes: 8192,
  promptBytes: 4096,
  completionTokens: 300,
});
export const EMBEDDING = Object.freeze({
  id: "minilm-q8-wasm-v1",
  modelId: "Xenova/all-MiniLM-L6-v2",
  revision: "751bff37182d3f1213fa05d7196b954e230abad9",
  artifactSha256:
    "afdb6f1a0e45b715d0bb9b11772f032c399babd23bfc31fed1c170afc848bdb1",
  transformersVersion: "3.8.1",
  onnxRuntimeVersion: "1.22.0-dev.20250409-89f8206ba4",
  dtype: "q8",
  backend: "wasm",
  dimensions: 384,
  pooling: "mean",
  normalize: true,
  maxSequenceTokens: 256,
  preprocessingVersion: "nfc-lf-trim-v1",
});
export const normalizeText = (text) =>
  text.normalize("NFC").replace(/\r\n?/g, "\n").trim();
export function ensure(condition, message) {
  if (!condition) throw new Error(message);
}
export function safeUrl(value, corpus, local = false) {
  if (corpus === "lab")
    return (
      local &&
      /^\/pace-rag\/knowledge\/lab\/sources\/[a-z0-9-]+\.html$/.test(value)
    );
  const url = new URL(value, "https://lab.example.invalid");
  const allowed =
    corpus === "portfolio"
      ? [
          "mohd.paramasvara.online",
          "rxresu.me",
          "github.com",
          "www.linkedin.com",
          "cal.com",
        ]
      : ["lab.example.invalid"];
  return (
    (url.protocol === "https:" &&
      allowed.includes(url.hostname) &&
      !url.username &&
      !url.password &&
      !url.port) ||
    (local &&
      value.startsWith("/pace-rag/knowledge/") &&
      !value.startsWith("//") &&
      !value.includes("\\"))
  );
}
export function validateCorpus(
  data,
  { release = false, now = Date.now() } = {},
) {
  ensure(CORPORA.includes(data.corpusId), "Invalid corpus");
  ensure(
    Array.isArray(data.documents) && Array.isArray(data.answers),
    "Missing content",
  );
  const ids = new Set();
  for (const record of [...data.documents, ...data.answers]) {
    ensure(
      typeof record.id === "string" &&
        /^[a-z0-9-]+$/.test(record.id) &&
        !ids.has(record.id),
      "Invalid/duplicate record ID",
    );
    ids.add(record.id);
    ensure(record.corpusId === data.corpusId, "Corpus boundary violation");
    ensure(
      ["draft", "approved", "retired"].includes(record.status),
      "Invalid status",
    );
    ensure(
      Number.isFinite(Date.parse(record.reviewAfter)),
      "Missing review deadline",
    );
    if (record.status === "approved" || (release && record.status !== "retired")) {
      ensure(
        record.status === "approved",
        "Publication requires owner approval",
      );
      ensure(
        record.approval?.reviewer &&
          record.approval.reviewer !== "OWNER_REVIEW_REQUIRED" &&
          Number.isFinite(Date.parse(record.approval.approvedAt)) &&
          Date.parse(record.approval.approvedAt) <= now &&
          /^[a-f0-9]{64}$/.test(record.approval.contentHash),
        "Missing approval",
      );
      ensure(!record.approval.scope || ["publication", "local-test"].includes(record.approval.scope), "Invalid approval scope");
      if (release) ensure(record.approval.scope !== "local-test", "Publication requires owner approval; local-test approval is insufficient");
      ensure(Date.parse(record.reviewAfter) > now, "Expired content");
    }
  }
  const sources = new Map(data.documents.map((doc) => [doc.id, doc]));
  for (const doc of data.documents) {
    ensure(
      typeof doc.text === "string" && doc.text.length > 20,
      "Empty document",
    );
    ensure(safeUrl(doc.canonicalUrl, data.corpusId, true), "Unsafe source URL");
    ensure(doc.license, "Missing license");
  }
  for (const answer of data.answers) {
    ensure(
      typeof answer.answerText === "string" &&
        answer.answerText.length > 10 &&
        typeof answer.canonicalQuestion === "string",
      "Invalid answer",
    );
    ensure(answer.answerText.trim().split(/\s+/).length <= 120 && !/\n\s*\n/.test(answer.answerText), "Answer must be one paragraph of at most 120 words");
    ensure(
      Array.isArray(answer.citations) && answer.citations.length > 0,
      "Uncited answer",
    );
    ensure(
      answer.embeddingSpecId === EMBEDDING.id,
      "Embedding specification mismatch",
    );
    ensure(
      answer.matchPolicy?.mode === "suggest-only" ||
        answer.matchPolicy?.mode === "calibrated-auto",
      "Missing match policy",
    );
    const questionIds = new Set([answer.id]);
    for (const question of answer.alternatives) {
      ensure(
        question.id &&
          !questionIds.has(question.id) &&
          typeof question.text === "string",
        "Invalid alternative",
      );
      questionIds.add(question.id);
    }
    for (const citation of answer.citations) {
      const source = sources.get(citation.sourceId);
      ensure(
        source && citation.corpusId === data.corpusId,
        "Foreign or missing citation",
      );
      ensure(
        citation.url === source.canonicalUrl &&
          citation.sourceHash === source.contentHash &&
          citation.documentVersion === source.version,
        "Stale citation",
      );
      if (answer.status === "approved")
        ensure(source.status === "approved", "Unapproved evidence");
    }
  }
  return data;
}
export function validateVector(vector) {
  ensure(
    vector.length === 384 && Array.from(vector).every(Number.isFinite),
    "Invalid embedding",
  );
  const norm = Math.sqrt(Array.from(vector).reduce((sum, v) => sum + v * v, 0));
  ensure(Math.abs(norm - 1) < 0.002, "Vector not normalized");
}
export function validateGenerate(value) {
  ensure(
    value && typeof value === "object" && !Array.isArray(value),
    "Invalid request",
  );
  const allowed = [
    "requestId",
    "corpusVersion",
    "question",
    "selectedChunkIds",
    "visitorToken",
    "turnstileToken",
  ];
  ensure(
    Object.keys(value).every((key) => allowed.includes(key)),
    "Unexpected client field",
  );
  ensure(
    typeof value.requestId === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value.requestId,
      ),
    "Invalid request ID",
  );
  ensure(
    typeof value.question === "string" &&
      value.question.trim().length > 0 &&
      value.question.length <= LIMITS.questionChars &&
      new TextEncoder().encode(value.question).length <= 1800,
    "Question too long",
  );
  ensure(
    typeof value.corpusVersion === "string" &&
      /^[a-f0-9]{16}$/.test(value.corpusVersion),
    "Invalid version",
  );
  ensure(
    Array.isArray(value.selectedChunkIds) &&
      value.selectedChunkIds.length <= 5 &&
      value.selectedChunkIds.every(
        (id) => typeof id === "string" && /^[a-z0-9-]{1,160}$/.test(id),
      ),
    "Invalid chunks",
  );
  ensure(
    new Set(value.selectedChunkIds).size === value.selectedChunkIds.length,
    "Duplicate chunks",
  );
  ensure(
    typeof value.visitorToken === "string" &&
      value.visitorToken.length <= 2048 &&
      typeof value.turnstileToken === "string" &&
      value.turnstileToken.length <= 2048,
    "Invalid verification",
  );
  return value;
}

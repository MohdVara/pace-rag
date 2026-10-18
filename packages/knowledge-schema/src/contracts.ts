export type CorpusId = "portfolio" | "lab";
export type AppId = "portfolio-assistant" | "rag-lab";
export interface AlternativeQuestion {
  id: string;
  text: string;
  approvedAt: string | null;
}
export interface SourceCitation {
  sourceId: string;
  corpusId: CorpusId;
  documentVersion: string;
  sourceHash: string;
  title: string;
  url: string;
  sectionId?: string;
  chunkId?: string;
}
export interface ApprovedAnswer {
  id: string;
  corpusId: CorpusId;
  version: string;
  canonicalQuestion: string;
  alternatives: AlternativeQuestion[];
  answerText: string;
  citations: SourceCitation[];
  embeddingSpecId: string;
  reviewedAt: string | null;
  reviewAfter: string;
  status: "draft" | "approved" | "retired";
  approval: {
    scope?: "publication" | "local-test";
    reviewer: string;
    approvedAt: string;
    contentHash: string;
  } | null;
  matchPolicy: {
    mode: "suggest-only" | "calibrated-auto";
    intent: string;
    protectedFacets: string[];
    policyVersion: string;
  };
}
export interface PublicDocument {
  id: string;
  corpusId: CorpusId;
  version: string;
  title: string;
  canonicalUrl: string;
  contentHash: string;
  reviewedAt: string | null;
  reviewAfter: string;
  provenance:
    | "approved-portfolio"
    | "owner-reported-capability"
    | "synthetic"
    | "licensed-public"
    | "implementation-documentation"
    | "owner-confirmed-technology";
  license: string;
  status: "draft" | "approved" | "retired";
  text: string;
  approval: {
    scope?: "publication" | "local-test";
    reviewer: string;
    approvedAt: string;
    contentHash: string;
  } | null;
}
export interface DocumentChunk {
  id: string;
  corpusId: CorpusId;
  corpusVersion: string;
  documentId: string;
  documentVersion: string;
  sectionId: string;
  ordinal: number;
  text: string;
  textHash: string;
  embeddingInput: string;
  embeddingInputHash: string;
  embeddingRow: number;
  citation: SourceCitation;
}
export interface EmbeddingSpec {
  id: string;
  modelId: string;
  revision: string;
  artifactSha256: string;
  transformersVersion: string;
  onnxRuntimeVersion: string;
  dtype: "q8";
  backend: "wasm";
  dimensions: 384;
  pooling: "mean";
  normalize: true;
  maxSequenceTokens: 256;
  preprocessingVersion: string;
}
export interface IndexAsset {
  path: string;
  sha256: string;
  bytes: number;
  mediaType: string;
}
export interface EmbeddingManifest {
  sourceFingerprint: string;
  schemaVersion: 1;
  corpusId: CorpusId;
  corpusVersion: string;
  preview: boolean;
  embedding: EmbeddingSpec;
  assets: Record<string, IndexAsset>;
  questionRows: { row: number; answerId: string; questionId: string }[];
  vectorEncoding: "float32-le";
  sourceHashes: Record<string, string>;
  matchPolicyVersion: string;
  builtAt: string;
  semanticReady: boolean;
}
export interface RetrievalResult {
  corpusId: CorpusId;
  corpusVersion: string;
  method: "semantic" | "lexical";
  selectedAnswer?: ApprovedAnswer;
  trace: RetrievalTrace;
  answerCandidates: {
    answerId: string;
    matchedQuestionId: string;
    score: number;
  }[];
  passages: { chunkId: string; score: number; citation: SourceCitation }[];
  decision:
    | "approved-answer"
    | "related-questions"
    | "passages"
    | "insufficient-evidence";
  reasons: string[];
}
export interface GenerateRequest {
  requestId: string;
  corpusVersion: string;
  question: string;
  selectedChunkIds: string[];
  visitorToken: string;
  turnstileToken: string;
}
export interface GeneratedClaim {
  text: string;
  sourceIds: string[];
}
export interface UsageEstimate {
  reservedNeurons: number;
  accountedNeurons: number;
  basis: "conservative-estimate" | "provider-token-usage";
}
export type ServiceErrorCode =
  | "INVALID_REQUEST"
  | "ORIGIN_REJECTED"
  | "VERIFICATION_REQUIRED"
  | "VERSION_STALE"
  | "RATE_LIMITED"
  | "BUDGET_EXHAUSTED"
  | "COORDINATOR_UNAVAILABLE"
  | "PROVIDER_QUOTA"
  | "PROVIDER_CAPACITY"
  | "MODEL_UNAVAILABLE"
  | "TIMEOUT"
  | "INVALID_GENERATION"
  | "ALREADY_PROCESSED";
export interface ServiceError {
  code: ServiceErrorCode;
  message: string;
  retryAfterSeconds?: number;
  fallback: "cached-search";
}
export type GenerateResponse =
  | {
      kind: "generated";
      requestId: string;
      corpusId: CorpusId;
      corpusVersion: string;
      claims: GeneratedClaim[];
      citations: SourceCitation[];
      modelId: string;
      usage: UsageEstimate;
    }
  | {
      kind: "insufficient-evidence";
      requestId: string;
      message: string;
      citations: SourceCitation[];
    }
  | { kind: "unavailable"; requestId: string; error: ServiceError };
export interface BudgetReservation {
  id: string;
  requestId: string;
  requestDigest: string;
  appId: AppId;
  corpusId: CorpusId;
  utcDay: string;
  visitorKey: string;
  networkKey: string;
  reservedNeuronMicrounits: number;
  accountedNeuronMicrounits?: number;
  state: "reserved" | "started" | "settled" | "released" | "uncertain";
  createdAt: string;
  expiresAt: string;
}
export interface AssistantState {
  retrieval:
    | "static-ready"
    | "semantic-loading"
    | "semantic-ready"
    | "lexical-only";
  generation: "disabled" | "ready" | "verifying" | "pending" | "unavailable";
  error?: ServiceError;
}

export type AnswerOrigin = "approved-cache" | "approved-composite" | "live-generation" | "insufficient-evidence";
export type RetrievalMethod = "exact-match" | "semantic-cache" | "lexical-cache" | "document-retrieval" | "hybrid-retrieval" | "structured-facts" | "live-rag";
export type EvidenceStatus = "public-demonstrated" | "owner-confirmed" | "synthetic-lab" | "planned" | "insufficient";
export interface AnswerSource extends SourceCitation {
  evidenceStatus: EvidenceStatus;
  sourceType: string;
  approvalScope: "publication" | "local-test";
  excerpt?: string;
}
export interface AnswerResult {
  answer: string | null;
  origin: AnswerOrigin;
  retrievalMethod: RetrievalMethod;
  sources: AnswerSource[];
  relatedQuestions: string[];
  evidenceStatus: EvidenceStatus[];
  explanation: string;
  corpusVersion: string;
  answerVersion?: string;
  answerId?: string;
  usedFactIds?: string[];
  approvalScope?: "publication" | "local-test";
  nextAction?: { label: string; href: string };
}
export interface RankedCandidate {
  sourceTitles: string[];
  rank: number;
  answerId: string;
  title: string;
  matchedQuestionId: string;
  score: number;
  semanticScore: number | null;
  lexicalScore: number;
  selected: boolean;
  reason: string;
}
export interface RetrievalTrace {
  query: string;
  corpusId: CorpusId;
  corpusVersion: string;
  method: "semantic" | "lexical";
  candidateRecordsSearched: number;
  questionRowsSearched: number;
  retrievedChunks: number;
  rankingLatencyMs: number;
  candidates: RankedCandidate[];
}

export type LocalRetrieval = Omit<RetrievalResult, "passages"> & { passages: (DocumentChunk & { chunkId: string; score: number; lexicalScore: number; semanticScore: number | null })[] };

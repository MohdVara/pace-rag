# Implementation and architecture

Historical baseline. Current EFRD implementation, measurements and remaining gates are recorded in [EFRD architecture](PACE-RAG-EFRD-ARCHITECTURE.md), [results](PACE-RAG-EFRD-RESULTS.md) and [QA](PACE-RAG-EFRD-QA.md).

Implemented against the 18 October 2026 PACE-RAG architecture review. The existing portfolio source, PACE v1.1 evidence/confidentiality records and BAA reports were inspected before integration. Existing BAA documentation edits are preserved.

## Decisions

1. One npm workspace, one lockfile, no orchestration framework.
2. Browser q8 MiniLM embeddings; immutable model revision, 384 dimensions, mean pooling, L2 normalization, single-thread WASM. Same browser worker generates build-time vectors.
3. Separate public question/chunk indexes and isolated corpora. Float32 little-endian vectors; SHA-256 asset verification before activation.
4. Exact approved question/alternative reuse. Semantic recommendations remain suggest-only. A future calibration policy must be versioned and explicitly allow an answer/query; no arbitrary cosine threshold establishes equivalence.
5. Sentence/paragraph-aware bounded chunks, preserving document ownership. The initial short corpus does not need cross-section overlap. Token lengths are checked with the pinned tokenizer; overlong inputs fail indexing instead of silently truncating.
6. Dedicated API resolves IDs from its own approved bundled evidence. No visitor text/metadata/scores become trusted context.
7. One SQLite Durable Object coordinates both apps, atomic reservations and UTC counters. No database or vector service is needed for static retrieval.
8. Git-reviewed, content-hash approval; generated answers are never automatically promoted.
9. All generation requires explicit action. No automatic retries, repair calls, model changes or inference on cache miss.

## Flow

Open → static starters and keyword search → first submitted custom semantic query → lazy model worker → question search → reviewed exact answer or related questions → source passages → optional explicit guarded generation. Model failure selects lexical search. API failure leaves retrieval state intact. Static source pages need no runtime inference or JavaScript.

The assistant library intentionally does not bundle the model worker as a library asset: Vite library mode can inline WASM and exceed Pages' 25 MiB limit. A separate app-mode build emits a hashed worker plus static WASM assets. The frontend discovers its hash through a local pointer. The runtime remains absent from the portfolio startup dependency graph.

Model asset URLs include the pinned revision; runtime URLs include the ONNX Runtime version. Worker requests/results exchange the entire embedding specification and reject mismatches. This protects older pages during rolling updates. Existing immutable index bytes cannot be overwritten: a different index mode or declared indexer version creates a separate release, and identical rebuilds retain the original manifest timestamp.

## Milestone status

- M0: repository audit complete; active hosting/account capability verification remains external.
- M1–M3: contracts, draft content, deterministic indexing, local semantic/lexical retrieval, citations and static browser implemented. Owner content approval remains pending.
- M4–M5: guarded API, source validation, output validation, SQLite budget coordinator, verification and fallback implemented with deterministic mocks. Provider/account validation remains pending; both live switches stay false.
- M6: adapter preserved under `integration/portfolio/`, detached from the portfolio source and dependencies. A fresh package is prepared locally; applying the adapter and publishing remain gated.
- M7: Lab frontend, separate corpus, diagnostics, architecture/privacy/evaluation pages.
- M8: automated correctness/security/failure checks and bounded browser review; see [QA](QA.md) and [milestones](MILESTONES.md) for exact measured scope.
- M9: configuration, review, privacy and rollback procedures documented. No release approved or performed.

## Known limits

Similarity is not equivalence. Citation membership is not entailment. Anonymous visitor limits can be evaded, so the global atomic cap remains authoritative. Internal budgets cannot see unrelated account consumption. A 300-token completion cap requires validation of all billable reasoning tokens before enabling the provider. Browser caches and first-visit offline availability are not guaranteed. Physical-device and screen-reader validation must be recorded separately.

Model initialization renders keyword results immediately. The optional semantic checkbox selects the next custom query mode and never downloads by itself. Data saver/low-memory devices default to keyword mode. Model failure disables semantic retries until explicit opt-in. Corpus changes/unmount terminate the worker and reject pending queries.

The owner subsequently requested populated testing content. All 91 current records now carry hash-bound `local-test` approvals; exact cache behavior is enabled for testing. Release validation and server evidence reject that scope. Current counts, paths and gates are recorded in the latest milestone and deployment guide.

# PACE-RAG EFRD architecture and baseline

Baseline inspected 19 October 2026, before EFRD changes. Existing work is retained. No deployment or provisioning is authorized by local acceptance.

| Feature | Baseline classification | Evidence / gap |
| --- | --- | --- |
| Independent assistant / Lab | Implemented and locally verified | Real q8 model and 10 browser journeys; portfolio adapter staged, not installed. |
| Exact cache / lexical fallback / static sources | Implemented and locally verified | 52 Node tests; exact local-test approvals, no arbitrary semantic automatic reuse. |
| Embedding worker and index parity | Implemented and locally verified | Same pinned MiniLM q8 single-thread WASM worker, 384 dimensions, checksum/spec validation. Model loads only on custom semantic submission. |
| Question/chunk ranking | Implemented and locally verified | Cosine and lexical ranking; top-three suggestions and four passages. Baseline row filtering can misalign vectors after retirement/expiry; to be corrected. |
| Content approvals | Implemented and locally verified | 91 hash-bound local-test records; publication rejects that scope. New source material must not be auto-approved. |
| Answer-first result contract / composites | Partially implemented / planned | Cached selected-answer shape exists, no unified result, no technology facts or deterministic composition. |
| Technology dependency | Available, not yet consumed | Portfolio PACE v1.2 public versioned export, six owner-confirmed mappings and per-record/outer hashes. |
| Retrieval inspection | Partially implemented | Candidate cosine and corpus metadata, no full trace or per-interaction resource ledger. |
| Evaluation | Implemented, insufficient independence | Baseline 160 templated positives / 50 negatives / 20 unexecuted generation scenarios. Report says unreviewed and not release accepted. |
| Live-generation gateway | Implemented but remote runtime unverified | Turnstile, source validation, signed visitors, bounded prompts/timeouts and one-call dispatch covered by deterministic mocks only. Switches false; no production provider/accounting validation. |
| Budget coordinator | Implemented, local SQLite verified / Cloudflare unverified | Real local SQLite tests plus mocked provider responses. No deployed DO or account quota verification. |
| Fault demonstrations | Planned UI / mocked tests | Failure interception exists in browser tests; no isolated educational simulator. |
| Static packaging / deployment | Local build verified, deployment not applicable | Correct /pace-rag/ nesting, static package available. No hosted EFRD verification or production resources. |
| Portfolio bundle | Verified baseline | PACE v1.2 main 205,843 raw bytes; strict 215,000 limit. RAG remains independent. |

Baseline artifacts are preserved under ignored `output/efrd/baseline/`: original assistant, retrieval implementation, evaluation report and 52-test run. They are not new public claims of production readiness.

## EFRD decisions

Retain both isolated corpora and the existing local model/runtime. A shared answer adapter separates supporting citations from topical passages. Exact reviewed aliases and bounded structured-fact rules may produce answers; semantic scores alone remain suggestions unless separately calibrated. New implementation-documentation Q&A stays separate in provenance from the Lab's synthetic examples and requires explicit approval. No live inference is enabled by this change.

Detailed contracts, measured evaluation and final results are linked from the EFRD QA/results record as implemented. The portfolio source/integration remains outside this local enhancement.

## Implemented EFRD flow

1. Load the corpus pointer and complete current authorized manifest; validate schema/spec, metadata/vector hashes and row ownership. No model download on opening.
2. Compute exact reviewed cache lookup and bounded structured-technology composition. Direct answers are one paragraph, hard max 120 words, with their own supporting sources; no embedding worker is needed for these paths.
3. Otherwise show a concise insufficient-evidence result and useful keyword suggestions immediately. If requested/enabled, initialize the local q8 worker for the custom query and update actual relevance ranking. Arbitrary semantic reuse remains disabled.
4. Keep supporting sources under the answer, follow-ups/new-search labels below it, and topical passages under their own disclosure. Portfolio preview hides ranking internals; Lab inspection exposes the real trace and resource request counts.
5. Safe in-memory demonstrations cover six failure scenarios. Actual worker/version/hash interception and offline tests verify separate local behavior. Live gateway/DO verification remains limited to local fixtures/dry-run.

`AnswerResult` adapts reviewed, composed, generated-fixture and insufficient results without replacing canonical source URLs. The old stack-availability answers are explicitly retired; new owner-confirmed technology facts come from the existing hashed portfolio export. Original editorial data/approval entries remain preserved. New EFRD Q&A/source approval was explicitly granted by the owner for local testing only; routine builds never grant it.

Two experiences share the existing assistant package: **Portfolio assistant preview** (answer-first, no specialist ranking by default) and **Engineering inspection** (actual query/corpus/version, ranked question IDs/source titles, cosine/lexical scores, latency, selected policy, separate passages and generation status). No RAG code was installed into the portfolio repository. Its last built 205,843-byte main entry still satisfies the fixed 215,000-byte ceiling.

See [answer contract](PACE-RAG-EFRD-ANSWER-CONTRACT.md), [evaluation methodology](PACE-RAG-EFRD-EVALUATION.md), [failure modes](PACE-RAG-EFRD-FAILURE-MODES.md) and [QA/results](PACE-RAG-EFRD-QA.md). Every production/provider feature remains explicitly gated; the local implementation is not a claim of deployed enterprise RAG.

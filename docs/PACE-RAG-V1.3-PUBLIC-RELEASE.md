# PACE-RAG v1.3 public release and portfolio integration

Prepared on 19 October 2026 (Asia/Kuching). **No deployment, push or automatic publishing was performed.** Both working trees already contained PACE/BAA/technology and QA changes; they were preserved. Changes remain local and uncommitted for review.

The current content publication and licensing checks pass. This is not blanket production acceptance: professional retrieval still misses its 90% Top-3 target, and the dependency audit is not clean. Those results remain explicit below. The existing hosted sites are unchanged.

## Implementation

The portfolio's About section now contains the native expandable “Ask about my engineering experience” disclosure. It lazy-loads the existing assistant with exactly three starter questions, custom search, one-paragraph reviewed/ontology answers, actual supporting citations, related questions, graceful abstention and keyword fallback. It uses only Professional Experience. Technical inspection links to the full Lab; no iframe, floating chatbot or new design system was introduced.

The pinned v1.3.0 archive contains the component and matching professional assets, source library, model/runtime and notices. It contains no Lab, fictional or implementation corpus. Build-time checks verify every file checksum, reject extras, enforce the package version and current corpus pointer, and reject preview or non-publication records. `public/pace-rag` remains generated and ignored; the local archive and lockfile are reviewable source artifacts.

Opening the disclosure does not load MiniLM. Cached answers and bounded technology composition have no provider dispatch. Only a custom query needing semantic retrieval initializes the local worker; closing unmounts it. Data and static source pages remain local to the portfolio origin. Neither UI receives live API configuration.

The Lab identity is “PACE-RAG v1.3 · Engineering RAG Lab” with “Knowledge first. Inference optional. Evidence always.” “Public demo” is rendered only after a validated non-preview corpus loads. Obsolete test/publication-pending labels are removed from current approved public views. Fictional source provenance, simulated failures, disabled live AI and unverified production capabilities remain visible.

## Exact approvals and publication terms

The explicit owner instruction is recorded in `content/publication-review.json`. Publication approval covers 58 professional registry records (18 sources, 38 current answers and two retired answers) and 64 Lab records (24 sources and 40 answers). Every approval has the current content hash and version, owner reviewer, timestamp, scope and instruction. Imported technology sources now pass through this registry rather than receiving hardcoded test approval. Complete record sets and supporting content/ontology files are fingerprinted; future changes fail checks until separately reviewed.

Two obsolete answers remain retired. No professional or fictional answer body, project mapping, source text or ontology definition was rewritten to manufacture new claims. Publication terms are owner-authorized public display, copyright retained, without an invented CC-BY or open-source reuse grant. Third-party Apache-2.0 and MIT notices remain packaged and checked. Confidentiality, source URL restrictions, expiry, integrity, corpus isolation and live gateway guards remain enforced.

Publication approval makes generated API evidence nonempty, but the Worker, AI binding, budget services and all live switches remain disabled. No gateway was provisioned, invoked or deployed.

## Measured bundles

| Artifact | Raw bytes | gzip bytes |
| --- | ---: | ---: |
| portfolio-main | 207,632 | 64,311 |
| portfolio-assistant | 74,424 | 23,627 |
| portfolio-main-css | 56,436 | 11,306 |
| portfolio-assistant-css | 4,124 | 1,324 |
| lab-main | 222,261 | 70,739 |
| embedding-worker | 851,258 | 216,585 |
| pinned-package | 24,784,996 | — |

The main entry grew from **205,843 to 207,632 bytes** (+1,789), leaving **7,368 bytes** under the 215,000-byte limit. The assistant JS/CSS, model and worker are separate assets, not hidden in that main-entry number. The quantized model is 22,972,370 bytes before runtime/tokenizer overhead. The archive is roughly 24.8 MB compressed and 58 MB unpacked; assets are downloaded only as required. No new Lighthouse score or physical-device memory result is claimed.

## Actual verification

- Content validation, read-only publication/hash checks, pinned model/runtime integrity and Apache/MIT notice checks: passed.
- RAG release build, semantic index verification and release static packaging: passed; 115 files fit the configured Pages limits.
- Portfolio build, TypeScript, lint and existing production/SEO/route checks: passed.
- RAG Node tests: **86 passed, 0 failed, 0 skipped**. Portfolio Node tests: **117 passed, 0 failed, 0 skipped**, including package tamper/foreign-corpus checks.
- Chromium and WebKit integration suites: **4 journeys + 8 Largest-text light/dark layouts each**, all passed, zero axe violations in the assistant region, no horizontal overflow, no page errors, zero generation requests. Tests cover lazy loading, three starters, citations, unsupported claims, lexical and real semantic search, worker failure, corrupted assets, close/focus cleanup, no-JavaScript source fallback and canonical metadata for all original routes.
- Existing combined browser regression: **12/12 passed**. Existing EFRD Chromium suite: **7/7 journeys + 14 layouts passed**. Lab source-discovery suites: **8/8 tasks + 42 layouts in each engine**, passed. Technology browser suites: **5/5 in each engine**, passed. Isolated failure scenarios remain labelled simulations.
- Existing portfolio navigation checks: 12 direct/reload cases, 18 evidence checks, two No Two Mondays journeys, five no-JavaScript routes and two recovery cases passed, no page errors. Existing accessibility review passed 10 route/theme checks, 10 reflow checks and two preference checks. The source ASCII scenery, game and route implementations were preserved.
- No model request before disclosure activation or during cached/ontology queries. No hosted generation request was observed in these suites. Local deterministic evaluation functions also make zero provider calls; no provider billing claim follows.

## Retrieval and limitations

| View | Lexical Top-3 | Semantic Top-1 | Semantic Top-3 | Critical abstention |
| --- | ---: | ---: | ---: | ---: |
| Professional (100 positive paraphrases, 60 critical, 20 composites) | 55% | 57% | **79%** | 60/60 |
| Implementation (40 positive paraphrases, 10 critical) | 75% | 57.5% | 90% | 10/10 |

Both modes had zero incorrect automatic matches, invalid citations or cross-corpus references. All 20 structured technology composites passed. The separate 140-query technology development set had 100% entity, association and structured-answer correctness with zero invented facts/citation errors. These are finite, previously inspected agent-authored tests, not blind reliability guarantees. Professional semantic recall is below the 90% target; it was neither bypassed nor relabelled as passing. Uncalibrated paraphrases continue to suggest reviewed questions and abstain from unsupported direct claims. General semantic paraphrase direct-answer coverage remains deliberately low (0% implementation positives; professional coverage comes from the 20 supported composites).

The pinned RAG npm audit reports **10 findings: 6 high, 4 moderate**. These include Node/native Transformers dependency paths (sharp/onnxruntime-node and transitives) and Wrangler/Miniflare/undici/ws development paths, including a Wrangler deployment-command advisory. The browser build uses Transformers' browser export; the professional archive ships static browser assets, not Node native libraries or Wrangler. This distinction does not make the dependency audit clean. Tooling remediation and any Transformers major-version migration require their own dependency/model compatibility verification before claiming those issues resolved. No deployment command was run during this task.

Live provider/runtime/accounting verification, confidential enterprise authorization, physical devices, screen readers and moderated comprehension remain unverified. Tests ran with Node v23.11.0 on this machine; the repository declares Node 22. A Node 22 clean-install/CI run was not claimed. Optional real-vector unit coverage is explicitly skipped on model-free CI only; this release verification prepared the model and ran it with **zero skipped tests**.

## Reproduce and review

See `docs/release.md` and `integration/portfolio/README.md`. Browser suites use local Lab port 5183 and portfolio port 5177, with Playwright and optional axe tooling from `QA_MODULES_DIR` (default `/private/tmp/pace-qa`). `scripts/public-integration-qa.mjs` is the new cross-engine integration check. `VITE_PACE_RAG_ENABLED=false` is the portfolio rollback switch. No deployment automation was added. Preserve all gates and review the remaining ranking/audit limitations before making any production acceptance claim.

Machine-readable measured results: [public-release-v1.3.json](../evaluation/reports/public-release-v1.3.json). Exact changed-file inventory: [PUBLIC-RELEASE-FILES.json](PUBLIC-RELEASE-FILES.json). These inventory entries identify this task's changes relative to initial file fingerprints, rather than attributing all pre-existing dirty files to this work.

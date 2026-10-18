# Local QA record

Historical baseline. Current EFRD implementation, measurements and remaining gates are recorded in [EFRD architecture](PACE-RAG-EFRD-ARCHITECTURE.md), [results](PACE-RAG-EFRD-RESULTS.md) and [QA](PACE-RAG-EFRD-QA.md).

18 October 2026. This record describes local validation, not production verification. The project remains independent of the existing portfolio; its former adapter is preserved for later integration review.

## Reproduction

From `pace-rag`:

```sh
npm run content:validate
npm test
npm run build
npm run index:verify
npm run eval:retrieval -- --semantic
npm run dev
# In another terminal, while the Lab is running:
npm run test:browser
npm run package:portfolio
npm run check:portfolio-budget -- ../mohdvara.github.io/dist
npm run api:check  # dry-run only
```

Model preparation and semantic indexing use public pinned model assets and local Chromium, not Workers AI. Install the pinned Playwright Chromium before browser/indexing checks. A clean build without prepared vectors retains lexical fallback. Browser QA can target built assets using `PACE_RAG_LAB_URL=http://127.0.0.1:5182/pace-rag/` with `vite preview` serving that port. Optional portfolio browser coverage requires deliberately applying the staged adapter and building a preview; the current portfolio has no assistant.

## Results before test-corpus population

- TypeScript, draft content validation, complete build and SHA-256/vector verification pass.
- 49 Node tests pass. Budget tests use actual in-memory SQLite through a local adapter; provider and Turnstile responses are deterministic mocks. They do not verify Cloudflare production or workerd execution.
- 10 local Chromium journeys pass against both the dev server and built standalone assets: no eager model requests; real first/warm semantic queries; explicit draft answer selection; suggest-only RAG near-miss; mismatched worker specification; failed worker with no automatic retry; failed vectors; corpus-switch cancellation; JavaScript-disabled sources; warm offline queries; 320px/24px reflow. Some journeys combine related checks.
- Cancellation uses an intentionally inert worker; specification mismatch uses a deliberately incompatible worker. Other semantic journeys run the actual pinned q8 model. Neither stub is represented as provider/model correctness evidence.
- Zero live inference/session requests and zero unhandled browser errors were observed. Network assertions cover model, runtime and worker URLs, not merely UI labels.
- Local dev Chromium timings: first semantic query including initialization 681.3 ms; warm query 12.9 ms. These are local-machine samples without mobile throttling and do not predict a visitor's cold network download. Built-asset run: first query 2,740.3 ms; warm query 26.4 ms. Both are single samples, not percentile estimates.
- Semantic evaluation: 112 proposed positives / 50 negatives / 20 grounding questions; Top-3 100% on templated positive queries, ranking p95 0.232 ms. Owner-reviewed flag and release acceptance remain false. Automatic semantic matching is disabled, so zero incorrect automatic matches does not establish a calibrated matcher. No live-provider grounding evaluation was run.
- Restored portfolio: build passes; 107 existing tests pass; main entry 213,064 bytes, below 215,000. Only the pre-existing two BAA documentation edits remain in its source tree.
- Three detached-portfolio local Lighthouse mobile samples: performance 98/98/98; accessibility, best practices and SEO 100; CLS 0; LCP 2056/2042/1998 ms; TBT 0/0/80 ms. Earlier opt-in adapter preview scored 69/98/97; all samples are retained. Its first low sample included a long task in the existing forest renderer, with no RAG/model request before opening. These are diagnostic samples, not a performance preservation claim for a future integration.
- Wrangler **dry-run** compiles 28.94 KiB / 9.01 KiB gzip. Live and accounting switches are false. No deployed API, Durable Object, Turnstile service, real provider response, neuron charge or production CORS behavior was verified.

## Evidence and files

`output/playwright/pace-rag/results.json` is the latest browser report; `results-dev.json` preserves the dev-server run. Screenshots include `lab-search.png` and `lab-mobile-large.png`. `output/performance/` holds all Lighthouse JSON samples and the main-bundle budget report. `evaluation/reports/current.json` records semantic evaluation limitations. These generated local files are ignored by git; the checked-in evaluation report and milestone ledger retain the principal results.

Changed implementation files for the latest milestone: `packages/portfolio-assistant/src/Assistant.tsx`, `scripts/browser-qa.mjs`, `scripts/check-portfolio-budget.mjs`, `scripts/static-pages.mjs`, `package.json`, `README.md`, `docs/{IMPLEMENTATION,MILESTONES,QA,privacy,release}.md`, and preserved adapter files under `integration/portfolio/`. Earlier work remains in the workspace; nothing was restarted.

## Release blockers

Owner source/answer/license review; independently reviewed evaluation labels and claim support; physical-device, screen-reader and other-engine checks; fresh portfolio integration validation when authorized. Provider credentials/account capability, real accounting/response behavior and Cloudflare runtime verification are separate external gates. No production resources may be provisioned or deployed without explicit approval. Generated text must never automatically enter the approved cache.

## Current populated-test validation — 18 October 2026

The owner subsequently requested populated testing content. All 91 records now have explicit hash-bound `local-test` approvals: 40 portfolio answers / 11 public-scope sources, 20 Lab answers / 20 synthetic sources. Test cache hits are available without representing owner publication approval. The original results above are retained as the pre-population baseline.

- `npm test`: **52 passed**, including test-scope publication rejection, test-scope live-evidence rejection, exact cache behavior and the exact enterprise-scale evidence-limitation answer.
- TypeScript, full build and semantic index verification pass. Current indexes: portfolio `4be3f32d7efc2136`, Lab `764049ecc25a7cd5`.
- **10 browser journeys pass against the packaged static app** at port 5183. An exact keyword-only question returns a test-approved cached answer with zero model requests. Paraphrases remain suggestions; explicit answer selection works. First semantic initialization and warm queries use the real q8 model. Worker-specification and cancellation cases remain deliberately stubbed lifecycle tests.
- Zero inference/session requests and zero unhandled page errors. Local first/warm query measurements: 1,610.1 / 17.9 ms, single local Chromium samples without mobile network throttling.
- Real local semantic evaluation: 160 templated positive queries, 50 proposed negative/boundary queries, 20 grounding fixtures; Top-3 100%, zero incorrect automatic answer IDs, one allowed exact boundary-denial answer, ranking p95 0.940 ms. Labels remain unreviewed and release acceptance false. No live grounding inference ran.
- The old evaluator classified any answer on a negative question as wrong; test approvals exposed an exact cached denial on the enterprise-scale question. Its label now explicitly permits only `portfolio-answer-rag-scale`, and the evaluator verifies selected IDs on positives too. This does not loosen semantic matching or permit positive enterprise claims.
- Static package: **119 files**, largest asset **22,972,370 bytes**, under Cloudflare Pages' 25 MiB single-asset limit. The package preserves `/pace-rag/` paths and includes root redirect, 404, headers and no-index metadata. Browser checks exercise this layout locally; no remote host or CDN behavior is certified.
- API generated evidence arrays remain empty because test approvals are excluded. Both live switches and the usage-reconciliation switch remain false. No production resources or deployments were created.
- Existing portfolio source remains untouched by this milestone; only its pre-existing BAA documentation changes remain. Its main-JS limit and prior 213,064-byte baseline are preserved.

Current files are listed in the latest [milestone](MILESTONES.md). [TESTING.md](TESTING.md) supplies concrete queries; [DEPLOYMENT.md](DEPLOYMENT.md) supplies local and Cloudflare static-hosting commands. Test-only content and source licensing need publication review before public release. Infrastructure/provider gates remain independent.

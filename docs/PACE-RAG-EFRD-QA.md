# EFRD QA and local verification

19 October 2026, Asia/Kuching. The implementation continues the existing workspace; baseline source/evaluation/52-test evidence is preserved under ignored `output/efrd/baseline/`. This is local engineering evidence, not a deployed service certification. UTC report timestamps fall on 19 October locally.

## Current scope and acceptance

**Implemented and verified locally:** shared bounded answer adapter; exact reviewed cache; source-backed technology composites; concise answer-first preview; real-model semantic ranking and lexical fallback; separate supporting sources/topical passages; real trace/ranking inspection; explicit cancellation; current-only source/index packaging; local failure demonstrations; independent-wording evaluation; static knowledge/evaluation/architecture pages; browser request and timing observations.

**Mocked or simulated:** provider/Turnstile responses in gateway tests, intentionally inert/incompatible worker fixtures, in-memory quota/provider demonstrations and injected stale/foreign source fixtures. The local budget tests use actual in-memory SQLite through an adapter. None proves production Cloudflare DO, Turnstile, Workers AI, billing or grounding behavior.

**Unverified/blocked:** real provider/account response/accounting, deployed infrastructure, owner publication/license approval, independently reviewed evaluation labels, physical devices and actual screen-reader sessions. The 90% Top-3 ranking target is not achieved in this dataset. Release acceptance remains false. No production resources or deployments were created; the existing portfolio is unchanged by EFRD.

## Automated checks executed

| Check | Observed result |
| --- | --- |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed dependency-free MJS syntax/merge-marker checks and TypeScript unused-symbol checks. This project does not claim an ESLint run. |
| `npm test` | **66 passed, 0 failed** (baseline 52 plus 14 EFRD cases). |
| `npm run content:validate` | Portfolio and Lab contract validation pass. New engineering sources/Q&A have explicit owner-authorized local-test approvals. |
| `npm run index:build`, `npm run index:verify` | Same pinned q8 browser worker builds normalized question/chunk vectors; all active artifact hashes and vectors verify. |
| `npm run build` | TypeScript, worker, Lab/static pages and reusable assistant library pass; existing large-model/worker advisory remains. |
| `npm run package:static`, `npm run package:portfolio` | Local artifacts prepared, not uploaded or installed into portfolio. Current-only static package has 104 files, including the standalone verification report. Largest asset 22,972,370 bytes, below 25 MiB. |
| `npm run eval:retrieval -- --semantic` / lexical equivalent | Executed real local model evaluation and the same lexical suite; reports/case results saved. Targets remain distinct from observations. |
| `npm run check:portfolio-budget` | Existing main entry **205,843 / 215,000 raw bytes**. RAG is not installed, so this enhancement adds zero bytes to that portfolio entry. |
| `npm run api:check` | Wrangler **dry-run only**, 29.05 KiB / 9.11 KiB gzip. All three live/accounting switches false; no resources or actual inference. |
| Release gate | Rejects local-test approval scope as intended; public publication remains blocked. |

New tests cover exact technology membership, preserved upstream export hash, generation separation, 120-word/source bounds, critical/unknown-predicate abstention, supporting citations independent from ranked passages, retired-row vector alignment, expiry/corpus/version integrity, trace score computations, forged/overlong remote responses, unified generated fixture adapter, six isolated failures and held-out/index/calibration disjointness.

The two original stack-availability answers are explicitly retired, not silently rewritten. Original editorial records/approval entries remain. Imported technology facts cite existing owner-confirmed provenance; the aggregate inventory has a working local static source page, avoiding a dependency on publishing the new portfolio JSON first. Professional project anchors remain canonical. Earlier background snapshots are labelled historically superseded for technology qualifications and excluded from open chunk retrieval.

## Browser verification against built static output

`npm run test:efrd-browser` uses the exact-file package at `http://127.0.0.1:5183/pace-rag/`. The local server returns real missing-file 404s; Vite's SPA fallback previously returned HTML 200 for unknown JSON URLs and was unsuitable for this assertion. Production hosting/headers are not inferred from the local server.

Both pinned **Chromium 141 (Playwright build 1194)** and **WebKit 26 (build 2215)** pass:

1. Technology exact/composite professional answers, actual supporting references, explicit insufficient state, cache-only no-model behavior and no specialist ranking in the portfolio preview.
2. Actual cached implementation answer, actual local-model custom query, scores/source titles and trace inspection; supporting sources remain separate from other passages.
3. Actual worker-request failure with keyword/cache preservation and no automatic retry.
4. Inert-worker cancellation, termination and retained keyword result. This fixture tests lifecycle, not model accuracy.
5. All six explicitly labelled in-memory failure demonstrations, with zero real generation requests; quota/provider fixture sends once and blocks its own second attempt.
6. Corrupt manifest release and corrupt source bytes fail closed; the static library link remains usable.
7. JavaScript-disabled source/answer pages, no retired answer in active assets, no old-release artifact at its former endpoint.

Each engine also passes **14 width/theme combinations** at **320, 375, 390, 768, 1024, 1440 and 1920 CSS px**, light/dark, 24px base text and reduced motion, with expanded inspection. No document/group horizontal overflow, page errors or unexpected console errors are observed. Two full-page axe samples per engine (320 dark / 1440 light) have zero violations and zero incomplete findings. This is emulated responsive coverage, not a physical mobile device or Safari/iOS certification.

The original **10 browser regression journeys** pass against the EFRD static package, including incompatible worker specification, corpus-switch cleanup, missing vectors, warm offline search, static sources and 320px large text. Optional portfolio-integration checks were not run because the integration remains staged. No claim is made that installed portfolio integration was tested.

Both engines observed **zero `/session`, `/generate` or Workers AI requests** across these journeys. Timed Chromium queries also verify a previously initialized local model remains usable with the context offline. No live-generation button is configured in the delivered Lab/preview.

## Independent evaluation results

Dataset `efrd-heldout-v1`: **100 portfolio positives, 40 implementation positives, 20 composites, 70 critical negatives**, plus two separate unused calibration proposals. Positive questions are normalized-disjoint from indexed canonical/alias text. Agent-authored labels remain independently unreviewed; this dataset was inspected while diagnosing template overmatching, not held untouched as a blind final test.

| Metric | Portfolio | Implementation Lab |
| --- | ---: | ---: |
| Top-1 approved-answer ranking accuracy | 57.0% | 55.0% |
| Top-3 candidate recall | **79.0%** | **87.5%** |
| Appropriate critical abstention | 100% (60/60) | 100% (10/10) |
| Incorrect automatic answers | 0 | 0 |
| Invalid supporting references / foreign references | 0 / 0 | 0 / 0 |
| Direct-answer coverage, positive + composite intents | **16.7%** (20/120) | **0%** (0/40) |
| Structured composite scenarios | 20/20 expected fact sets | Not applicable |
| Lexical Top-3 recall | 55.0% | 55.0% |

These are different denominators: ranking accuracy is not confident answer selection. Paraphrases deliberately abstain from direct answers and offer approved question selection unless exact reviewed aliases or a bounded structured rule apply. Canonical/alias cache hits work but are not counted as held-out paraphrase coverage. Low coverage and below-target recall are material weaknesses; safe abstention does not conceal them.

Source membership is not entailment. Twenty existing generation scenarios are retained but no live grounded-generation run was performed. No finite sample establishes statistical reliability, enterprise readiness or deployed provider performance. [Methodology](PACE-RAG-EFRD-EVALUATION.md), [summary](PACE-RAG-EFRD-RESULTS.md) and JSON reports/case details retain these qualifications.

## Resource and performance observations

Environment: Apple M1, macOS arm64, Node v23.11.0 in the executed tool environment, pinned local Chromium, localhost exact-file HTTP server with no compression/throttling. Node 22.12+ remains the project's declared supported baseline. These are local sample distributions, not mobile-network predictions.

| Measurement | n | Min | p50 | p95 / max |
| --- | ---: | ---: | ---: | ---: |
| First semantic embedding including worker/model initialization | 3 fresh contexts | 655.6 ms | 664.7 ms | 680.9 ms |
| Warm local query embedding | 9 | 14.3 ms | 15.5 ms | 28.7 ms |
| Cache answer to next animation frame | 3 | 50.1 ms | 50.7 ms | 52.4 ms |
| All observed answer-update frames, including semantic refinements | 27 | 12.0 ms | 30.7 ms | 682.3 ms p95 / 700.1 ms max |

The next-frame measurement runs after React commits; it is a practical frame marker, not a guarantee of pixel presentation to a human. Request sizes are measured using Playwright `Request.sizes()`: each fresh model path fetched seven files totaling **45,325,633 response-body bytes + 1,553 response-header bytes**, repeated in three contexts. This includes the worker, required tokenizer/config, ONNX model and JSEP runtime. ONNX alone is **22,972,370 bytes**. Remote CDN compression/caching and mobile data cost may differ. Unsupported browser-memory/provider-token/neuron-billing measurements are explicitly **Not measured**.

| Built artifact | Raw bytes | gzip level 9 |
| --- | ---: | ---: |
| Existing portfolio main (unchanged) | **205,843** | Not remeasured here |
| Standalone Lab main | **192,794** | 61,881 |
| Reusable assistant library | **54,898** | 16,430 |
| Separately initialized embedding worker | **851,258** | See build output; not part of portfolio startup |

No model/runtime/worker request occurs on opening, choosing a cache starter, checking semantic mode alone or answering a bounded technology query. A custom unresolved semantic query initiates local work; lexical results remain visible meanwhile. RAG remains independent of the portfolio. This is not a promise that future integration will preserve total payload or timing without revalidation.

## Screenshots inspected

Generated local evidence under `output/playwright/efrd/`:

- Chromium `assistant-react.png`: concise technology relationship answer, owner-confirmed project sources, explicit new-search follow-ups; no ranking clutter in default assistant.
- Chromium `assistant-mobile-viewport.png`: 320px / 24px text, dark theme answer/source reading view.
- Chromium and WebKit `layout-320-dark-large.png`, `layout-1440-light-large.png`: expanded inspection at mobile/desktop, tested for overflow. Full-page mobile inspection is intentionally long; viewport capture supplements its heavily resized preview.
- Chromium `lab-inspection.png`: actual candidate scores/source records, selection reasons, separate supporting citations and other passages; real cache path after explicit selection.
- `failure-demo.png`: visibly simulated scenario and zero real generation requests.

No employer system screenshot, private architecture or vendor-logo asset was introduced. Local browser snapshots/test artifacts are ignored by git.

## Files and reproducibility

Core: `packages/knowledge-schema/src/{contracts.ts,validate.mjs,technology.mjs}`, `packages/semantic-core/src/{retrieval,answers,failures}.mjs`, `load.ts`, `packages/portfolio-assistant/src/{Assistant,Inspection}.tsx`, `index.d.ts`, styles. Lab: `apps/rag-lab/src/{main,FailureDemos}.tsx`, styles/index fallback.

Content: imported `content/portfolio/technology-evidence.json`, explicit `retirements.json`; `content/lab/{engineering,records}.mjs` and exactly 24 owner-authorized new local-test approval entries, retaining existing approvals. API: bounded output enforcement in `apps/rag-api/src/security.mjs`; generated server evidence arrays remain empty because test approval scope is excluded.

Tooling: import/index/current-only static pages/packaging/local server, EFRD held-out cases/evaluator/case reports, browser suites, measurements, syntax/static lint, `tests/efrd.test.mjs` and adjusted count/browser expectations. No new UI dependency or production configuration enablement.

```sh
npm run typecheck
npm run lint
npm test
npm run index:verify
npm run eval:retrieval -- --semantic
npm run eval:retrieval
npm run build
npm run package:static
npm run preview:static
# separate terminal; install pinned browsers first if absent
npm run test:efrd-browser
EFRD_BROWSER=webkit npm run test:efrd-browser
PACE_RAG_LAB_URL=http://127.0.0.1:5183/pace-rag/ npm run test:browser
node scripts/efrd-measurements.mjs
npm run package:portfolio
npm run check:portfolio-budget
npm run api:check # compile/dry-run only
```

`index:build` requires prepared pinned assets and uses local Chromium; `build` never creates approval. The explicit one-time EFRD local-test approval followed the owner's answer to the content-review request. No general bulk approval script was run. The static Lab scorecard links versioned summary, case, fallback and browser/resource reports; it does not publish targets as results.

Remaining gates: independently reviewed content/labels and licensing, higher useful retrieval/answer coverage, separately reviewed portfolio integration, actual authorized provider/runtime/accounting checks, physical-device/screen-reader verification and explicit approval for any production provisioning/publication. Existing portfolio PACE/BAA edits remain untouched by EFRD.


Final continuation check (19 October 2026): content validation, index verification, syntax/static lint and portfolio byte-budget checks pass. Publication validation deliberately rejects local-test approval with “Publication requires owner approval; local-test approval is insufficient.” Packaged architecture, evaluation, verification JSON and aggregate technology source return HTTP 200; historical release answers return HTTP 404. The final package contains 104 files. Existing portfolio working-tree changes match the preserved pre-EFRD list; no integration was installed.

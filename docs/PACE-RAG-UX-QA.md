# UX clarity and provenance — local QA

19 October 2026. The interrupted v1.2 work was completed and validated alongside v1.3 TOER. No deployment, resource provisioning or real generation/provider call was authorized or performed. Machine evidence: `evaluation/reports/ux-toer-local-verification-v1.json`; raw browser artifacts are ignored under `output/playwright/`.

## Implemented and preserved

One native radio-group source selector replaces two overlapping mode/corpus rows. Professional Experience is the default. The three sources have disjoint validated search views, introductions, starters, documents, citations and libraries. Previous results and active workers are disposed on source change. Standard answers and supporting evidence precede optional inspection. Settings are secondary; topical passages and advanced diagnostics share the collapsed inspection view. Source origin is visible before a query; no technical-mode choice is necessary.

The owner's session confirmation “Human authored AI-assisted” is recorded for all 20 Atlas fixtures, separately from the unchanged local-test approval scope. Library summaries and full source viewers expose type, purpose, stable ID, origin, repository-relative file and review/publication state. Specific tools/preparation dates remain unknown. No private absolute path or unverified public repository URL is used. Original approved source bodies, Q&A, approval files and the owner technology export remain unchanged.

## Actual acceptance results

| Check | Result and scope |
| --- | --- |
| Node regression / boundary tests | 85 passed, including eight scope tests and eleven ontology tests; actual SQLite plus deterministic provider/verification mocks, no real Cloudflare runtime |
| UX task-flow suite | Eight tasks per Chromium/WebKit engine pass: recruiter starter, matching-rule inspection, fixture origin/source viewer, clearing/isolation on switching, unavailable remote AI, missing evidence, native keyboard, no-JavaScript libraries |
| Responsive source/layout checks | 42 per engine: three sources × seven widths × light/dark; 84 total, 24px root text, reduced motion, collapsed/expanded diagnostics; no horizontal overflow |
| Automated accessibility | Six axe samples per engine across three sources at 320 dark / 1440 light; 12 samples with zero violations and zero incomplete checks |
| Existing EFRD browser checks | Seven journeys and 14 regression layouts per engine pass; four additional axe samples have zero violations/incomplete |
| Existing legacy browser checks | All 10 journeys pass, including real semantic/offline retrieval, controlled worker-spec failure, cancellation and no eager model |
| New TOER browser checks | Five journeys per engine pass, including real resolver traces, zero model requests for supported lookups, forbidden project associations, source separation and small no-JavaScript viewers |
| Data checks | Content validation and current index/hash/vector verification pass; immutable corpus IDs remain unchanged |
| Model / remote requests | Source switching, source browsing, starters and structured lookups cause no model initialization. Monitored browser suites observed zero generation/session/provider requests |
| TypeScript / lint / build | Pass; lint is syntax/merge-marker plus unused-symbol TypeScript checking, not ESLint |
| Publication gate | `release:check` deliberately fails: local-test approval is insufficient for publication |

The first UX run exposed duplicate sibling keys leaving a previous source explanation in the DOM. Removing the unnecessary explanation key fixed duplicate landmarks; source-change tests now require exactly one explanation. The WebKit keyboard check exposed skipped native button focus; explicit button tab stops preserve access there. A legacy mocked-worker check raced the static-ready callback; it now waits for completed semantic-index readiness before expecting a worker. That change does not delay normal keyword/static availability.

These are **scripted task flows**, not moderated human research. The target of choosing a source within 10 seconds has **not been measured**. Automated test elapsed times are not user-comprehension measurements. The fixture origin explanation is visible immediately after one source-selection interaction; browser checks verify that placement, and separately open the library/viewer.

## Visual review and performance

Screenshots cover the professional answer, implementation inspection, fictional source explanation/viewer, desktop and tablet layouts, mobile large text and ontology trace. The current dark-green/gold identity is preserved. Full-page captures are supplemented by viewport/element review where needed; see the v1.3 QA record for the final inspected artifacts.

The standalone Lab and reusable assistant are separately measured. The portfolio remains detached and its main entry is **205,843 / 215,000 raw bytes**, with **0 RAG bytes added**. Actual bundle/timing values are in [TOER QA](PACE-RAG-TOER-QA.md) and the machine report. No new dependency, model, live flag or infrastructure service was introduced.

## Reproduce

```sh
npm test
npm run lint
npm run index:verify
npm run build
npm run package:static
npm run preview:static
# another terminal
npm run test:ux-browser
UX_BROWSER=webkit npm run test:ux-browser
npm run test:toer-browser
TOER_BROWSER=webkit npm run test:toer-browser
npm run test:efrd-browser
EFRD_BROWSER=webkit npm run test:efrd-browser
PACE_RAG_LAB_URL=http://127.0.0.1:5183/pace-rag/ npm run test:browser
npm run eval:retrieval -- --scoped --semantic
npm run eval:retrieval -- --scoped
npm run eval:technology
node scripts/review-measurements.mjs
```

Browser scripts use installed pinned Playwright browsers. Axe is supplied by the existing isolated QA installation at `/private/tmp/pace-qa`; it is not a production dependency. Physical devices, actual screen readers, provider billing/accounting, deployed Cloudflare behavior, independently reviewed labels and publication approval remain outstanding.

Changed areas: `apps/rag-lab/src/{main,FailureDemos}.tsx`, styles/index fallback; assistant/inspection/props/styles; contracts/provenance registry; scoped verified loader, source-current validation and `scope.mjs`; static pages, browser suites and scoped evaluator; README/testing/deployment documentation. No portfolio source or adapter installation was changed. Details of fixture origins are in [corpus provenance](PACE-RAG-CORPUS-PROVENANCE.md).

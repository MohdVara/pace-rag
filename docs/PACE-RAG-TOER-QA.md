# PACE-RAG v1.3 TOER — local review evidence

19 October 2026. Built on the completed [v1.2 UX/source boundaries](PACE-RAG-UX-QA.md), without changing the approved six-project inventory, content approval entries or pinned embedding model. No deployment or provisioning occurred.

## Implemented

A typed, versioned 30-entity general ontology; deterministic alias recognition; explicit categories and directed relations; approved project-fact derivation; bounded intent/constraint parsing; one-paragraph source-grounded technology answers; and actual resolver traces inside optional inspection. Generic inventory/cache/semantic/lexical/static paths remain intact. Unknown technologies, unsupported constraints and unrecorded versions do not authorize project claims. New content and generated answers are not auto-approved or published.

Files: `packages/semantic-core/src/technology/{ontology,resolve}.mjs`, integration in `answers.mjs`, typed contracts, indexer validation, inspection UI, `evaluation/technology-heldout.mjs`, technology evaluator/browser/measurement scripts, ontology unit tests and static definition/evaluation pages. The ontology is code for general classification; the owner export remains the single project-fact source. No framework, LLM, NLP or graph-service dependency was added. No ontology code was installed into the portfolio homepage.

## Verified results

- **85 Node tests pass**, including all prior tests and new provenance/scope/ontology guards. Build, TypeScript, syntax/static lint, content validation and index verification pass.
- **140-query development evaluation:** 40 direct, 30 alias, 30 category, 20 cross-project, 20 negative. All exact expected entity/project sets and answer/abstention outcomes pass. All 80 coarse classification occurrences pass. Zero observed invented project fact tuples, invalid citations or remote calls. The 120 supported positives and 20 negatives are reported separately in the case/group artifacts. These labels are agent-authored, inspected during implementation and not independently reviewed; no blind accuracy guarantee is claimed.
- **Five TOER browser journeys per Chromium/WebKit engine pass.** Twelve representative supported query types use the ontology with no model requests. Inspection exposes actual aliases, filters, relations, evidence and versions. Unsupported metrics/versions/project associations abstain. Both nonprofessional scopes reject injected professional interpretation. Source libraries/viewers and ontology definitions fit 320px without JavaScript.
- Completed UX checks: eight tasks per engine, 84 large-text source/layout combinations total and 12 zero-violation/incomplete axe samples. Existing seven EFRD journeys per engine plus 28 regression layouts/four axe samples pass. Ten legacy browser journeys pass. Observed generation requests, page errors and unexpected console errors are zero.
- Separated semantic evaluation: Professional Experience **57% Top-1 / 79% Top-3** on 100 paraphrases; How PACE-RAG Works **57.5% / 90%** on 40. All 70 critical questions abstain, all 20 existing defined composites return expected facts, with zero incorrect automatic answers or citation/corpus errors. Portfolio ranking still misses the 90% target; implementation reaches it only on this finite, previously inspected development set. Neither result validates fictional paraphrase quality or live grounding.
- API compilation is a **Wrangler dry run**, 29.05 KiB / 9.11 KiB gzip; all three live/accounting flags remain false. Deterministic API tests and failure demonstrations are mocked/simulated, not real Cloudflare verification. No provider allowance, token bill or production runtime was tested.

## Performance evidence

Current raw/gzip-9 bundle measurements are reproduced by `node scripts/review-measurements.mjs` and retained in `evaluation/reports/ux-toer-local-verification-v1.json`. The standalone Lab is **222,108 bytes raw / 70,512 gzip-9**; reusable assistant **88,572 / 25,514 bytes**. The worker remains **851,258 bytes**, separately lazy. The detached portfolio entry remains **205,843 / 215,000 bytes**; no RAG integration or homepage dependency was added.

Local M1/macOS arm64 Chromium samples under some concurrent QA: cold embedding n=3 **750.5–886 ms**, median **755.9 ms**; warm n=9 **14.2–29.2 ms**, median **17.5 ms**. Cache-answer next-animation-frame n=3 **13–14.4 ms**, median **13.8 ms**. These are local uncompressed HTTP observations, not isolated benchmarks, network/device guarantees or exact pixel presentation. Browser memory and provider billing remain **not measured**. No extra definition API or eager model loading was introduced.

## Visual review

Inspected artifacts include the one-selector desktop view and professional answer, fictional source metadata/content, tablet implementation inspection, and final ontology answer/trace and mobile viewport captures under `output/playwright/ux-v1.2/` and `output/playwright/toer/`, including `answer-viewport.png`, `trace-viewport.png`, `entities-viewport.png` and `answer-mobile-viewport.png`. Responsive/axe checks complement visual review; they do not establish actual screen-reader or physical-device certification. Current green/gold styling, native disclosures, visible radio state, large text and reduced motion are preserved.

## Reproduction and release gates

```sh
npm test
npm run lint
npm run content:validate
npm run index:verify
npm run eval:technology
npm run build
npm run package:static
npm run preview:static
# separate terminal
npm run test:toer-browser
TOER_BROWSER=webkit npm run test:toer-browser
npm run check:portfolio-budget
npm run api:check # compile/dry-run only
npm run release:check # expected rejection of local-test approvals
```

Publication is blocked. Approval of fixture authorship does not approve publication. Independently reviewed content/licenses/labels, broader unfamiliar wording, improved portfolio semantic ranking, moderated comprehension, physical devices/screen readers and any authorized provider/runtime/accounting checks remain gates. Future integration must be separately installed, measured and reviewed; the local adapter package includes the definition viewer but has not been applied. Explicit approval is required for any production deployment or provisioning.

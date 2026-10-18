# PACE-RAG v1.1 — Evidence-First RAG Demonstration

Browser-first knowledge retrieval shared by the portfolio assistant and an inspectable Engineering RAG Lab with implementation documentation and synthetic examples. Search does not require Cloudflare credentials. Live generation is disabled by default.

## Run locally

Use Node 22.12+ and npm. From this directory:

```sh
npm ci --ignore-scripts
npx playwright install chromium
npm run model:prepare
npm run index:build
npm run build
npm test
npm run index:verify
npm run eval:retrieval -- --semantic
npm run dev
```

Open `http://127.0.0.1:5180/pace-rag/`. Opening or choosing cached starters does not download a model; the first custom query requiring semantic retrieval does. Exact cache answers and supported technology composites avoid that download. Keyword search is available without it. The model preparation command downloads the pinned public model and checks its ONNX hash. Indexing runs the same q8 WASM worker in pinned Chromium. These commands never call Workers AI. Without model assets/vectors, `npm run build` still produces a lexical-search preview.

Ready to try: run `npm run dev` in this prepared checkout. See [test questions](docs/TESTING.md) and [local/static deployment instructions](docs/DEPLOYMENT.md). `npm run package:static` prepares a hosting-shaped artifact under `output/static-site` without uploading it.

## Status and review boundary

- 38 current portfolio cached Q&A entries; two obsolete stack-availability answers explicitly retired while their original records/approvals remain preserved. Seven owner-confirmed technology sources are imported from the PACE v1.2 public export.
- 20 synthetic Lab documents / 20 synthetic Q&A plus four actual-implementation source documents / 20 new PACE-RAG Q&A, explicitly approved by the owner for local testing on 19 October 2026.
- Current records are **approved for testing only** under the owner’s request. UI and static pages label this scope explicitly; it is not publication approval.
- `npm run release:check` rejects `local-test` approvals. Public publication still requires reviewed content, licensing and publication approvals.
- The API bundle contains **only approved source documents**; currently its evidence sets are empty.
- No resources have been provisioned, and no remote deployment or inference was performed.

Source, evidence and deployment notes: [implementation](docs/IMPLEMENTATION.md), [operations](docs/operations.md), [privacy](docs/privacy.md), [release](docs/release.md).

Recorded verification and limitations: [QA](docs/QA.md). Browser QA can be repeated while the Lab preview is running with `npm run test:browser`; set `PACE_RAG_PORTFOLIO_URL=http://127.0.0.1:5177/` to include the separately built portfolio preview. `npm run perf:report -- preview` measures the unopened assistant build with three local Lighthouse samples.

## Evidence-first experience

Choose **Portfolio assistant preview** for concise source-backed answers, or **Engineering inspection** for actual ranking traces. Technology questions use bounded deterministic owner-fact templates; other uncalibrated paraphrases suggest reviewed questions and explicitly abstain from direct claims. Model initialization happens only when a custom semantic query needs it. Six isolated failure demonstrations are clearly labelled simulations. No live AI configuration is passed.

Reproduce independent-wording evaluation: `npm run eval:retrieval -- --semantic`. Current semantic Top-3 recall is 79% portfolio / 87.5% implementation Lab, below the 90% target; all 70 critical questions abstain in the defined suite. Labels are agent-authored, not independently reviewed. Detailed [EFRD QA/results](docs/PACE-RAG-EFRD-QA.md) records actual scope, timing, limitations and outstanding release gates.

## Packages

`knowledge-schema`: contracts and runtime boundary validation. `semantic-core`: local embedding worker, verified asset loading, conservative matching and lexical retrieval. `portfolio-assistant`: reusable React component with React as a peer dependency. `rag-lab`: inspectable frontend and static sources. `rag-api`: dedicated generation Worker and SQLite budget coordinator.

## Verification

`npm run lint` uses dependency-free syntax/merge-marker checks plus TypeScript unused-symbol checks (not ESLint). `npm run test:efrd-browser` exercises the built static package on port 5183; set `EFRD_BROWSER=webkit` for the installed pinned second engine. `npm test` uses actual in-memory SQLite, deterministic provider/verification mocks and no credentials. `npm run api:check` is a Wrangler **dry run**, not a deployment. `npm run eval:retrieval` measures lexical retrieval; add `--semantic` to measure actual local model retrieval. Evaluation labels are proposed and require owner review. No release-quality result is inferred from templated paraphrases.

## Portfolio integration

Build first, then `npm run package:portfolio`. The portfolio is currently detached from PACE-RAG. The earlier adapter is preserved in `integration/portfolio/` for later review; do not apply it until standalone and owner-review gates pass. A future integration uses a fresh pinned local package and matching static assets. `npm run check:portfolio-budget -- /path/to/portfolio/dist` enforces the existing 215,000-byte main JavaScript limit. See [milestones](docs/MILESTONES.md) for evidence and blockers.

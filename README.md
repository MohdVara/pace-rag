# PACE-RAG

**PACE-RAG = Portfolio Assistant with Cited Evidence — Retrieval-Augmented Generation.**

- **P — Portfolio:** the professional evidence the assistant helps visitors explore.
- **A — Assistant:** an interface for finding reviewed information and relevant sources.
- **C — Cited:** direct answers retain validated supporting citations.
- **E — Evidence:** approved records bound what the system can substantiate.
- **RAG — Retrieval-Augmented Generation:** the architectural approach and direction, with retrieved evidence constraining any future generative path.

This is the official meaning going forward, not a claim about the project's historical naming origin. The current implementation primarily uses reviewed cached answers, deterministic technology composition and local retrieval. Live generative inference is currently disabled: the name does not mean that every query invokes a generative model. This evidence-first design favors traceable sources, reviewed reuse and conservative abstention.

Browser-first knowledge retrieval shared by the portfolio assistant and an inspectable Engineering RAG Lab with implementation documentation and synthetic examples. Search does not require Cloudflare credentials. Live generation is disabled by default.

Hosted demo: [PACE-RAG](https://pace-rag.paramasvara.online/), served by Cloudflare Pages. See [hosting](docs/HOSTING.md) for deployment and custom-domain setup. A hosted build may differ from local work; the [v1.6 activation review](docs/PACE-RAG-V1.6.1-RETRIEVAL-REVIEW.md) records the last checked local/hosted boundary.

PACE-RAG demonstrates how a small, curated knowledge base can answer questions with traceable sources, explicit provenance and conservative handling of unsupported claims. The current local implementation and workspace package are **v1.6.1 / `1.6.1`**. Historical foundation, UX and ontology reports retain their recorded versions; see the [current review](docs/PACE-RAG-V1.6.1-RETRIEVAL-REVIEW.md) for regression measurements and pending independent evaluation.

## What this repository contains

- **Three searchable sources:** Professional Experience, How PACE-RAG Works, and Fictional Test Documents. Each has its own starters and browsable source library.
- **Local retrieval:** browser-based semantic search using a pinned embedding model, with keyword search available without the model.
- **Evidence-backed answers:** publication-approved cached answers, bounded technology summaries, source citations, and explicit abstention when a direct answer is unsupported.
- **Inspectable behavior:** ranking details, source snapshots, provenance, evaluation reports and six labelled failure simulations.
- **Technology understanding:** a curated registry of entities, aliases, categories and relationships, kept separate from owner-confirmed project usage.
- **Reusable integration:** a React assistant package and the native portfolio adapter near About.
- **Optional server scaffolding:** a Cloudflare Worker gateway with request verification and SQLite budget coordination. It is disabled in the standalone app and is not a production-verified service.

## How it works

```text
Content records + approvals + technology evidence
                       |
              Validate, chunk and index
                       |
          Hash-verified static knowledge assets
                       |
       Select one of three scoped source views
                       |
     Cached answer / technology composition / retrieval
                       |
       Cited answer, related sources or abstention
```

Indexing produces immutable knowledge releases and, when requested, embedding vectors. The browser verifies assets before deriving the selected source view. Exact cached answers and supported technology questions can avoid model initialization; other semantic queries load the model on demand. Opening retrieval details displays the existing result. Ordinary local search does not call a hosted LLM.

## Repository layout

```text
apps/
  rag-lab/                Standalone React application
  rag-api/                Optional Cloudflare Worker and budget coordinator
packages/
  knowledge-schema/       Contracts, validation and provenance registry
  semantic-core/          Retrieval, embedding worker, scope and technology logic
  portfolio-assistant/    Reusable React assistant and inspection interface
content/
  portfolio/              Professional records, approvals and technology evidence
  lab/                    Implementation records and fictional Atlas fixtures
evaluation/               Datasets, policies and recorded evaluation reports
scripts/                  Indexing, asset preparation, packaging and QA tools
tests/                    Node regression tests
docs/                     Architecture, deployment, provenance and QA evidence
integration/portfolio/    Current adapter and integration instructions
```

## Run locally

Use Node 22.12+ and npm (`.nvmrc` records the project Node version). Start from the repository root. For a quick keyword-search preview:

```sh
npm ci --ignore-scripts
npm run build
npm run dev
```

Open `http://127.0.0.1:5180/pace-rag/`. Without model assets and vectors, this build provides a lexical-search preview. To prepare semantic search and verify its generated index:

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

See [test questions](docs/TESTING.md) and [local/static deployment instructions](docs/DEPLOYMENT.md). `npm run package:static` prepares a hosting-shaped artifact under `output/static-site` without uploading it. Dependencies, downloaded models, generated site assets, build output and local environment files are excluded from Git; a fresh clone must prepare the assets it needs.

## Common commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local Lab at port 5180 |
| `npm run build` | Build preview indexes, the Lab and the assistant package |
| `npm run model:prepare` | Download and verify pinned public model assets |
| `npm run index:build` | Build semantic indexes using the pinned browser worker |
| `npm run content:validate` | Validate source records and content-bound approvals |
| `npm run lint` | Check syntax, merge markers and TypeScript unused symbols |
| `npm test` | Run Node regression tests, including SQLite budget tests |
| `npm run index:verify` | Check generated index integrity |
| `npm run eval:retrieval -- --semantic` | Evaluate retrieval with the local embedding model |
| `npm run eval:technology` | Evaluate deterministic technology understanding |
| `npm run package:static` | Package the built app for static hosting |
| `npm run preview:static` | Serve the static package locally at port 5183 |
| `npm run api:check` | Bundle the optional Worker in a deployment dry run |
| `npm run build:cloudflare` | Prepare and verify the approved static site for native Cloudflare Git builds |
| `npm run release:check` | Verify current publication hashes, pinned models and license notices |

The GitHub Actions workflow validates content, runs Node tests and builds a lexical preview. It does not download models, invoke live AI or deploy the application. Browser suites require the appropriate built assets and a running preview; see [testing](docs/TESTING.md) and the linked QA reports for setup and recorded limits.

## Status and review boundary

- 43 current portfolio cached Q&A entries; two obsolete stack-availability answers explicitly retired while their original records/approvals remain preserved. Seven owner-confirmed technology sources are imported from the PACE v1.2 public export.
- 20 synthetic Lab documents / 20 synthetic Q&A plus four actual-implementation source documents / 20 implementation Q&A, approved by the owner for public publication on 19 October 2026.
- Current records have **version/hash-bound publication approval** under the owner’s explicit request. Future content changes require renewed review.
- `npm run release:check` rejects `local-test`, missing scopes, changed reviewed files and pending license terms. Publication permission does not certify production capabilities.
- The generated API evidence now contains approved documents; the optional gateway and live switches remain disabled and are not wired into either UI.
- The static demo is hosted on Cloudflare Pages. The optional API, AI inference and budget services have not been deployed as part of this hosting setup.

Source, evidence and deployment notes: [implementation](docs/IMPLEMENTATION.md), [operations](docs/operations.md), [privacy](docs/privacy.md), [release](docs/release.md).

Recorded verification and limitations: [QA](docs/QA.md). Browser QA can be repeated while the Lab preview is running with `npm run test:browser`; set `PACE_RAG_PORTFOLIO_URL=http://127.0.0.1:5177/` to include the separately built portfolio preview. `npm run perf:report -- preview` measures the unopened assistant build with three local Lighthouse samples.

## Evidence-first experience

Choose one source: **Professional Experience**, **How PACE-RAG Works**, or **Fictional Test Documents**. Each has its own search view, starters, source explanation and static library. **Inspect retrieval details** opens the same result without rerunning search. Atlas fixtures are human-authored with AI assistance, as confirmed by the owner; their fictional status and source provenance remain explicit. Technology questions use bounded deterministic owner-fact templates; other uncalibrated paraphrases suggest reviewed questions and explicitly abstain from direct claims. Model initialization happens only when a custom semantic query needs it. Six isolated failure demonstrations are clearly labelled simulations. No live AI configuration is passed.

Reproduce independent-wording evaluation: `npm run eval:retrieval -- --semantic`. Historical v1.1 combined-index semantic Top-3 recall was 79% portfolio / 87.5% implementation Lab, below the 90% target; all 70 critical questions abstain in the defined suite. Labels are agent-authored, not independently reviewed. These baseline numbers do not measure the v1.2 separated views. Detailed [EFRD QA/results](docs/PACE-RAG-EFRD-QA.md) records actual scope, timing, limitations and outstanding release gates.

## Packages

`knowledge-schema`: contracts and runtime boundary validation. `semantic-core`: local embedding worker, verified asset loading, conservative matching and lexical retrieval. `portfolio-assistant`: reusable React component with React as a peer dependency. `rag-lab`: inspectable frontend and static sources. `rag-api`: dedicated generation Worker and SQLite budget coordinator.

Current UX, source origins and acceptance evidence: [UX clarity](docs/PACE-RAG-UX-CLARITY.md), [provenance](docs/PACE-RAG-CORPUS-PROVENANCE.md), [UX QA](docs/PACE-RAG-UX-QA.md).

## Verification

`npm run test:ux-browser` runs scripted source-discovery, keyboard and responsive checks; use `UX_BROWSER=webkit` for the second engine. These do not measure moderated user comprehension. `npm run lint` uses dependency-free syntax/merge-marker checks plus TypeScript unused-symbol checks (not ESLint). `npm run test:efrd-browser` exercises the built static package on port 5183; set `EFRD_BROWSER=webkit` for the installed pinned second engine. `npm test` uses actual in-memory SQLite, deterministic provider/verification mocks and no credentials. `npm run api:check` is a Wrangler **dry run**, not a deployment. `npm run eval:retrieval` measures lexical retrieval; add `--semantic` to measure actual local model retrieval. Evaluation labels are proposed and require owner review. No release-quality result is inferred from templated paraphrases.

## Portfolio integration

Run `npm run build:release`, then `npm run package:portfolio`. The portfolio pins `@pace-rag/portfolio-assistant@1.6.0` as a local archive containing only Professional Experience assets. Its native expandable section lazy-loads upon interaction; cached/ontology answers need no model. Build-time asset checks reject preview, tampered or foreign-corpus packages. See [adapter instructions](integration/portfolio/README.md) and the [public release report](docs/PACE-RAG-V1.3-PUBLIC-RELEASE.md). `npm run check:portfolio-budget -- /path/to/portfolio/dist` enforces the 215,000-byte main JavaScript limit. No deployment is part of these commands.


## Technology understanding (v1.3)

Professional Experience supports deterministic technology entities, aliases, categories, ecosystem relationships, versioned facts and provider comparisons. Try “Which PHP frameworks have you used?”, “What JavaScript frontend technologies have you worked with?”, “Where have you used container orchestration?” or “Have you used Ruby?”. General definitions are separate from owner-confirmed project evidence. Node is a runtime, React a UI library, PDO database access; related technologies do not imply undocumented project usage.

Run `npm run eval:technology` for the separate 140-query development evaluation and `npm run test:toer-browser` (or `TOER_BROWSER=webkit`) against the local static server. Results are finite regression observations, not blind reliability guarantees. [Ontology](docs/PACE-RAG-TECHNOLOGY-ONTOLOGY.md), [entity resolution](docs/PACE-RAG-ENTITY-RESOLUTION.md), [evaluation](docs/PACE-RAG-TECHNOLOGY-EVALUATION.md) and [QA](docs/PACE-RAG-TOER-QA.md) describe implemented behavior and remaining gates. Static hosting does not create new record-level project-content approvals.

## Changing content and contributing

Keep professional evidence, implementation descriptions and fictional fixtures distinct. Source and answer approvals are bound to content hashes: editing an approved record can invalidate its approval. Review changes through the documented [content and release process](docs/release.md); routine builds do not grant approval. Add retrieval or technology regressions when changing answer behavior, then run the relevant checks above.

Start with [implementation](docs/IMPLEMENTATION.md) for the architecture, [provenance](docs/PACE-RAG-CORPUS-PROVENANCE.md) for source origins, and [operations](docs/operations.md) for the optional gateway. Current UX and technology verification are recorded in [UX QA](docs/PACE-RAG-UX-QA.md) and [technology QA](docs/PACE-RAG-TOER-QA.md). Historical results describe their recorded implementation and evaluation scope.

## Licensing and publication

No repository-wide open-source license has been granted in this checkout. Source availability does not itself grant reuse rights. Current source content is authorized for public display with copyright retained and no new reuse license. Third-party model/runtime licenses are checked separately; see [release requirements](docs/release.md). Pushing source to a private GitHub repository does not deploy the application or change its content approval scope.

Historical separated-view evaluation recorded Top-3 recall of 79% for Professional Experience (100 paraphrases) and 90% for implementation evidence (40). Those are not current v1.6 measurements. See the [v1.6 activation review](docs/PACE-RAG-V1.6.1-RETRIEVAL-REVIEW.md) for current regression results and the pending independently prepared holdout. Deterministic technology results are a separate development measurement.

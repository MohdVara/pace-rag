# PACE v1.4 retrieval precision and portfolio clarity

Prepared 19 October 2026, Asia/Kuching. Both repositories contained uncommitted v1.3 changes before this task. They were retained. No commit, push, deployment, provider inference, resource provisioning or DNS change was performed. Existing owner publication approvals remain in force for their exact content; no approval record, Q&A body, ontology definition or project mapping was changed.

## Retrieval and evaluation

The v1.3 hybrid baseline was reproduced before ranking edits. Original development failures often placed the expected answer second or third: broad body wording promoted HR collaboration, product lists or reporting over career, responsibility, outcome and contact intents. Duplicate question alternatives were already collapsed correctly. The problem was suggestion ordering, not a reason to widen automatic answer reuse.

V1.4 professional semantic ranking uses **80% best reviewed-question cosine + 20% normalized answer-body BM25 + a canonical-question intent adjustment bounded to −0.10…+0.16**. Separating the body field avoids repeated question/alias terms dominating lexical evidence; increased semantic weight reduces incidental answer overlap. Generic intent concepts distinguish overview, career, teaching, leadership, financial impact, availability, preview, architecture, verification and contact. Named project/domain alignment modestly favors relevant question headings. Rules contain no query allowlist or answer-ID mapping. Other source views retain the prior 65/35 hybrid; lexical fallback retains prior reviewed-question-and-answer BM25. Candidate traces expose actual cosine, body BM25, adjustment and final score. Scores may exceed one and are not confidence probabilities. The synthetic wrong-match demo now distinguishes its engineered cosine of 1.0 from the blended ranking score.

Only the original development set was used for ranking trials. A new fixed 40-positive/20-critical set was written before trials and tested for exact disjointness from indexed questions, original cases and the preceding 50-question verification set. After freezing the ranking implementation, both verification sets were evaluated without further ranking tuning. Labels and query wording are agent-authored, not independent human evaluation. These are now inspected development verification sets, not a reusable blind certification. The suggested independently evaluated ≥80% Top-1 criterion remains unmet.

| Dataset | Positive questions | Before Top-1 / Top-3 | After Top-1 / Top-3 |
| --- | ---: | ---: | ---: |
| Original development | 100 | 67% / 92% | 78% / 98% |
| Preserved v1.3 verification | 50 | 66% / 94% | 72% / 96% |
| New frozen v1.4 verification | 40 | 65% / 90% | 72.5% / 100% |

All **100 distinct professional critical questions** across the sets abstain; the reused implementation set's ten critical questions also abstain. Zero incorrect automatic answers, invalid supporting citations or cross-corpus references were observed. The 20 original technology composites pass. The 140-case technology-understanding suite still passes. Top-3 success means the expected answer was suggested, not that the paraphrase received an automatic factual answer. Most paraphrases deliberately require explicit selection. Fresh lexical-only results: **62.5% Top-1 / 80% Top-3** on 40 positives, with all 20 critical questions abstaining.

Original reviewed wording/alternatives remain the normal automatic cache path. No similarity threshold was relaxed; a new ranking-version identifier prevents an old calibration policy authorizing the professional ranker. Source status, expiry, corpus, versions, hashes and URLs remain enforced before use. Ontology and fact boundaries are unchanged. Remaining errors include overlapping insurance responsibility/product/workflow intents and generic career/engagement wording. Broader human-reviewed labels and unfamiliar questions remain necessary; successful finite regression results do not establish entailment or production reliability.

Reproduce from `pace-rag` after preparing current approved model/index assets:

```sh
npm run eval:v14 -- --semantic --prior
npm run eval:v14 -- --semantic
npm run eval:v14 -- --semantic --verification --prior
npm run eval:v14 -- --semantic --verification
npm run eval:v14 -- --semantic --fresh --prior
npm run eval:v14 -- --semantic --fresh
npm run eval:v14 -- --fresh
npm run eval:technology
```

`evaluation/baselines/v14-prior-{retrieval,hybrid}.mjs` preserves the actual incoming uncommitted ranker. The evaluator loads those files as a read-only comparison, retaining the same approved corpus/model for before/after. `evaluation/verification-v14.mjs` is the frozen new wording. Versioned `v14-*-{prior,precision}-semantic[-cases].json` reports retain dataset/source hashes and per-query score components. Original v1.3 datasets and reports remain available. The Lab evaluation page displays current finite results and explicitly calls out the missed Top-1 target.

## Portfolio and Lab clarity

The lazy `/pace-rag-case-study/` route preserves detailed technical explanations and evidence links. A one-minute summary explains browser-first trade-offs, source grounding, measured suggestions and experimental boundaries. An accessible ordered-list architecture diagram shows Question → Entity/intent detection → Approved facts or hybrid retrieval → Citation validation → Reviewed answer, suggestions or abstention. Lightweight CSS presents columns on desktop and a vertical flow on small screens; no new library was added. The measurement table wraps at Largest text without horizontal scrolling.

WenSymes retains the Principal Full Stack Developer role and confirmed work. The timeline now says **Mar 2025 — ongoing collaboration** and explicitly describes **occasional professional collaboration**, avoiding a continuous-employment implication. No private financial or staffing information was added. Hash-bound historical RAG snapshots were not silently rewritten.

The Lab keeps three real source views, 3–4 relevant starters, collapsed reviewed-question catalogue/settings/inspection, direct answer → supporting sources hierarchy and fictional/simulated labels. Source origin is visible after choosing Fictional Test Documents; the library and full fixture are reachable within two subsequent navigation actions. Human-authored with AI assistance remains owner-confirmed fixture provenance, not professional evidence. Native keyboard/source-state checks remain active. An unsupported ARIA label on a plain Public demo span was removed after WebKit reported it for review.

## Version and local/public navigation

Root/component/archive are **1.4.0**; Lab and case study display v1.4. Existing publication-approved corpora remain professional `5172c80561642d42` and Lab `cb8cf7a42d2969e4`; the technology evidence version deliberately remains v1.2 because it identifies reviewed content, not app code.

`src/paceLinks.ts` in the portfolio and `apps/rag-lab/src/links.ts` centralize environment-aware navigation. Development defaults use portfolio `http://localhost:5173/` and Lab `http://127.0.0.1:5180/pace-rag/`; optional `VITE_PORTFOLIO_URL` / `VITE_PACE_LAB_URL` customize development origins. Production compilation removes those defaults and uses canonical public URLs, retaining **https://pace-reg.paramasvara.online/pace-rag/**. Portfolio-to-case-study links remain same-origin routes. The assistant's Lab URL is a prop supplied by the portfolio configuration. Citation URLs remain reviewed canonical source identities.

A broader navigation regression exposed WebKit native smooth scrolling racing fragment positioning after rapid reloads, including the No Two Mondays summary. Native fragment scrolling is now immediate (`scroll-behavior: auto`) to avoid this race on reload and keyboard activation. Keyboard focus, native disclosures, ordinary user scrolling and scenery animations are preserved. The JavaScript navigation hook remains unchanged.

Browser checks verify the local round trip, production hrefs, `/pace-rag/` paths and source viewer. Production client JS/CSS scans find no loopback navigation URLs. No DNS changes or invented hostname were introduced. Existing owner-owned development/preview servers were reused and left running.

## Validation and remaining gates

Current machine-readable browser, test, artifact and bundle results are recorded in `evaluation/reports/v14-acceptance.json`; the portfolio has a corresponding review pointer. Node checks pass (91 RAG, 117 portfolio). Both TypeScript/lint/builds, publication/model/license checks, index verification, package integrity and static route/link checks pass. The RAG syntax/static lint is not ESLint; the portfolio uses ESLint.

Chromium and WebKit cover case-study Largest light/dark/reduced-motion layouts at 320/390/768/1440, integrated lazy assistant/model loading, Lab source views/technology/failure regressions, and local/public links. Automated axe checks and native keyboard/disclosure semantics are distinct from actual screen-reader testing. No physical-device or real screen-reader session was performed. No live-provider billing, Cloudflare runtime, enterprise security or live-generation grounding was verified. Existing scenery/game implementations remain unchanged; their Node regressions and browser navigation/recovery checks are preserved.

The final navigation suite passes in both Chromium and WebKit: per engine, 12 direct/reload project cases, 18 evidence links, two No Two Mondays layouts, five no-JavaScript routes and two failed-chunk recovery cases, with zero page errors. The final static package contains 132 files; 55 HTML pages and 216 internal links pass verification, with no obsolete publication labels or stale corpus directories.

Main portfolio JS is **209,844 / 215,000 bytes**, leaving 5,156 bytes headroom; assistant/case-study remain lazy. Detailed current asset sizes are in the acceptance report. Opening the assistant, switching sources, cache/ontology answers and opening inspection cause no eager MiniLM or Workers AI requests. Custom semantic queries retain local model loading; lexical/static fallbacks remain available. No new dependency was added; the local archive was refreshed and earlier versions retained.

Existing publication approval authorizes current content display; it is not a blanket production or security certification. Owner review of these changes, independent evaluation labels, the missed Top-1 target and the previously documented dependency/security limitations remain explicit. Deployment still requires separate explicit authorization. The hosted sites remain unchanged.

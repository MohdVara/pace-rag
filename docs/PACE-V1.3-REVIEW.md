# PACE v1.3 engineering and portfolio review

19 October 2026 · Asia/Kuching. Local implementation prepared for owner review. No deployment, push, DNS change or generated Q&A publication was performed. Both repositories were clean at the initial audit. Existing scenery, typography, games, disclosure structure and PACE/BAA effects were preserved.

## Professional positioning and evidence discovery

Before: WenSymes showed “Mar 2025 — Present”, remote location and active building language without distinguishing employment from collaboration. After: the original start date and Principal Full Stack Developer experience remain; “Ongoing collaboration” and occasional engineering collaboration clarify the continuing professional relationship. No end date, employment contract type, availability or permanent employment commitment was invented. Precise employment classification still needs owner confirmation.

Before: RAG was described primarily as a résumé capability. After: Capabilities and the client evidence journey recognize PACE-RAG as an independently developed engineering demonstration, with links to implementation, measured evaluation and limitations. Enterprise production deployment, commercial RAG delivery, hardened security and live inference remain unverified/disabled.

The hero now has three compact evidence links: enterprise modernisation, integration engineering and applied AI. Each flagship commercial card exposes five technologies projected from the existing owner-confirmed inventory; complete generation-specific stacks remain in native disclosures. Employer routes retain Experience, résumé and contact. Client routes connect problems to evidence, engagement approach and discovery without adding a duplicate booking CTA or a floating assistant.

PolicyStreet already describes insurer/product integration scope, frontend/backend normalization, technical leadership and quotation/issuance workflows. WenSymes already documents HR/administration contribution and planning around consistency, access and uptime. Those verified contributions remain, with employment wording corrected. Education already provides the approved high-level leadership, modernisation and maintainability evidence. Its existing confidentiality restriction prevents expanding internal workflows or architecture; no new commercial outcome or speculative metric was added.

## New case study

`/pace-rag-case-study/` is a separate lazy React route, prerendered to static HTML with canonical, description, Open Graph and JSON-LD metadata and a sitemap entry. It covers the problem, free-tier-oriented constraints, query-triggered MiniLM browser embeddings, reviewed cache reuse, directed technology ontology, deterministic composition, hybrid retrieval, citation provenance, corpus isolation, publication approvals, zero-provider local paths, disabled live generation, lexical/model-failure fallback, evaluation and known limits. It links actual source files and architecture/evaluation documents.

Public Engineering, Capabilities, client evidence and the Lab link to it. The assistant remains a native disclosure near About. No substantial case-study or RAG implementation enters the homepage main bundle.

## Retrieval analysis and measured results

Question-only cosine ranking missed 21/100 original professional paraphrases. Specific misses concerned facts present in reviewed answer bodies but weakly represented in question wording: Sabah, progression into director responsibilities, education evolution, consistency/uptime planning, earlier leave/attendance work, and independent project descriptions. Several adjacent questions compete within insurance, HR, simulation and evidence-boundary topics. No missing professional fact or canonical claim was invented to fix them.

The implementation adds corpus-local BM25 over current approved questions, alternatives and answer text. Candidates combine 65% best question cosine and 35% normalized BM25, deduplicated by answer identity. Keyword fallback uses BM25. Passage retrieval and its source validation remain separate. Trace inspection exposes the actual cosine, question overlap, answer BM25 and combined score. Ranking is not a correctness probability. Existing exact reviewed reuse and technology composition remain; old cosine calibration policies cannot silently authorize the new ranker. Automatic semantic reuse remains disabled.

| Professional set | Before Top-1 | Before Top-3 | Hybrid Top-1 | Hybrid Top-3 | Critical abstention |
| --- | ---: | ---: | ---: | ---: | ---: |
| Original development, 100 positives | 57% | 79% | 67% | **92%** | 60/60 |
| Separate verification, 50 positives | 64% | 88% | 66% | **94%** | 20/20 |

The original development fallback improves from 55% to 83% Top-3. Separate verification lexical-only Top-3 is 78%. The reused implementation development set improves semantic Top-3 from 90% to 95% (40 positives, 10 critical queries); it is not separate final verification. All 20 original structured composites pass. All measured runs have zero incorrect automatic answers, invalid citations and cross-corpus references. Zero incorrect automatic answers does not mean zero irrelevant suggestions: verification still misses three questions and deliberately provides no direct paraphrase answers.

The separate verification wording was frozen before the ranking trial, is disjoint from approved aliases and original development queries, and was not added to the registry. Labels are agent-authored and await independent owner review. No thresholds were lowered, new Q&A approved or final-set-driven tuning performed. The development set recovers 18 old misses and introduces five regressions (background, insurance-work, NTM overview, RAG evidence, availability), a net 13-question gain. Separate final misses concern education disclosure, measured rental financial return and availability. These overlapping intents remain discoverable as related evidence but need future independently reviewed evaluation.

Local ranking/composition is measured separately from model initialization; the new lexical work increases CPU per query. Finite samples do not establish population reliability, enterprise operation or claim entailment. Reports preserve actual per-question candidates, abstention and citation evidence. The baseline evaluator pins commit `9f9034ac118e1a44d9536ce395b80e1d9171bf7e` so it remains reproducible after committing these changes.

Reproduce after preparing the pinned model and approved index:

```sh
npm run eval:v13 -- --semantic
npm run eval:v13 -- --semantic --verification --baseline
npm run eval:v13 -- --semantic --verification
npm run eval:v13 -- --verification
```

See [verification metrics](../evaluation/reports/v13-verification-hybrid-semantic.json), [per-question results](../evaluation/reports/v13-verification-hybrid-semantic-cases.json), [same-set baseline](../evaluation/reports/v13-verification-baseline-semantic.json), and [verification wording](../evaluation/verification-v13.mjs).

## Publication and version consistency

The initial source/license/model publication checks already passed. Existing approved record bodies, approvals, ontology facts and corpus versions remain unchanged: professional `5172c80561642d42`, Lab `cb8cf7a42d2969e4`. No approval generator was run. The root and packaged assistant are now **1.3.1**, within the PACE-RAG v1.3 public identity. Portfolio dependency/lock, version gate, local archive, code and checksummed professional-only assets match. The previous archive is retained. Lab fictional/implementation material is excluded from the portfolio package.

The generated evaluation page now shows the new separated verification and explicit development-set comparisons rather than primarily presenting the old combined-index baseline. Architecture and inspection describe hybrid scores accurately. A source-page contextual note links the historical RAG capability snapshot to the current case study without modifying the hash-bound original. The versioned PACE v1.2 technology inventory is intentionally retained: it identifies the owner-reviewed evidence schema, not the application release.

The static package contains 120 files. Publication artifact checks pass for 55 HTML files and 216 internal links, with zero obsolete public development labels and zero stale corpus directories. Local labels retain reviewed answers, fictional test documents, simulated failures, disabled live AI and experimental status. The hosted Lab was read in Chromium and still displays “PACE-RAG v1.3 · local review”; it will remain stale until an owner-approved deployment. The working hostname is preserved. Recommend **pace-rag.paramasvara.online** for a future branding correction, with a redirect from the existing `pace-reg` URL after owner DNS approval.

## Security

The fresh RAG npm audit began at **10 findings: 6 high, 4 moderate**. Updating only the same-major deployment tool Wrangler **4.45.0 → 4.151.1** and its lockfile dependencies reduces this to **6: 2 high, 4 moderate**. Worker dry-run compilation passes with the upgrade; live switches remain false. No deployment command was executed.

Remaining findings are Transformers, sharp and the onnxruntime-node/global-agent/roarr/sprintf-js chain. npm recommends a Transformers major upgrade to 4.3.1. It was not forced because the current browser/model/runtime contract is pinned and such a migration needs compatibility evaluation. The browser export and static archive do not include the Node-native sharp/ONNX dependencies or Wrangler, but that does not make the repository audit clean. No dependency check or approval gate was bypassed. The portfolio install reports zero vulnerabilities.

Machine-readable remaining package findings and measured acceptance are in [v13-acceptance.json](../evaluation/reports/v13-acceptance.json). Physical-device memory, real screen readers, Node 22 clean CI, enterprise authorization and deployed provider/billing/grounding remain unverified. Local tests used Node v23.11.0, which emitted a portfolio tooling engine warning; do not represent this as a supported-Node CI run.

## Verification and measured bundles

- RAG: **89 tests passed**, including three new checks for answer-body ranking, retired-answer exclusion, legacy-policy rejection and separate verification wording. No failures or skips. Portfolio: **117 passed**, no failures/skips; evidence-route assertions now cover the actual new case study.
- Both production builds, TypeScript/static lint, portfolio ESLint, content validation, index verification, publication/license/model integrity, static packaging, Worker compile-only dry run and byte budget pass.
- Lab regression: 11 journeys. Retrieval suite: 7 journeys + 14 layouts. Technology suite: 5 tasks. Source-view suite: 8 tasks + 42 layouts. No generation requests or application errors in these suites.
- Portfolio assistant: Chromium and WebKit each pass 4 journeys + 8 Largest-text light/dark layouts, with zero axe violations, generation requests or page errors. They verify no eager model, cached/ontology bypass, query-triggered model, model failure, corrupt evidence fail-closed, corpus isolation, close/focus cleanup and no-JavaScript sources.
- New case study: 16 Largest-text light/dark/reduced-motion layouts across Chromium/WebKit, zero axe violations or overflow; lazy-route and no-JavaScript journeys pass. Screenshots were visually reviewed locally.
- Existing portfolio navigation: 12 cases, 18 evidence links, 2 NTM journeys, 5 no-JavaScript routes and 2 recovery cases pass. Existing technology QA: 28 layouts, 6 fragments, 4 axe checks, no failed local resources or application errors.
- Preserved interactive previews/defence entry and recovery checks pass; consent checks pass at mobile/desktop with zero SDK requests by default and cross-tab withdrawal verified. Full normal gameplay progression is covered by the existing game harnesses and was not newly replayed end to end.
- Three local emulated mobile Lighthouse runs: performance **99/99/99**, accessibility/best practices/SEO **100** each, LCP **1.885/1.969/2.006 s**, CLS **0**, TBT **0 ms**. These are local unopened-assistant measurements, not field performance or an enabled-versus-disabled comparison.

| Artifact | Before raw bytes | After raw bytes | After gzip bytes |
| --- | ---: | ---: | ---: |
| Portfolio main JS | 207,632 | **209,684** | 64,759 |
| Lazy portfolio assistant | 74,424 | 75,722 | 24,048 |
| Lazy case study | — | 6,779 | 2,675 |
| Main CSS | 56,436 | 56,725 | 11,371 |
| Lab main JS | 222,261 | 223,703 | 71,183 |

The portfolio main grows 2,052 raw bytes and has **5,316 bytes** of headroom under 215,000. Main baseline was directly measured before editing; other baseline figures are the prior checked-in v1.3 release measurements. Worker/model are separate on-demand assets; the quantized model remains 22,972,370 bytes, and no device-memory claim is made. The new archive is 24,784,953 bytes. Main-JS accounting does not hide lazy assets; their sizes are listed separately.

## Owner review and remaining decisions

1. Confirm precise WenSymes employment classification if a formal label beyond ongoing professional collaboration is desired. No new dates or availability are assumed.
2. Independently review the new evaluation labels and remaining misses/regressions. Approve a separately hash-bound refresh of historical professional RAG/cache wording if desired; these reviewed bodies were deliberately preserved.
3. Review the six remaining dependency findings and plan a separately validated Transformers/runtime migration before making production security claims.
4. Review and commit/push the changes before deploying either site. New case-study source/report links will exist on GitHub only after publication of the source. Preview here is local; public sites remain unchanged.
5. Decide whether to approve the suggested hostname and redirects. No DNS changes were made.

Exact modified and new files in both repositories are recorded in [PACE-V1.3-FILES.json](PACE-V1.3-FILES.json). Ignored generated outputs are local review artifacts, not source changes. No private client internals or speculative impact claims were added.

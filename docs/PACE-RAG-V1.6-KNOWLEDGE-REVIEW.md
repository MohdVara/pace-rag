# PACE-RAG v1.6 professional knowledge refresh — staged review

> Historical pre-approval report. The owner subsequently approved this exact packet on 19 October 2026. See [the activation report](PACE-RAG-V1.6-ACTIVATION.md) for the current approved corpus, package, measurements and remaining ranking limitations. The pending statements below describe the earlier staging milestone.

19 October 2026, Asia/Kuching. The owner supplied verified drafting facts and expressly required the existing publication approval process before release. This task stages the refresh; **publication approval is pending**. No commit, push, publishing, deployment or production provisioning occurred. Existing uncommitted portfolio/RAG work was preserved.

## Concrete review material

Start with [the complete source and Q&A diff](../content/portfolio/staged-v16/REVIEW.md) and [tool-generated review manifest](../content/portfolio/staged-v16/review-manifest.json). The packet includes the four exact portfolio sections, their hashes and source-file hash, previous source/answer records including their historic approval context, new draft records and the editorial proposal. It is outside runtime indexing and the package input paths.

The current publication-approved source registry, Q&A, approval map, retirement file, technology evidence, ontology, provenance and publication manifest remain unchanged. The local approved Professional Experience corpus is still `5172c80561642d42`; the Lab corpus is still `cb8cf7a42d2969e4`. The portfolio still pins `pace-rag-portfolio-assistant-1.5.0.tgz`. Software/ranking remain v1.5; “v1.6” identifies this proposed knowledge revision. Content authorization for portfolio drafting is not recorded as cache publication approval.

## Proposed content

Four source documents propose version 2, retaining IDs and exact case-study citations:

| Source | Portfolio citation | Added bounded facts |
| --- | --- | --- |
| `insurance` | `https://mohd.paramasvara.online/#case-insurance` | Node.js event-driven quotation design, caching/pre-warmed data, potential renewals, seven-day validity and revision after customer changes affecting terms. |
| `education` | `https://mohd.paramasvara.online/#case-campus` | Stakeholder-informed workflow design; class activity and HRMS document-expiration examples; continued operation and modernization. |
| `rental` | `https://mohd.paramasvara.online/#case-rental` | Mobile-friendly internet-connected web operations; remote records, renewals, contract PDF sending and reporting; more than 20 properties. |
| `wensymes` | `https://mohd.paramasvara.online/#case-wensymes` | Evolving organizational roles as a design priority, access/responsibility considerations and occasional collaboration since March 2025. |

Seven existing answer IDs propose wording changes: `portfolio-answer-insurance-work`, `portfolio-answer-modernisation`, `portfolio-answer-education-disclosure`, `portfolio-answer-rental-domain`, `portfolio-answer-rental-reporting`, `portfolio-answer-wensymes-work`, `portfolio-answer-wensymes-security`.

Five new IDs: `portfolio-answer-insurance-validity`, `portfolio-answer-insurance-architecture`, `portfolio-answer-education-workflows`, `portfolio-answer-rental-mobile`, `portfolio-answer-wensymes-rbac-boundary`.

All eight requested questions are present. Stakeholder and WenSymes role questions extend existing records as alternatives. The second remote rental/contracts question is an alternative on the mobile answer, avoiding duplicate Q&A. RBAC is a bounded **lack-of-evidence answer**, not confirmation of a configurable engine. No Redis, event broker, cache TTL mechanism, automatic invalidation, response time, financial uplift, automatic expiration notification, biometric attendance, native/offline app, digital signature, automated PDF delivery or specific permission mechanism is asserted.

Eleven other answer records require citation-only rebinding to v2 document hashes, including the two retired stack-availability records. Those two stay retired and excluded from the runtime answer cache. No retirement is reversed. The complete packet lists every ID, before/proposed text, version, citation hash and proposed approval digest. Original versions remain in `historical-records.json` and the unchanged approved registry.

Current retrieval excludes these four historical document chunks because of superseded unknown-stack wording. A separate **draft** retirement-file proposal would remove only those source exclusions after their refreshed text is approved. Technology sources and ontology/project mappings stay unchanged; source refreshes do not reclassify project experience.

## Evaluation method and actual results

Existing schemas, `approvalHash`, text normalization, chunker, model specification, cosine/BM25/intent ranking, answer resolver, scope filtering and citation validator are reused unchanged. The staged sources and dependent answers have `status: draft`, no approval and pending source publication terms. Ordinary retrieval rejects these drafts; release validation fails as intended.

An explicit **hypothetical eligibility test fixture** uses temporary local-test approval-shaped objects in memory, marked `AUTOMATED-HYPOTHETICAL-TEST-FIXTURE-NOT-OWNER-APPROVAL`. This is the same kind of controlled eligibility fixture used by regression tests. Nothing saves those objects as approvals or runtime assets. Release validation rejects this fixture too. Its vectors and index metadata are written only under ignored `output/knowledge-v16`; it does not write immutable public indexes, `current.json`, approved API data or packages. Semantic measurements use the real pinned local MiniLM worker; no Workers AI inference occurs.

The unchanged approved release is compared with hypothetical draft eligibility under **unchanged provisional labels**. No ranking or threshold tuning, automatic-answer relaxation, verification relabeling or new publication approval was performed. New feature queries are agent-authored regressions, not independently prepared evaluation. More related candidates and changed answer-body BM25 evidence can alter existing ranks; these regressions are not hidden.

Semantic Top-1 / Top-3:

| Set | Positives | Current approved | Hypothetical drafts |
| --- | ---: | ---: | ---: |
| Original development | 100 | 80% / 98% | **72% / 99%** |
| Preserved verification | 50 | 72% / 96% | **72% / 94%** |
| Preserved v1.4 verification | 40 | 72.5% / 100% | **75% / 95%** |
| New topic paraphrases | 24 | 25% / 54.2% | **83.3% / 95.8%** |
| Requested candidate wording (indexed; not holdout) | 8 | 12.5% / 25% | **100% / 100%** |

All eight candidate wordings return their intended answer/citation in the hypothetical fixture, including the RBAC boundary answer. All 24 new paraphrases conservatively avoid automatic direct reuse; suggestions remain suggestions. The feature baseline cannot retrieve new answer IDs that do not yet exist, so these figures measure proposed topic coverage, not a like-for-like model improvement. The current approved corpus has no direct answer for the eight new wordings; it remains unchanged and does not inherit simulated gains.

Lexical Top-1 / Top-3:

| Set | Positives | Current approved | Hypothetical drafts |
| --- | ---: | ---: | ---: |
| Original development | 100 | 58% / 83% | 55% / 82% |
| Preserved verification | 50 | 62% / 78% | 64% / 80% |
| Preserved v1.4 verification | 40 | 62.5% / 80% | 57.5% / 82.5% |
| New topic paraphrases | 24 | 20.8% / 45.8% | 79.2% / 100% |
| Requested candidate wording | 8 | 12.5% / 25% | 100% / 100% |

**Regression review is required before activation:** original semantic Top-1 drops eight points; both preserved verification Top-3 scores fall, although all semantic Top-3 sets remain ≥90%. No content wording was tuned against those published suites. Owner approval of content would not certify these regressions as accepted. Full per-query output preserves every miss, candidate score, direct answer, source and retrieved document in `evaluation/reports/knowledge-v16-{semantic,lexical}-cases.json`.

All **100 existing professional critical queries plus 24 new critical queries abstain** in both modes and both variants. The new negatives cover unsupported cache/broker mechanics, exact timings, stale quote exceptions, notifications, native/offline/signature/PDF-delivery claims, HR permission internals, conflicting project attributions and synthetic injections. Zero observed incorrect automatic answers, citation failures or cross-corpus references. All 20 original technology composites pass. The unchanged implementation suite retains 80% Top-1 / 95% Top-3 on 40 positives, with all ten critical queries abstaining. Existing technology relationships are unchanged and covered by the retained unit suite; no fictional/implementation source enters the professional or portfolio package.

## Validation and integration boundary

99 RAG Node tests pass, including three new draft-approval, citation/retirement and exact-cache fixture tests. RAG syntax/static lint and TypeScript pass. The current approved release build, publication/model/license checks and index integrity checks pass independently of the staged packet. The portfolio TypeScript, package-integrity check and 122 existing tests pass. No UI or runtime retrieval code changed, so no new browser/accessibility/physical-device/screen-reader run is claimed.

`evaluation/reports/knowledge-v16-acceptance.json` records current package/bundle byte sizes, corpus versions, changed files and both-mode evaluation counts. The portfolio main JS remains below 215,000 raw bytes. Its pinned archive and lazy assistant are unchanged. The approved build is scanned to ensure that new draft answer IDs are absent; stage data cannot silently become a public cache. The local Lab and portfolio retain matching approved professional evidence. This build check is not deployment or production Cloudflare/provider verification.

## Required owner decision and later activation

Review `content/portfolio/staged-v16/REVIEW.md` together with the regression results. Approval is needed for the exact four v2 sources, all 23 affected/new answer records and alternatives/citation rebindings, source publication terms and the four source-exclusion removals. The old retired records stay retired. No simulated fixture or passing stage test grants that approval.

After explicit record-level publication approval, apply approved text/versions to canonical records through the content pipeline. The present loader assigns version 1 to tuple-based narrative records, so activation must explicitly support the reviewed v2 versions rather than silently resetting them or replacing old v1 hashes. Recompute approval/publication hashes with existing tooling, preserve the historical snapshots, regenerate scoped chunk/question vectors and immutable corpus manifests, rerun negative/citation/isolation/technology and before/after ranking checks, then package a new approved professional-only archive. Only then update the portfolio pin, checksum assets and verify lazy/model boundaries. Any revised content after review needs a fresh digest review. Deployment remains separately unauthorized.

Reproduce locally (approved model/index assets required):

```sh
node scripts/stage-professional-v16.mjs
node scripts/evaluate-knowledge-v16.mjs --simulate-reviewed-drafts
node scripts/evaluate-knowledge-v16.mjs --simulate-reviewed-drafts --semantic
npm test
npm run lint
npm run release:check
npm run index:verify
npm run build:release  # unchanged approved release only
node scripts/verify-knowledge-v16.mjs
```

There is intentionally no publish/promote command for this staged packet. Unapproved source licensing and draft status are explicit release blockers, and the simulated local-test fixture also fails publication validation.

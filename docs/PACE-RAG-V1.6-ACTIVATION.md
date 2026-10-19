# PACE-RAG v1.6 approved knowledge activation

19 October 2026. The owner explicitly approved “all the latest unapprovad records” while viewing the v1.6 review packet. [The approval receipt](../content/portfolio/v16-owner-approval.json) binds that statement to the exact review manifest, proposal and draft-record hashes. This approves the reviewed content for publication; it does not authorize deployment or certify ranking regressions as acceptable.

## Approved result

The four narrative sources (`insurance`, `education`, `rental`, `wensymes`) retain their IDs and advance to version 2. Seven answer wordings are revised, five answers are added, and eleven other answer records have citations rebound to the reviewed source versions. The two obsolete stack answers remain retired. Professional Experience now contains 18 documents and **43 eligible reviewed answers** (45 stored answer records including the two retirements). The reviewed source-exclusion removals are applied. Source publication terms permit owner-authorized display and retain copyright; they grant no reuse license.

The corpus is **`b555f3ee70c516ab`**, replacing `5172c80561642d42`. Lab corpus `cb8cf7a42d2969e4`, technology facts, ontology and provenance boundaries are unchanged. The original v1 tuples, v1.5 corpus, approvals, retirements and publication manifest remain available under `content/portfolio/history/`. The reviewed packet is frozen; staging refuses to overwrite it after approval, and the activation command refuses repeat activation.

The real content loader now supports the reviewed versioned records in `content/portfolio/reviewed-v16.json`, while preserving per-record hash checks, release approval checks, citation checks and retirement handling. Unapproved loading still fails closed. The new professional-only assistant archive is `pace-rag-portfolio-assistant-1.6.0.tgz`; the portfolio pins that archive and its generated evidence example matches the approved corpus. This release does not change the v1.5 retrieval algorithms or thresholds.

## Retrieval measurements

These are real local approved-corpus evaluations with the pinned local embedding model, not the earlier hypothetical draft simulation. Existing labels were preserved. All datasets are agent-authored, not an independent or blind evaluation. The eight requested exact questions are indexed wording and measure cache behavior, not holdout quality.

| Semantic suite | Before Top-1 / Top-3 | Approved v1.6 Top-1 / Top-3 |
| --- | --- | --- |
| 100 development positives | 80% / 98% | 72% / 99% |
| 50 verification positives | 72% / 96% | 72% / 94% |
| 40 verification positives | 72.5% / 100% | 75% / 95% |
| 24 new feature paraphrases | 25% / 54.2% | 83.3% / 95.8% |
| Eight requested exact questions | 12.5% / 25% | 100% / 100% |

The development Top-1 and both prior verification Top-3 scores regress. Content approval does not erase those limitations. No ranker tuning or relabeling was used to hide them. All 124 professional critical queries abstain in semantic and lexical runs; observed incorrect automatic answers, citation failures and cross-corpus references are zero. The 24 new paraphrases produce recommendations, not automatic generated answers. All 20 technology composites remain correct. The unchanged implementation suite remains 80% / 95% on 40 positives and abstains on all ten critical questions. Lexical before/after measurements and all individual cases are retained alongside semantic results in `evaluation/reports/knowledge-v16-approved-*.json`.

The combined retrieval/hybrid source SHA-256 remains `95423a7169c73cff33e24902f48e6bcbd77e8109ff62eb3dc9c7aa8b1ab2422c`.

## Validation

- RAG: lint, TypeScript, 100 Node tests, release build, publication/model/license checks, index integrity, release artifact verification, static packaging and professional-only package build pass.
- Portfolio: offline package installation, lint, TypeScript/build/prerender and 122 tests pass. Main JavaScript is **209,907 raw bytes**, below the unchanged **215,000** limit.
- Release artifact scan: 55 HTML files, 214 internal links, zero obsolete labels and zero stale releases.
- Local Chromium and WebKit portfolio integration checks cover lazy opening, first-custom-query model initialization, close/cancel, lexical fallback, source corruption, static/no-JavaScript routes, citations and eight largest-text viewport/theme combinations per engine.
- Local WebKit Lab checks cover seven journeys and 14 viewport/theme layouts, source corruption/stale manifests, failure handling, source fallbacks and corpus isolation. Automated axe checks report zero violations in the tested layouts. These are emulated browsers, not physical-device or screen-reader verification.
- The eight approved exact questions are checked in both local applications. Opening and exact cached-answer queries require no embedding model or inference requests.

Logs, screenshots and browser reports are in ignored `output/knowledge-v16-approved/`; final bundle measurement is in `output/performance/portfolio-budget.json`. No live inference, Cloudflare production verification, deployment, provisioning, commit or push occurred. Live generation remains disabled.

## Files changed for activation

Existing unrelated v1.3–v1.6 working changes were preserved. This activation touches:

- Content: `content/portfolio/records.mjs`, `reviewed-v16.json`, `approvals.json`, `retirements.json`, `v16-owner-approval.json`; `content/publication-review.json`; new `content/portfolio/history/v15-{corpus,approvals,retirements,publication-review}.json`.
- Pipeline and verification: `scripts/indexing/content.mjs`, `scripts/stage-professional-v16.mjs`, `scripts/activate-professional-v16.mjs`, `scripts/evaluate-approved-v16.mjs`, `scripts/static-pages.mjs`; `tests/content.test.mjs`, `tests/scope.test.mjs`, `tests/knowledge-v16.test.mjs`; four `evaluation/reports/knowledge-v16-approved-{semantic,lexical}{,-cases}.json` reports.
- Release/UI/documentation: root `package.json`, `package-lock.json`, `packages/portfolio-assistant/package.json`, `apps/rag-lab/src/main.tsx`, generated `apps/rag-api/generated/corpora.json`, `README.md`, `docs/release.md`, `integration/portfolio/README.md`, this report and the historical review's status annotation. Generated indexes, static output and package artifacts are rebuilt.
- Portfolio repository: `package.json`, `package-lock.json`, `vendor/pace-rag-portfolio-assistant-1.6.0.tgz`, `scripts/pace-rag-assets.mjs`, `src/PaceRagCaseStudy.tsx`, generated `src/data/pace-php-example.json`. Its normal build also refreshed `src/data/public-github.json` using the existing public metadata pipeline.

The historical staged report still contains pre-approval statements by design and is now labelled accordingly. The staging-only verification script and prior reports describe the earlier draft milestone; they must not be presented as current activation results. Historical release notes retain their original versions.

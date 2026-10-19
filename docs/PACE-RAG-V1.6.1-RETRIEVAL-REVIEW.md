# PACE-RAG v1.6.1 retrieval regression investigation

19 October 2026. **Partial recovery; two targets remain unmet.** This is a local candidate, not a production rollout or an independent relevance certification. All five newly approved answers and commercial facts remain intact. No approved source, answer, approval, ontology or citation digest was rewritten.

## Reproduced artifacts and frozen evaluation

The investigation started from both existing dirty working trees and preserved their unrelated work. The original v1.6 ranker is retained under `evaluation/baselines/ranking-v16/`. Only its dependency paths and diagnostic trace length differ from the captured runtime; scores and ordering are identical. `freeze.json` records the original runtime and evaluation-input hashes. Tests and the comparison command reject changes to the frozen datasets, scoring script and approved content. Baseline reproduction asserts every metric against the existing v1.6 activation reports, not just rounded percentages.

Both versions use the pinned MiniLM specification. v1.5 corpus `5172c80561642d42` is read from its preserved immutable artifacts; v1.6 corpus `b555f3ee70c516ab` retains 43 eligible answers. Every index file is verified against its manifest before evaluation, and embedding specifications must match. Query vectors are the same local MiniLM vectors used for the previous comparison; missing vectors can be rebuilt with the pinned local model. No Cloudflare/model API calls or mocked semantic vectors are used for measured retrieval. Controlled equal vectors are used only in explicitly labelled unit tests.

| Frozen semantic dataset | Reproduced v1.5 | Reproduced v1.6 | v1.6.1 | Recovery targets |
| --- | --- | --- | --- | --- |
| Original 100 | 80% / 98% | 72% / 99% | **76% / 99%** | 80% / 98%: Top-1 unmet |
| Preserved 50 | 72% / 96% | 72% / 94% | **76% / 94%** | 72% / 96%: Top-3 unmet |
| Preserved 40 | 72.5% / 100% | 75% / 95% | **75% / 100%** | Both met |
| New-topic 24 paraphrases | 25% / 54.2% | 83.3% / 95.8% | **83.3% / 95.8%** | Retained coverage |
| Eight requested exact examples | 12.5% / 25% | 100% / 100% | **100% / 100%** | Indexed cache wording, not holdout |

Values are Top-1 / Top-3. These datasets and labels are agent-authored and have been inspected throughout the investigation. They are regression feedback, not independent validation or unseen holdouts. No labels, expected-answer IDs or scoring definitions were changed. No fresh external holdout was available.

## Paired diagnosis

Across the three original sets, **30 questions changed expected-answer rank after the knowledge refresh: 22 worsened and eight improved**. Every worsened expected answer remains eligible: zero disappearance/index-ownership failures were found. The machine-readable [semantic paired report](../evaluation/reports/v161-semantic-paired.json) records every changed question, each expected answer's exact rank, Top-5 candidates with stable IDs and source/project citations, raw semantic and BM25 scores, their weighted contributions, intent adjustment, final score, newly introduced competitors and corrected ranks. All questions' outcomes are also retained. The [lexical report](../evaluation/reports/v161-lexical-paired.json) separately records fallback behavior.

The 22 worsened cases have these overlapping diagnostic flags; counts are not an exclusive causal partition:

| Mechanism / evidence | Affected questions |
| --- | ---: |
| A newly introduced answer moved ahead of the expected answer | 8 |
| Winner's lower semantic score was overcome by its larger BM25 contribution | 9 |
| Winner had greater question-vector similarity than the expected answer | 13 |
| Winner received a greater intent adjustment than the expected answer | 1 |
| Winner and expected answer had disjoint cited source documents | 6 |
| Winner and expected answer shared a cited source document | 16 |
| Expected answer disappeared through indexing or eligibility failure | 0 |

The corpus refresh changed more than candidate count. Revised longer answer bodies changed term frequency, length normalization and corpus IDF. Per-query maximum-BM25 normalization also changes all candidates' lexical scale when the best body match changes. This explains movement even for unrelated, unchanged legacy records. For example, the WenSymes remit question had greater cosine for the expected work summary, but a comparison answer won through BM25; the original general problem-solving question additionally received an inappropriate “what is” overview bonus on a different project.

Some collisions are legitimate topic overlap: education workflow examples compete with education modernization/disclosure summaries, rental lifecycle/reporting with the broader rental scope, and the new event-driven design answer with a general architectural-discussion answer. These are distinct approved answers sharing evidence, not duplicate record IDs. No record was removed or merged to improve ranking. Broad questions about planning, evidence boundaries or architectural discussions do not always specify a project or facet; raw similarity cannot establish which approved answer is equivalent. Such results remain suggestions, and frozen expected IDs are retained even where multiple candidates seem plausible.

## Minimal correction and rejected approaches

The retained correction changes only bounded intent matching and deterministic tie handling:

1. Remove generic `what is` / `tell me about` triggers from overview intent. Explicit overview/introduction wording still works. An ordinary interrogative no longer gives every “what is … about” record an overview boost.
2. Stop treating plain `income` or `earnings` as a request for measured business improvement. Explicit revenue/result/gain intent remains; property income/expense records need not imply uplift.
3. Apply a **−0.025** adjustment per unmatched specialized question facet: comparison, lifecycle/validity rules, platform inventory, measured results, event-driven design, or security/access. Only the canonical question determines specialization. Total intent adjustment retains the existing **−0.10 to +0.16** bounds. These are generic concept patterns; there are no answer-ID boosts, query allowlists, per-question exceptions or candidate removals.
4. Break equal answer scores by code-unit stable answer ID and equal variant scores by question ID, rather than corpus row order. Keep all eligible records, original vector-row ownership and the Top-3 suggestion limit.
5. Version the semantic reuse policy as `answer-precision-v161`; stale v1.5 calibration cannot authorize reuse. No new calibration or automatic semantic reuse is enabled.

The 0.8 cosine / 0.2 body-BM25 blend, embedding model, vector indexes, lexical fallback scores, candidate eligibility, exact-answer authorization and source validation are unchanged. Model initialization still occurs only for the first custom semantic query.

Two question-field BM25 trials were rejected. A 70% question / 30% body lexical mix yielded 65%/91%, 70%/94%, 70%/95%; a smaller 15%/85% mix yielded 72%/98%, 70%/96%, 70%/97.5%. Both harmed legacy coverage. They are not part of the runtime. No further score search or benchmark-specific overrides were used to force recovery. The remaining BM25 normalization and semantic ambiguity limitations are explicitly unresolved.

## Safety, coverage and release safeguards

All **124 professional critical queries abstain** in semantic and lexical runs, with **zero observed incorrect automatic answers, invalid citation references or cross-corpus references**. All 20 existing technology compositions remain correct. The unchanged Lab implementation suite remains 80% / 95% on 40 positives; all ten critical questions abstain. Five new canonical answers, their alternatives and all eight requested examples remain reviewed cache answers. All 43 eligible legacy/new canonical questions remain discoverable in unit checks. Tests also reject altered or foreign citations.

Lexical results are unchanged from v1.6: Original 100 **55% / 82%**, Preserved 50 **64% / 80%**, Preserved 40 **57.5% / 82.5%**, new-topic 24 **79.2% / 100%**, exact eight **100% / 100%**. Lexical/static fallbacks and conservative abstention are preserved.

`npm run ranking:diff` and `npm run ranking:diff -- --lexical` produce the paired reports. They verify the frozen inputs and reproduce the old baselines before evaluating the current ranker. The comparison can recover v1.5 assets from the retained portfolio archive if its local baseline directory is absent (`PACE_V15_ARCHIVE` can specify that archive). Local model/index assets are prerequisites; this command never downloads a different model or changes approval status.

Publication and release packaging checks now require explicit paired semantic and lexical reports matching the approved content fingerprint, current ranker hash, evaluation freeze and active corpus pointer. Changed knowledge or stale reports fail closed. A future corpus refresh must stage and review a new comparison epoch with preserved prior immutable artifacts; do not rewrite this historical freeze or expected labels just to clear the check. The freshness/safety check records that comparison occurred; **it does not assert all recovery targets passed**. The remaining Original-100 Top-1 and Preserved-50 Top-3 targets block any claim of completed regression recovery. No production release or deployment is authorized here.

## Verification and files

RAG lint/TypeScript, 108 Node tests, content validation, release/model/license checks, actual index/hash verification, technology evaluation, production build and candidate static/assistant packaging are run locally. Portfolio lint/TypeScript, 122 tests, production prerender and package checks validate the matching 1.6.1 candidate archive. Browser integration checks cover cached answers, first-custom-query model loading, failure/lexical/static fallbacks, citations and corpus isolation; tested viewport/theme layouts retain their design and automated accessibility checks. Exact final measurements and release blockers are recorded in `evaluation/reports/v161-acceptance.json`; logs and browser artifacts are under `output/retrieval-v161/` and `output/playwright/v161/`.

Activation leaves approved corpus `b555f3ee70c516ab` and Lab `cb8cf7a42d2969e4` unchanged. No commit, push, deployment, resource provisioning or live generative inference occurred. Automated browser checks are local emulation, not physical devices, actual screen-reader verification or deployed Cloudflare verification.

Files changed for this investigation, in addition to preserved earlier working changes:

- Runtime: `packages/semantic-core/src/hybrid.mjs`, `packages/semantic-core/src/retrieval.mjs`.
- Audit/safeguards: `evaluation/baselines/ranking-v16/{freeze.json,hybrid.mjs,retrieval.mjs}`, `scripts/ranking-diff.mjs`, `scripts/ranking-review-check.mjs`, `scripts/publication-check.mjs`, `scripts/package-static.mjs`, `scripts/package-portfolio.mjs`, `tests/ranking-v161.test.mjs`, `evaluation/reports/v161-{semantic-paired,lexical-paired,acceptance}.json`.
- Release/docs: `package.json`, `package-lock.json`, `packages/portfolio-assistant/package.json`, `apps/rag-lab/src/main.tsx`, `scripts/static-pages.mjs`, `README.md`, `docs/release.md`, `integration/portfolio/README.md`, this review. Technology evaluation regenerates its existing report timestamps; historical retrieval measurements remain unchanged.
- Portfolio: `package.json`, `package-lock.json`, `vendor/pace-rag-portfolio-assistant-1.6.1.tgz`, `scripts/pace-rag-assets.mjs`, `src/PaceRagCaseStudy.tsx`, generated `src/data/pace-php-example.json`. The normal build can refresh `src/data/public-github.json` through its existing metadata pipeline. Generated managed assets and build outputs are rebuilt without changing routes or design.

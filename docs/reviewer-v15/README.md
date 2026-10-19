# PACE v1.5 reviewer packet

Status: prepared by an agent; independent evaluation and real-user testing have **not** occurred. The 60 randomized questions are sampled from already inspected regression suites, not a fresh holdout. Provisional expected labels are deliberately concealed in the blind materials, not protected by access controls. Give participants only `blind/` and blank forms. Keep `adjudication/` with a separate adjudicator until the first pass is recorded.

## Independent holdout preparation

A reviewer who did not tune or inspect the ranking rules should author at least 40 new, unambiguous supported questions and 20 unsupported/critical requests. Do not read the published evaluation questions before writing them. Use the approved evidence library to establish scope, not the ranker's outputs. Record preparer identity/pseudonym, relationship, date and an honest attestation in `holdout.template.json`; use a separate working copy. Do not submit sensitive information.

Each question needs a unique `id` and `question`. Supported rows need `relevantAnswerIds` (an array of approved IDs, allowing multiple equally valid answers), source references and an adjudication rationale. Unsupported rows use `expect: "insufficient-evidence"`. IDs and source evidence are available in `adjudication/evidence.json` to the label adjudicator. Two reviewers should label independently, resolve ambiguity with source evidence, and record disputes in `forms/disagreements.csv`. A broad question that supports several answers needs multiple accepted labels, or should be rewritten **before** execution. Do not silently change the published regression labels.

Freeze and hash the holdout before running the model. Keep its labels out of ranking development. Once the implementation author sees outcomes, the set is a regression set, not a reusable blind certification. The runner rejects exact overlap with known questions and indexed aliases; exact disjointness does not establish conceptual independence. Supplied preparation claims are recorded, not independently verified by the runner.

From the repository root:

```sh
node scripts/review-v15.mjs run /absolute/path/to/completed-holdout.json
node scripts/review-v15.mjs aggregate docs/reviewer-v15
```

The first command executes real local MiniLM semantic retrieval, using cached embeddings where the complete embedding specification and exact questions match. No Workers AI inference is involved. Reports are `evaluation/reports/v15-external-precision-semantic{,-cases}.json`; all missed questions, ranking components, abstention and citation checks are retained. Run once against the frozen implementation before examining results. Use `--prior` on `scripts/evaluate-v15.mjs` for the preserved v1.4 comparison. The pending independent target is ≥80% Top-1 and ≥90% Top-3, with zero critical wrong answers, citation failures or cross-corpus references. Missing criteria are failures or pending work, never rounded up.

## Blind regression review

1. Give the reviewer `blind/questions.csv` in its generated order. Search Professional Experience. Record the first suggestion, whether any factual answer was shown, and the reviewer's own interpretation before revealing expected labels. Do not coach them toward a particular answer.
2. After first-pass judgments are saved, let an adjudicator compare `adjudication/key.json` with the full approved evidence catalogue. Links and hashes are in `adjudication/evidence.json`; source snapshots remain in the packaged `/pace-rag/knowledge/professional/` library. Rank position alone is not evidence of truth.
3. Fill `forms/label-review.csv`: judgment is `agree`, `disagree`, `ambiguous` or `unsupported`; provide reviewer, reason, proposed approved IDs and supporting sources. Record every disagreement and resolution separately. This never modifies content approvals or cache records.

## Usability sessions

Recruit independently from the implementation author for each persona. Give `blind/usability-tasks.csv` without demonstrating the answers first. Keep `adjudication/usability-criteria.csv` with the moderator until attempts are recorded; record actual time, actions, outcome and an observation in `forms/usability.csv`. Use `reviewer_type: human-independent`, `human-involved` or `agent` honestly. The direct fictional-source link supports two total actions: choose Fictional Test Documents, then Inspect a fictional source document. Count source selection in the total.

Use `passed`, `failed` or `blocked` only after a real attempt, including a session ID and observation. Leave unattempted rows blank. Report devices, viewport, browser, assistive technology and any help given in the report. Automated axe/native semantics checks are not actual screen-reader testing. Agent browser checks are not recruiter/client/user sessions.

## Reporting and reproducibility

Complete `REVIEW-REPORT.md` with real findings. Aggregation reports blank rows as unperformed and a null success rate when nothing ran. It preserves disagreements and self-reported reviewer categories without certifying identity or independence. It never promotes labels or generated answers to the approved cache.

`node scripts/review-v15.mjs prepare <new-empty-directory>` creates a fresh copy of the blank packet. Do not regenerate into a directory containing real reviewer findings; generation refuses to overwrite an existing packet. Keep raw forms with the report and name the corpus, software version and frozen question hash.

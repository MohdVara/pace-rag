# EFRD evaluation methodology

19 October 2026. Run `npm run eval:retrieval -- --semantic` after `model:prepare` and `index:build`; `npm run eval:retrieval` measures the lexical fallback with the same cases. No paid embedding service or remote generation is used.

## Dataset and independence

`evaluation/efrd-heldout.mjs` is a fixed, readable dataset, version `efrd-heldout-v1`. It contains 100 portfolio paraphrases, 40 actual-implementation questions, 20 structured technology scenarios, 60 portfolio critical questions and 10 Lab critical questions. Two separate calibration proposals are never used to enable an automatic threshold. The previous templated evaluation remains available via `npm run eval:legacy`; it is not the current evidence of independent-wording retrieval quality.

New positive questions are not prefixes added to canonical questions. Node checks reject normalized overlap with indexed canonical/alternative wording and calibration cases. Portfolio and Lab evaluation run against distinct manifests; no fictional source can substantiate professional employment. Implementation-documentation questions are distinguished from the Lab's synthetic Atlas examples. The 20 existing grounded-generation scenarios remain unexecuted against a live provider, because generation is disabled. Local citation fixtures are not claim-entailment evaluation.

All new questions and labels were agent-authored. They are distinct from indexed questions but not independently owner-reviewed. The dataset was inspected during development to diagnose overly broad structured-fact rules, so it is not a blind final certification. Safety regressions retain the discovered wrong-match cases. The initial evaluation/report is preserved under ignored `output/efrd/first-independent-*`; it observed three role/platform questions incorrectly collapsed into technology summaries. Current bounded grammar abstains on those cases.

No score/threshold was calibrated from this set. Arbitrary semantic automatic answers remain disabled; exact reviewed wording, explicit user selection and bounded technology rules are the direct-answer paths. Future semantic automation requires independent labels, a real calibration split/policy decision and new held-out acceptance evidence rather than tuning cosine to these cases.

## Metrics and denominators

- **Top-1 approved-answer ranking accuracy:** first ranked answer ID is in the labelled relevant set, divided by positive paraphrase count. It is ranking accuracy, not automatic answer coverage.
- **Top-3 candidate recall:** any of three candidate IDs is in the labelled relevant set, divided by positives. A canonical registry entry is a single label even when another nearby answer is thematically useful; overlapping HR and failure-handling questions can lower this strict score.
- **Appropriate abstention:** critical queries with no direct answer, divided by critical count. Suggestions/passages are not counted as factual answers.
- **Incorrect automatic answer:** a direct answer with an unapproved labelled answer/fact relationship on positive/composite cases, or any direct answer on the critical abstention suite. It is reported separately from relevance and coverage.
- **Composite correctness/coverage:** actual used-fact IDs equal the expected set and sources pass the shared contract. Legacy generation text and historical notes are separately regression-tested.
- **Citation integrity:** contract validation checks corpus, current source, URL, version/hash and word/citation bounds. This is source membership/integrity, not entailment.
- **Corpus isolation:** count foreign source/passages. Dedicated fixture injection and fixed API boundary tests provide separate evidence.
- **Direct-answer coverage:** direct answers over positive paraphrases plus composite cases. Abstaining safely can still leave poor coverage; those are different outcomes.
- **Latency:** local ranking/adapter time p50/p95. It excludes model initialization and query embedding, which the browser suite measures separately.
- **Inference calls/fallback:** pure evaluation has no provider call path. Browser context request observations and isolated-failure results are separately recorded. No provider billing ledger is inferred from an HTTP request count.

## Reproducible artifacts

Machine-readable reports and every labelled query/actual candidate result:

- `evaluation/reports/efrd-semantic-v1.json`
- `evaluation/reports/efrd-semantic-cases-v1.json`
- `evaluation/reports/efrd-lexical-v1.json`
- `evaluation/reports/efrd-lexical-cases-v1.json`
- JSONL datasets under `evaluation/datasets/efrd-*-heldout-v1.jsonl`

Each summary records sample sizes, dataset SHA-256, source-code digest, software marker, corpus version, model execution environment and timestamp. UTC timestamps correspond to 19 October 2026 in Asia/Kuching. The public local-package `/pace-rag/evaluation.html` links the actual versioned reports; it does not substitute targets for observations.

Targets are Top-3 >=90%, zero observed critical wrong answers, zero invalid references, zero foreign references and mandatory fallback success. The ranking target is not met in the current strict independent-wording suite. Publication/release acceptance remains false. Final exact results, browser/fallback observations and measured resource distributions are in [QA/results](PACE-RAG-EFRD-QA.md).

## Interpretation

The system currently favors a constrained direct answer and explicit question selection over permissive uncalibrated semantic reuse. This prevents observed confident wrong answers in the defined critical suite but does not prove reliability on arbitrary language. It also means many common paraphrases still show suggestions rather than immediate reviewed answers. Improving independently reviewed alias coverage, reducing overlapping intents and measuring retriever changes are remaining quality work. No production, physical-device, statistical-guarantee or real generated-grounding claim follows from this local evaluation.

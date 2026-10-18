# EFRD measured results

19 October 2026 (Asia/Kuching). This is a local implementation/verification result, not production or publication acceptance. Full scope and commands: [QA](PACE-RAG-EFRD-QA.md).

| Corpus | Held-out positives | Top-1 ranking | Top-3 recall | Critical abstention | Incorrect automatic answers | Direct answer coverage |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| portfolio | 100 | 57.0% | 79.0% | 100.0% (60) | 0 | 16.7% |
| lab | 40 | 55.0% | 87.5% | 100.0% (10) | 0 | 0.0% |

Top-3 target: 90%, **not met for either corpus**. The 20 structured scenarios produce the expected approved fact sets with no invalid references. Source membership/integrity is not a claim-entailment guarantee. All 70 critical cases abstain; new natural-language coverage remains limited because semantic automatic answer reuse is deliberately disabled. Exact canonical/reviewed-alternative cache behavior is separately covered by unit and browser tests.

Lexical Top-3 recall is 55.0% portfolio / 55.0% Lab. Zero invalid citation or cross-corpus references were observed in either evaluation mode.

Labels are agent-authored and unreviewed; the set was inspected during development and is not a blind certification. The first run found three overly broad structured-template answers; bounded grammar and regression checks now abstain on those cases. No cosine cutoff was calibrated or enabled.

Reports: [semantic](../evaluation/reports/efrd-semantic-v1.json), [per-question results](../evaluation/reports/efrd-semantic-cases-v1.json), [lexical](../evaluation/reports/efrd-lexical-v1.json), [local browser/resource/bundle evidence](../evaluation/reports/efrd-local-verification-v1.json).

**Verified locally:** exact cache, deterministic technology composition, real model ranking, separate supporting evidence, inspectable traces, lexical/static fallback, source/version integrity, cancellation, corpus isolation and zero provider requests in cache/browser journeys.

**Simulated/mocked:** provider/Turnstile responses, quota/provider educational demonstrations, deliberately incompatible or inert worker fixtures, induced source/corpus faults. These do not verify Cloudflare production.

**Unverified/blocked:** live provider grounding and accounting, deployed DO/Turnstile behavior, public publication approvals, physical-device memory and screen-reader sessions. All live/accounting switches remain false. Portfolio integration is staged, not installed.

Release remains **not accepted** pending independent content/label review, retrieval-quality improvements and separately authorized integration/provider work. No production resources were provisioned or deployed.

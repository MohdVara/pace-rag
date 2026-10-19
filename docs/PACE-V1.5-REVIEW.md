# PACE-RAG v1.5 retrieval precision and final UX

> Hostnames in this historical review were normalized to the current public domain on 19 October 2026. Test results describe the original validation run, not a new check of the renamed host.

19 October 2026, Asia/Kuching. Both working trees were audited before editing; existing uncommitted v1.3/v1.4 work, approved registries and design were preserved. No commit, push, deployment, DNS change, provisioning or hosted inference was performed. Existing owner-owned local servers remain running. Publication approval is unchanged for professional corpus `5172c80561642d42`, Lab corpus `cb8cf7a42d2969e4` and technology evidence `pace-technology-v1.2`.

## Ranking evidence and limits

The actual incoming v1.4 ranker is retained in `evaluation/baselines/v15-prior-{retrieval,hybrid}.mjs`. Only the original 100-question development traces informed changes. Increasing semantic weight and adding lexical question-field weight reduced development precision; canonical/mean question-vector combinations offered no improvement and were discarded. No model, approved answer/paraphrase, technology entity, project relationship or expected label was changed.

The retained professional formula is still 80% best reviewed-question cosine + 20% normalized answer-body BM25 + a canonical-intent adjustment bounded to −0.10…+0.16. Minimal generic intent corrections narrow overview wording, exclude résumé/CV document navigation from career-summary intent, recognize lead/leading alongside leadership, and cover ordinary income/earnings and contact-booking language. There are no query/answer-ID allowlists. Corrections improved the development leadership and rental-impact cases without a previously correct Top-1 becoming wrong in any measured set. Question variants still collapse to a single candidate per approved answer ID; overlapping but distinct approved records are preserved for label adjudication, rather than merged to manipulate scoring.

Ranking was frozen before the two regression sets were rerun. No verification-specific tuning followed. Old calibration cannot authorize the versioned v1.5 ranker. Exact reviewed wording and supported deterministic technology composition remain the only automatic factual answer paths; similarity is not a probability or authorization to answer.

| Previously inspected set | Positives | v1.4 Top-1 / Top-3 | v1.5 Top-1 / Top-3 |
| --- | ---: | ---: | ---: |
| Original development | 100 | 78% / 98% | **80% / 98%** |
| Preserved verification | 50 | 72% / 96% | **72% / 96%** |
| Preserved v1.4 verification | 40 | 72.5% / 100% | **72.5% / 100%** |

These labels are agent-authored and provisional. **The fresh independently prepared ≥80% Top-1 / ≥90% Top-3 target remains unverified.** No independently prepared holdout was supplied, and an agent-created packet does not establish independence. Existing labels were not rewritten, even where a more specific approved answer appears to address a broad query better. The packet supports multi-answer labels and source-backed disagreement resolution before an external holdout is frozen.

All **100 distinct professional critical questions** abstain; the implementation view's ten reused critical questions also abstain. There are zero observed incorrect automatic answers, invalid citations or cross-corpus references. All 20 original composites and 140 technology-understanding cases pass. Remaining Top-1 misses are 20/100, 14/50 and 11/40, recorded individually in `evaluation/reports/v15-missed-queries.json` and the complete per-question reports, including candidate traces. The 40-question lexical fallback remains 62.5% Top-1 / 80% Top-3, with all 20 critical queries abstaining. It is a working fallback, not a claim of matching semantic quality.

## Search clarity and worked example

Near the input, the assistant explains: “Search reviewed answers and evidence. Custom questions may return suggested reviewed questions instead of an automatic answer.” The textarea references this explanation with `aria-describedby`. Result articles have explicit accessible names and visible labels: Direct reviewed answer, Structured technology answer or Insufficient evidence. Border treatments distinguish these states without relying on color. Suggested related questions have their own named region explaining they are not answers to the original question; selecting one changes the displayed question to that reviewed wording.

The three source views, 3–4 starters, initially closed catalogue/settings/diagnostics, and answer → sources → optional inspection hierarchy remain. Fictional labels appear before search. A direct “Inspect a fictional source document” link makes the full Atlas example reachable within two total actions from the default view, including source selection. The full library remains separately available. Purpose, bundled-literal origin, repository file and owner-confirmed human authorship with AI assistance remain visible. Similarly ranked passages are still explicitly separated from supporting citations. Simulated failures remain labelled simulations.

`scripts/worked-example.mjs` executes the real professional resolver and citation validator against publication-approved content. It generates `examples/php-frameworks.json`, which is included in the checksummed assistant package. The portfolio asset gate verifies matching corpus/package versions and generates the lazy case study's JSON input. The example shows PHP web frameworks → Symfony/Laravel → Rental/Symfony, Education modern generation/Laravel and WenSymes/Laravel, followed by the actual composed text and three supporting citations. It records zero Workers AI calls from that pure local execution and explicitly identifies itself as a build-time example, not a fabricated production trace. Browser tests independently execute the same question with no model or generation request.

## Local and currently hosted sites

Development and production links are tested separately. Local portfolio → case study → Lab → local case study works. The running portfolio development server initially served a stale optimized assistant; a normal Vite config reload refreshed it without terminating the owner-owned process. Both engines then verified the v1.5 input helper and no eager model fetch in development as well as production-preview behavior. Local production artifacts use the existing `pace-rag.paramasvara.online` and portfolio canonical URLs with `/pace-rag/` paths. Production HTML, JS, JSON, CSS, XML and text assets are scanned for loopback URLs, including packaged knowledge pages. Static source routes and package links are verified. The case-study route has its own title, description, canonical, Open Graph title/description/URL and sitemap entry; the existing shared social image remains valid.

Read-only HTTPS checks of **42 currently hosted URLs** record 41 successful responses and the case-study route's **404**. Approved citation URLs/source pages and checked portfolio anchors resolve. A real read-only browser session observed the hosted Lab still rendering **PACE-RAG v1.3 · local review** and **Local test preview · publication not approved**; its portfolio return link navigated successfully. That older hosted build is distinct from the locally publication-approved v1.5 package. The hosted v1.5 case study and full new cross-site round trip cannot be claimed working until an explicitly approved deployment. No DNS or remote content was changed. Evidence is in `evaluation/reports/v15-hosted-links.json`.

## Independent-review packet and automation

`docs/reviewer-v15/README.md` is the handoff. It includes 60 randomized previously inspected questions with expected labels concealed in the blind files, a separate provisional key and approved source-evidence catalogue, label-review/disagreement forms, nine recruiter/engineering-manager/client tasks, moderator-only measurable criteria, a blank independent-holdout schema and a real-findings report template. The blind materials are presentation separation, not secure access controls; distribute only the intended files.

`node scripts/review-v15.mjs aggregate` aggregates actual filled forms; blanks remain unperformed and yield a null success rate. Reviewer/session categories are recorded without certifying identity or independence. Duplicate observations and invalid rows are rejected. Preparation refuses to overwrite a nonempty packet. `node scripts/review-v15.mjs run /path/holdout.json` executes real local semantic retrieval, rejects exact known-question/alias overlap and records declared preparation provenance, never independently verifying it. No label or generated answer is promoted to the cache.

Current findings correctly report **zero label reviews, zero usability attempts, no independent review and no real-user testing**. An owner-selected independent preparer and real participants are the remaining actions. Do not retune against a purported final holdout after viewing its outcomes.

## Validation and performance

96 RAG and 117 portfolio Node tests pass, along with TypeScript, RAG syntax/static lint, portfolio ESLint, release builds, approval/integrity checks and all 140 technology cases. Chromium and WebKit exercise actual semantic loading, cache and ontology zero-model paths, worker failure/lexical fallback, source switching, fictional origin, supporting-versus-topical evidence, lazy integrated assistant and link navigation. Largest/light/dark/reduced-motion case-study layouts cover 320/390/768/1440; Lab and assistant layout matrices remain active. Automated axe/native keyboard semantics are not an actual screen-reader session; physical devices and production Cloudflare/provider accounting were not tested.

Main portfolio JavaScript remains **209,844 / 215,000 raw bytes**, with **5,156 bytes headroom** and no increase from v1.4. Assistant, case study and MiniLM remain lazy; custom semantic queries alone initialize the model. Detailed raw/gzip sizes, test counts, browser observations, metadata, hosted failures and packet status are recorded in `evaluation/reports/v15-acceptance.json`. Changed-since-audit files are listed in `docs/PACE-V1.5-FILES.json`.

Known pinned dependency/security limitations from earlier reviews remain. Successful local tests do not certify enterprise security, production readiness, claim entailment or provider billing. Deployment remains a separate owner decision.

Reproduction (approved model/index assets required):

```sh
npm test
npm run lint
npm run eval:v15 -- --semantic
npm run eval:v15 -- --semantic --verification
npm run eval:v15 -- --semantic --fresh  # previously inspected v1.4 set
# Add --prior for the preserved v1.4 ranker; no labels change.
npm run eval:technology
npm run build:release
npm run package:static -- --release
npm run release:artifact-check
node scripts/static-v15-qa.mjs
node scripts/links-v15-qa.mjs
node scripts/acceptance-v15.mjs
```

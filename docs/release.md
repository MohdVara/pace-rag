# Release and rollback

The owner explicitly approved the current v1.3 content for publication on 19 October 2026 and requested preparation of the portfolio integration. **No deployment or automatic publishing is authorized.**

## Current approvals

`content/{portfolio,lab}/approvals.json` bind each current record to its exact hash, version, reviewer, approval time and publication scope. `content/publication-review.json` records the instruction and binds the complete record sets and supporting content/ontology files. The two obsolete portfolio answers remain retired. Technology sources use the same approval registry; the importer cannot manufacture a publication approval.

Public display permission does not grant an open-source or CC-BY reuse license. Owner copyright is retained. The pinned model and Transformers.js use Apache-2.0; ONNX Runtime uses MIT. The preparation checks verify model/runtime assets and packaged notices. Confidential professional claims, source hashes, expiry, canonical URL restrictions and corpus boundaries remain enforced.

`npm run release:check` is read-only: it rejects changed hashes, missing/extra records, absent publication scope, expired approvals, pending license wording, corrupt model assets and missing notices. Routine builds and CI never renew approvals. New content requires a new explicit review; do not refresh hashes just to make a failing gate pass.

## Prepare locally

```sh
npm run release:check
npm run build:release
npm run index:verify
npm test
npm run eval:retrieval -- --scoped
npm run eval:retrieval -- --scoped --semantic
npm run eval:technology
npm run package:static -- --release
npm run package:portfolio
npm pack --workspace @pace-rag/portfolio-assistant --pack-destination output
```

Run browser QA on the exact packaged Lab and portfolio build, then verify the 215,000-byte raw main JavaScript budget. See [the current release report](PACE-RAG-V1.3-PUBLIC-RELEASE.md) for actual results, including the unmet professional retrieval target. Content publication acceptance is distinct from ranking targets, independently reviewed labels and production verification. Do not claim those gates passed.

`npm run build` still makes a preview; use the explicit release build for publication artifacts. The Lab shows “Public demo” only after loading and validating a non-preview release. Failure examples remain simulated and fictional sources remain labelled.

## Portfolio package

The original v1.3 release installed the pinned local v1.3.1 archive with its matching professional-only assets. Its asset copier validates every checksum, the release/version/pointer, publication scope and corpus boundary before replacing managed generated files. The static professional library works without JavaScript. `VITE_PACE_RAG_ENABLED=false` removes the integration and generated assets for rollback. No automatic deployment job was added.

## Security and remaining gates

Live AI, provider accounting and the guarded Worker remain disabled. Publication approval does not verify a deployed provider, budgets, billing, confidential enterprise authorization, physical devices or screen readers. Existing development dependency audit findings are documented in the release report; they are not silently fixed through a major model/runtime migration.

## Rollback

Restore the complete previous approved static package and matching assistant archive; never mix vectors or manifests between releases. Disable the portfolio integration with `VITE_PACE_RAG_ENABLED=false` if needed. Keep all live switches false. This preparation does not provision Vectorize, D1, R2, Durable Objects or paid services, and it does not alter existing portfolio routes or ASCII scenery.


Historical v1.6 knowledge activation: the owner approved all latest staged professional records on 19 October 2026. The package is 1.6.0; the v1.5 ranker is unchanged. See [activation report](PACE-RAG-V1.6-ACTIVATION.md) for the exact corpus, package checks and recorded ranking regressions. No deployment is authorized by content approval.

Current local candidate: **1.6.1**, with unchanged v1.6 approved content and a partial retrieval correction. Original-100 Top-1 and Preserved-50 Top-3 recovery targets remain unmet. See [paired investigation and release limitations](PACE-RAG-V1.6.1-RETRIEVAL-REVIEW.md). Run both `npm run ranking:diff` and `npm run ranking:diff -- --lexical` before release checks; changed content/ranking now invalidates the comparison guard. No deployment is authorized.

Current hostname patch: **1.6.2** rebuilds static library navigation for `https://pace-rag.paramasvara.online/`. Approved knowledge, ranking rules and evaluation measurements are unchanged. See [hostname patch notes](PACE-RAG-V1.6.2-HOSTNAME.md).

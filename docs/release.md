# Release and rollback

No release, provisioning or deployment is authorized by running local build commands.

## Content approval

1. Review each source snapshot against current permitted public wording, confidentiality boundaries, canonical links and expiry.
2. Review every answer and alternative for claim equivalence and citation support.
3. `npm run build` emits `output/{corpus}-approval-candidates.json`. These contain exact approval hashes, not approvals.
4. Only after explicit owner approval, copy approved entries to `content/{corpus}/approvals.json`, supply the actual reviewer and ISO approval time, and preserve the exact content hash. Do not use `OWNER_REVIEW_REQUIRED` as a reviewer.
5. Rebuild and run `npm run release:check`. Changing source text invalidates document and dependent-answer approvals. Changing only status never creates approval.
6. Run all evaluation/browser/performance gates and record reviewed results. Templated datasets alone do not establish acceptance.

`npm run build` creates a clearly labelled draft preview. `npm run build:release` runs the approval gate, builds the pinned worker, generates approved semantic indexes and builds both frontend artifacts. Keep approved static output and API evidence versions aligned. Do not publish preview output. Review the proposed content licenses before recording approvals; replace pending-license wording with the chosen publication terms before hashing the approved records.

## Staging

Static no-AI preview → deterministic API preview → opt-in provider validation → approved Lab release → portfolio preview → separately authorized production portfolio release. Infrastructure work is gated after standalone retrieval and cache recommendation validation. Existing API scaffolding is disabled and its mocked tests do not establish Cloudflare behavior. Check the actual hosting workflow first. Do not provision Vectorize, D1, R2 or paid billing for this release.

## Portfolio packaging

The portfolio currently has no PACE-RAG adapter or dependency. The previous integration is staged under `integration/portfolio/`; review its README and rebuild the package before applying it after approval.

The package and public assets are pinned together. The assistant library uses peer React and a hashed worker. Copy assets before the portfolio build; never load executable code from a moving external URL. Default production builds omit the review launcher. `VITE_PACE_RAG_PREVIEW=true` enables local review only, with draft labels intact.

## Rollback

Disable live switches; restore the complete previous approved API and static release; keep the existing DO namespace and spending state; revalidate all direct routes, case fragments, knowledge pages and actual 404 behavior. Remove the assistant launcher independently if performance fails. Gameplay and forest code are outside this change.

## Test-only approvals

The current populated application uses explicit `local-test` approval entries, authorized for testing on 18 October 2026. `node scripts/approve-test-content.mjs` renews only that scope after a deliberate content review; normal builds never run it. These records exercise exact cached answers locally, but `release:check`, release packaging and live server evidence reject them. The testing authorization does not grant publication or source licensing approval. See [deployment instructions](DEPLOYMENT.md) and [test questions](TESTING.md).

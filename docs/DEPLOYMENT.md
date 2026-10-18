# Run and deploy PACE-RAG

The current application is a populated standalone test app: 38 current portfolio answers, 20 synthetic engineering answers and 20 actual-implementation answers, with 42 source records including the imported technology inventory. Two obsolete stack answers remain in the editorial registry but are excluded from public artifacts. All current approval entries are scoped `local-test`, following the owner's 18 October 2026 request to test the application. This scope allows exact cached-answer behavior locally; it does not claim owner review for public publication. Live AI remains disabled.

## Test it now

From the existing checkout:

```sh
cd /Users/mohd.vara/Projects/Personal/pace-rag
npm run dev
```

Open **http://127.0.0.1:5180/pace-rag/**. Use the corpus buttons to switch between synthetic engineering and portfolio questions. No Cloudflare account, API key, Turnstile or AI allowance is needed. Opening the app and cached starters does not load the model; the first custom semantic query does. Uncheck semantic search to test keyword-only retrieval.

For a fresh checkout, prepare dependencies and model assets first:

```sh
npm ci --ignore-scripts
npx playwright install chromium
npm run model:prepare
npm run index:build
npm run build
npm test
npm run index:verify
npm run dev
```

If you change records after this step, stale approval hashes will correctly fail validation. Review the changed text, then explicitly rerun `node scripts/approve-test-content.mjs` to renew **test-only** approvals and rebuild indexes. Builds and CI never run that approval script automatically. It cannot create publication approvals.

See [TESTING.md](TESTING.md) for questions and expected behavior.

## Inspect the exact static artifact locally

```sh
npm run build
npm run package:static
npm run preview:static
```

Open **http://127.0.0.1:5183/pace-rag/**. The hosting folder is `output/static-site`, with the application nested under `pace-rag/` and a root landing redirect. Uploading `dist/lab` directly at a host's root would break the fixed `/pace-rag/` asset and source URLs; use the packaged folder.

`package:static` writes `output/static-package-report.json`, checks every file against the 25 MiB asset limit, and checks the dashboard upload file count. It does not deploy anything. No API Worker, AI binding or Durable Object is included. Do not use `file://`; serve over HTTP locally or HTTPS when hosted.

## Publish the static app on Cloudflare Pages when ready

These are instructions, not an executed deployment. Public publication first requires owner review of source/answer wording, alternatives and source licensing, followed by publication-scoped approval entries. Replace pending-license wording before creating final approval hashes; see [release.md](release.md). Do not simply rename a test approval's scope to bypass the review.

After that review:

```sh
npm run build:release
npm test
npm run index:verify
npm run package:static -- --release
npm run preview:static
```

Verify the packaged app at port 5183 before uploading. `build:release` and release packaging intentionally reject the current test-only approvals.

Cloudflare Pages supports prebuilt static folders through **Direct Upload**, so no GitHub repository or remote build pipeline is required. The existing project's pinned Wrangler can upload the folder after login:

```sh
npx wrangler login
npx wrangler pages project create pace-rag-demo --production-branch main
npx wrangler pages deploy output/static-site --project-name pace-rag-demo --branch main
```

Choose an available project name and use it consistently. These commands create a hosted project and publish its files; run them only when you intend and have authorized that external change. Visit `https://<actual-project-name>.pages.dev/pace-rag/` using the hostname returned by Cloudflare. Direct Upload projects cannot later be switched to Git integration; a separate project would be needed.

Alternatively, after preparing the approved artifact, create a Pages Direct Upload project in **Workers & Pages** and drag the **contents of `output/static-site`** into its upload area. Keep `pace-rag/`, root `index.html`, `404.html`, `_headers` and `robots.txt` together. A preview branch can be uploaded with `--branch test-preview`; preview URLs are still hosted URLs and do not imply private access.

Cloudflare documents a maximum single-asset size of **25 MiB**, with **1,000 files** for dashboard drag-and-drop and **20,000 files** for Wrangler. The packager enforces the smaller file-count limit. No database, paid AI resource, R2 or Vectorize is required for this static app. Hosting account limits are separate from AI neuron usage.

References checked 18 October 2026: [Cloudflare Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/), [Pages asset limits](https://developers.cloudflare.com/pages/platform/limits/), [Wrangler Pages commands](https://developers.cloudflare.com/workers/wrangler/commands/pages/).

## Verify the hosted result

1. Open the app, click a starter, and confirm no model/runtime/worker requests in browser Network tools.
2. Submit a custom semantic question; confirm same-origin model assets and related results.
3. Disable semantic mode and verify keyword search. Open the static knowledge library with JavaScript disabled.
4. Switch corpora and confirm source/candidate ownership stays separate.
5. Confirm no `/session`, `/generate` or Workers AI requests occur. This static deployment has no live-generation configuration.
6. Check the current pointer, worker pointer, asset responses and root/404 behavior on the real host. Local browser tests do not verify CDN headers or hosting behavior.

## Live AI and portfolio integration are separate

Do not deploy `apps/rag-api/wrangler.jsonc` as part of static testing. Its existing scaffolding requires credentials, owner-approved server evidence, actual provider/model/accounting checks, production origins, Turnstile setup and explicitly authorized resource changes. Keep all live/accounting switches false until those gates pass; deterministic mocks and Wrangler dry-run are not production verification. Details: [operations.md](operations.md).

The existing portfolio remains independent. Its preserved adapter under `integration/portfolio/` needs a fresh package and separate integration validation. Do not upload this static test package over the current portfolio site. Its existing main JavaScript limit remains 215,000 bytes.

EFRD current evidence, independent evaluation and remaining release limits are recorded in [PACE-RAG-EFRD-QA.md](PACE-RAG-EFRD-QA.md). `npm run preview:static` now uses a local exact-file server with real missing-file 404s; this avoids SPA fallbacks obscuring stale-source tests. Current-only packaging excludes older generated release directories. These local responses do not certify remote Pages headers or CDN behavior.

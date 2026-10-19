# Cloudflare Pages hosting

The owner corrected the public hostname to `pace-rag.paramasvara.online` on 19 October 2026 (Asia/Kuching). The application and repository retain the name PACE-RAG. The earlier `pace-reg` hostname belongs to the original Direct Upload deployment.

- Original Direct Upload Pages project: `pace-rag`
- Native Git-connected Pages project: `pace-rag-git`
- Production branch: `main`
- Current build setup: native Cloudflare Git integration for `MohdVara/pace-rag`; pushes to `main` build and deploy through Cloudflare.
- Original deployment method: Wrangler Direct Upload; pushes do not update the original `pace-rag` project.
- Git-connected hosted app: https://pace-rag-git.pages.dev/pace-rag/
- Original hosted app: https://pace-rag.pages.dev/pace-rag/
- Initial deployment: https://aebe5080.pace-rag.pages.dev/pace-rag/
- Current custom hostname: https://pace-rag.paramasvara.online/
- Upload directory: `output/static-site`

The root page redirects to `/pace-rag/`, preserving the app's asset and source paths. The initial upload contains 115 packaged files; the largest is the 22,972,370-byte quantized model. Both local semantic indexes passed integrity verification before upload.

## External DNS

`paramasvara.online` uses `dns1.registrar-servers.com` and `dns2.registrar-servers.com`. The following record was saved at Namecheap and verified on both authoritative servers on 19 October 2026. The hostname was registered in the Pages project's Custom domains tab and a verification check was requested:

| Type | Host | Target | TTL |
| --- | --- | --- | --- |
| CNAME | `pace-reg` | `pace-rag.pages.dev` | Automatic |
| CNAME | `pace-rag` | `pace-rag-git.pages.dev` | Automatic |

The custom hostname completed HTTPS activation on 19 October 2026. An HTTPS request to `/pace-rag/` returned HTTP 200 with the configured `nosniff`, `no-referrer` and `noindex` headers. Both Cloudflare and Google public resolvers returned the expected CNAME. The record is specific to this subdomain and did not require changing the domain's nameservers or existing portfolio record.

Hosted smoke checks verified the root page, knowledge/worker pointers and real 404 behavior. The three source-library URLs returned canonicalization redirects. In Chromium on the Pages hostname, the React-project starter returned owner-confirmed facts with citations; a custom query initialized semantic search and returned conservative relevance suggestions with no console errors. These checks are deployment smoke tests, not a repeat of the complete browser/evaluation suites.

## Update the hosted demo

### Native Git build setup

The `pace-rag-git` Pages project mirrors the portfolio's native Git integration,
using `MohdVara/pace-rag`. It was created separately because Cloudflare cannot
convert the original Direct Upload project in place. Its settings are:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework preset | None |
| Build command | `npm run build:cloudflare` |
| Output directory | `output/static-site` |
| Root directory | Repository root |
| Node.js | 22, selected by `.nvmrc` |

Cloudflare installs dependencies, then the build command prepares the pinned
local model and Chromium, generates approved semantic indexes, runs lint and
publication/ranking/index checks, and packages and verifies the static site.
No GitHub Actions deployment or API token secret is required. Live generation
remains disabled. The corrected `pace-rag.paramasvara.online` hostname uses the
new Git-connected project; the original deployment and its `pace-reg` hostname
remain separately available.

On 19 October 2026, Cloudflare successfully built commit `c9e6428` directly
from GitHub and deployed v1.6.1. Hosted smoke checks loaded the approved
professional corpus, returned the updated PolicyStreet answer with its source,
and initialized local semantic search for a custom query. That query produced
conservative related-question suggestions. These checks do not repeat the full
browser suite or change the recorded retrieval limitations. The owner added the
corrected `pace-rag` CNAME at Namecheap, targeting `pace-rag-git.pages.dev`, and
that hostname was registered with the Git-connected project's Custom domains.
An HTTPS check on the corrected hostname returned HTTP 200 and the v1.6.1
application bundle, with `nosniff`, `no-referrer` and `noindex` headers.
Current application links and report URL fields use the corrected hostname.
Historical reports explicitly label their pre-migration measurements. Original
release archives remain available in Git history; the current vendor directory
contains the corrected assistant package and a minimal frozen v1.5 ranking fixture.

### Original Direct Upload procedure

Run from the repository root after reviewing the desired source changes:

```sh
npm run build
npm run index:verify
npm run package:static
npx --no-install wrangler pages deploy output/static-site --project-name pace-rag --branch main
```

The packager requires prepared semantic indexes; see [deployment preparation](DEPLOYMENT.md) for a fresh checkout. Authentication uses `npx --no-install wrangler login`; never commit credentials. Record a clean source commit before uploading when possible. The initial deployment included existing uncommitted QA-document/report updates and was marked dirty accordingly.

## Demo scope

This is the owner-requested hosted static demo. Existing content-bound `local-test` approvals, draft disclosures and release checks remain intact. Hosting authorization has not been represented as per-record editorial review or a passing publication release gate. Search indexing is discouraged by `robots.txt` and `X-Robots-Tag: noindex`; these are not access controls, and the demo is publicly reachable.

The upload contains static assets and browser retrieval only. The optional generation Worker, AI binding, Durable Object and database services were not deployed. Live generation remains disabled. Historical local QA reports retain their original scope and do not independently establish hosted behavior.

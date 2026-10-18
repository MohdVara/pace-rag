# Cloudflare Pages hosting

The owner requested deployment to `pace-reg.paramasvara.online` on 19 October 2026 (Asia/Kuching). The application and repository retain the name PACE-RAG.

- Pages project: `pace-rag`
- Production branch: `main`
- Deployment method: Wrangler Direct Upload; GitHub pushes do not automatically deploy.
- Hosted app: https://pace-rag.pages.dev/pace-rag/
- Initial deployment: https://aebe5080.pace-rag.pages.dev/pace-rag/
- Requested custom hostname: `pace-reg.paramasvara.online`
- Upload directory: `output/static-site`

The root page redirects to `/pace-rag/`, preserving the app's asset and source paths. The initial upload contains 115 packaged files; the largest is the 22,972,370-byte quantized model. Both local semantic indexes passed integrity verification before upload.

## External DNS

`paramasvara.online` uses `dns1.registrar-servers.com` and `dns2.registrar-servers.com`. Add this record through the existing DNS provider, then check the domain in the Pages project's Custom domains tab:

| Type | Host | Target | TTL |
| --- | --- | --- | --- |
| CNAME | `pace-reg` | `pace-rag.pages.dev` | Automatic |

The custom hostname requires DNS verification and a Cloudflare certificate before HTTPS is ready. The record is specific to this subdomain and does not require changing the domain's nameservers or existing portfolio record.

## Update the hosted demo

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

# Operations

## Configuration

`apps/rag-api/wrangler.jsonc` declares a dedicated Worker, AI binding and a SQLite Durable Object migration. It creates no resource by itself. There is no catch-all route, static-asset proxy, public admin endpoint or runtime document ingestion.

Before any authorized provisioning, verify the active Cloudflare account/Free plan, model availability, current neuron rates, binding support, approved production origins and deployment ownership. The existing portfolio also contains a GitHub Pages workflow: do not assume Cloudflare is its only publisher.

Required secrets: `VISITOR_SECRET` and `ABUSE_SECRET` (independent cryptographically random values of at least 32 characters), and `TURNSTILE_SECRET`. Secrets belong in Wrangler secret storage or ignored local `.dev.vars`; never in content, browser configuration or logs. The Turnstile site key is public.

Public enablement requires **both** `LIVE_ENABLED=true` and `MODEL_ACCOUNTING_VALIDATED=true`. Keep both false until exact provider response schema, completion/reasoning accounting, timeout behavior and grounded outputs have been explicitly tested. Configure the frontend `live` prop only for a verified API origin and site key. Local Wrangler AI calls may consume quota; routine tests use mocks.

## Budget semantics

Portfolio 30/day; Lab 20/day; visitor 3/app/day; shared estimated 2,000 neurons/day; 2 global active leases; 1 per visitor. Network protection: 10 admitted attempts/day, 20 seconds between requests. Verification-session minting: 6/day/network, 60 seconds apart, 1,000/day globally. These are application policies, not Cloudflare quotas.

The coordinator persists reservations before inference. Only one start transition authorizes dispatch. Started failures retain a conservative charge. Never-started expiry or failed verification releases its reservation. Unknown in-flight charges carry across UTC midnight. Completion and settlement are idempotent. Successful requests currently retain their full estimated reservation; no usage-based refund is claimed.

Reservations and pseudonymous mint keys expire after 48 hours. Cleanup is opportunistic on admission; no recurring polling or cron is required. Provider quota errors pause generation until the next UTC day; capacity errors pause it for one minute. Coordinator failures reject generation. There are no automatic retries.

`USAGE_RECONCILIATION_VALIDATED` is independently false by default. Enable it only after confirming that provider `prompt_tokens` and `completion_tokens` include every billable completion/reasoning category. Validated counts reconcile the reservation using the pinned neuron rates. Missing or malformed counts retain the estimate. A higher reconciled charge records an overrun and pauses further generation.

Changing the Worker version must retain the same production DO namespace/name (`pace-rag-shared-v1`). Preview namespaces must be separate. Never reset the namespace to regain quota. Changes to prices, budgets or the provider require reviewed code/configuration and tests.

## Candidate promotion

There is no persistent visitor review queue. An owner may manually create a candidate answer from a separately retained, consented example, remove visitor data, validate claims/citations, then follow the approval process. Never scrape logs for questions or auto-publish generated text.

## Failure response

Disable live generation first. Static assets continue independently. Inspect aggregate statuses and reservation states without payload logging. For stale/revoked evidence, remove affected accepted API versions and rebuild static content. Restore a complete previous approved release if suitable; do not mix model/index versions or restore revoked claims.

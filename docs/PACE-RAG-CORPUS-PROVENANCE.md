# Knowledge sources and provenance

Audited 19 October 2026. This is the source registry explanation, not a new content approval. The original approved source/answer bodies, approval entries, release hashes and vector assets remain unchanged.

| Visitor source | Audience / evidence | Registry | Active sources / answers |
| --- | --- | --- | --- |
| Professional Experience | Recruiters, clients and employers exploring bounded public professional information | `content/portfolio/records.mjs`, `content/portfolio/technology-evidence.json` | 18 / 38 |
| How PACE-RAG Works | Reviewers examining this implementation, decisions and verification limits | Four `efrd-*` documents and 20 Q&A in `content/lab/engineering.mjs` | 4 / 20 |
| Fictional Test Documents | Reviewers testing retrieval, citations and failure behavior | 20 Atlas documents and 20 Q&A in `content/lab/records.mjs` | 20 / 20 |

## How the fictional records were obtained

Every Atlas document below is literal text in the `notes` array of `content/lab/records.mjs`. That module maps the literals to source records by adding `Synthetic example.` and a local `/pace-rag/knowledge/lab/sources/{id}.html` URL. It appends the separate implementation module afterwards. There is no recorded text-generation script, import from an employer, public upstream original, or fixture-specific preparation date. The indexer normalizes/chunks these strings and embeds them; it does not generate their prose. `scripts/static-pages.mjs` makes readable snapshots from the verified runtime registry.

The initial repository audit could establish bundled origin but not human/AI authorship. The owner subsequently confirmed **“Human authored AI-assisted”** in this session on 19 October 2026. The registry therefore labels these 20 fixtures **Human-authored with AI assistance**, with that confirmation as its basis. This does not establish which person wrote each line, which AI tool was used, or when each document was prepared. Git identity and the presence of an AI project are not treated as authorship evidence. Other source authorship remains unknown unless independently established. Publication approval is separate.

All documents below share that file and authorship basis. Their per-document type and purpose are defined in `packages/knowledge-schema/src/provenance.mjs` and rendered in the static library and source viewer.

| Stable identifier | Fictional category | Purpose |
| --- | --- | --- |
| `atlas-overview` | Architecture overview | Atlas service responsibilities and publication boundaries |
| `gateway-adr` | Architecture decision | Bounded requests and trusted evidence resolution |
| `catalog-adr` | Architecture decision | Source versions, review and retirement |
| `queue-adr` | Architecture decision | Deterministic indexing and reuse |
| `search-runbook` | Runbook | Browser model failure and lexical fallback |
| `quota-runbook` | Runbook | Hypothetical provider allowance denial |
| `catalog-runbook` | Runbook | Stale-source investigation |
| `queue-runbook` | Runbook | Recovery of incomplete indexing |
| `incident-timeout` | Incident | Preserving sources after a hypothetical timeout |
| `incident-version` | Incident | Mixed metadata/vector releases |
| `incident-poison` | Incident | Untrusted document instructions |
| `incident-budget` | Incident | Uncertain usage reservation recovery |
| `migration-model` | Migration procedure | Model and vector compatibility |
| `migration-corpus` | Migration procedure | Knowledge collection separation |
| `migration-schema` | Migration procedure | Incompatible schema handling |
| `migration-release` | Migration procedure | Complete release and rollback |
| `api-generate` | API specification | Bounded requests and replay protection |
| `api-citations` | API specification | Membership versus entailment |
| `api-budget` | API specification | Atomic admission and closed failure |
| `api-privacy` | API specification | Local search versus explicit transmission |

These are fictional scenarios, not company records, actual operational incidents, or evidence of professional achievements. Fictional assertions about Atlas do not certify corresponding PACE behavior; actual behavior belongs in implementation evidence and QA reports.

## Professional and implementation evidence

Professional snapshots retain their existing review scope. The six-project technology export contains owner-confirmed public technology involvement, checked upstream hashes and canonical project references. It distinguishes education generations and historical projects. It is not independent proof of sole ownership, secure deployment, scale or impact. Existing retired stack answers stay retired. The professional Incident Zero snapshot describes the owner’s real portfolio demonstration with fictional incident data; it explicitly denies that the story is an employer outage. It does not import the fictional underlying incident records into professional evidence, and is distinct from the Atlas fixture collection.

Implementation documents describe the actual local retrieval/cache/guarded-gateway architecture, not Atlas. Their verification references are repository-relative code (`packages/semantic-core/src/{scope,retrieval,answers}.mjs`, `packages/semantic-core/src/load.ts`, `packages/portfolio-assistant/src/Assistant.tsx`, `apps/rag-api/src/`) and reproducible [EFRD](PACE-RAG-EFRD-QA.md) / [v1.2 QA](PACE-RAG-UX-QA.md). Local mocks, real browser checks and unavailable production services remain distinct. Cached documentation is not silently rewritten to approve new claims.

## Search and browsing boundaries

The immutable physical `portfolio` and `lab` releases retain their existing IDs. `scopeCorpus` derives three disjoint search views **after** full manifest/asset integrity validation. It filters registered source nature, dependent answers (every citation must belong), chunks and both vector matrices using original row positions. `sourceCurrent` also enforces scope at answer/passages validation time. Unknown or unregistered Lab records fail scope selection. Portfolio technology facts are unavailable in the other two scopes. Before vectors finish loading, the static-ready callback receives the same scoped records. Opening diagnostics does not derive different facts or execute another search.

This is a retrieval boundary over public test assets, not confidential authorization: the underlying downloadable Lab release still includes both reviewed public test subsets. No private data belongs in either physical index. Future restricted content would require a different server-side authorization design. Scoped HTML libraries contain only their own documents/Q&A. The old combined Lab library URL is now a directory pointing to the separate libraries; canonical source URLs remain stable. Documents can be inspected without JavaScript and without an unverified public repository URL. Paths shown to visitors are repository-relative; no username or absolute filesystem path is exposed.

## Review and publication

Existing record-bound local-test approvals remain unchanged. The earlier explicit owner approval covers the 20 implementation Q&A and four sources for local testing only. The fixture authorship confirmation does not grant publication approval. Static source pages show record ID, type, purpose, origin, authorship basis, review date/status, unknown update history and the full snapshot. No new source, Q&A, generated answer or synthetic-to-professional promotion was approved by a routine build.

Release validation continues rejecting local-test approvals; generated API evidence remains empty. All live/provider/accounting flags remain false. Owner wording/license/publication review, independent labels, actual provider/runtime/accounting verification and explicit production approval remain gates. No deployment or provisioning was performed.

import { engineeringDocuments, engineeringAnswers } from "./engineering.mjs";
// Original synthetic examples. No employer systems, incidents or customer data.
const notes = [
  [
    "atlas-overview",
    "Atlas architecture",
    "Atlas is a fictional public-document service. The Gateway validates requests, Catalog owns document metadata, Queue schedules indexing, and Search serves immutable index releases. Catalog is the source of truth for publication status. Search cannot approve documents. Each request carries a corpus identifier and release version.\n\nThe static knowledge browser remains available when generation is disabled. Index publication is atomic: build a complete release, validate references, then change the current pointer. Partial releases are never advertised.",
  ],
  [
    "gateway-adr",
    "ADR: bounded gateway",
    "The synthetic Gateway accepts JSON requests up to 8 KiB and rejects unknown fields. Generation has no tool execution or arbitrary URL fetching. A client may propose document IDs but cannot supply trusted evidence text. Gateway resolves IDs against the current approved manifest.\n\nThis prevents a forged browser payload from becoming a cited source. It does not prove that approved sources are correct; editorial review and evaluation remain separate responsibilities.",
  ],
  [
    "catalog-adr",
    "ADR: immutable catalog versions",
    "The fictional Catalog assigns stable document IDs and immutable versions. Each version includes a SHA-256 content hash, publication status, review deadline and corpus ownership. Retirement excludes a version from new generation requests.\n\nDo not mutate a published version in place. Build a replacement release and preserve the old release only while its sources remain authorized. If a claim is revoked, remove the affected release from the accepted-version set immediately.",
  ],
  [
    "queue-adr",
    "ADR: idempotent indexing",
    "The synthetic Queue deduplicates indexing work by corpus ID, source hash and embedding specification. A retry with the same key reuses its completed artifact. A different source hash creates a new job.\n\nWorkers write temporary outputs and validate dimensions, finite values and row mappings before publication. A failed build never changes the current pointer. This is indexing idempotency, not a claim of exactly-once processing across all systems.",
  ],
  [
    "search-runbook",
    "Runbook: degraded semantic search",
    "When the fictional Search cannot initialize its embedding model, first preserve starter questions and source links. Switch to lexical retrieval and label the mode. Do not repeatedly retry the model in the background.\n\nCheck asset version, content hash, browser memory pressure and network errors. Offer a manual retry after the visitor can already use lexical search. If lexical processing also fails, use the prerendered source browser.",
  ],
  [
    "quota-runbook",
    "Runbook: provider quota exhausted",
    "For the synthetic Atlas demo, a provider quota error disables new generation until the next UTC allocation boundary. Keep cached answers and document retrieval active. The application’s internal budget may still show headroom because unrelated applications can use the same provider allowance.\n\nDo not refund an uncertain inference attempt merely because the client timed out. Record a conservative charge and inspect aggregate usage without storing the visitor question.",
  ],
  [
    "catalog-runbook",
    "Runbook: stale source report",
    "A stale-source report identifies a document ID and version. Compare the published hash with the reviewed source snapshot. Retire dependent answers before publishing replacement indexes.\n\nIf the source was revoked, remove its old version from live generation immediately. Update the public current pointer and explain that already-downloaded public copies cannot be remotely erased. Never repair staleness by assigning an old vector to changed text.",
  ],
  [
    "queue-runbook",
    "Runbook: stuck indexing job",
    "In the fictional Queue, inspect the job key and lease expiry. A job whose lease expired before output publication can be retried using the same deterministic inputs. Temporary files are not public releases.\n\nIf an artifact exists, verify its hashes and row count before reuse. A success status without matching output is treated as incomplete. Do not change the current pointer until the full release verification passes.",
  ],
  [
    "incident-timeout",
    "Incident: generation timeout",
    "Synthetic incident: a slow provider response exceeded the Gateway’s 25-second deadline. The browser kept its retrieved passages and displayed that generation was unavailable. A previous UI prototype had cleared the passages when the request began, making the failure appear to remove search results.\n\nThe correction separated retrieval state from generation state. A regression test now verifies that existing sources remain visible after timeout. The attempt remains conservatively charged when provider usage is unknown.",
  ],
  [
    "incident-version",
    "Incident: mixed index versions",
    "Synthetic incident: cached question vectors belonged to release A while freshly fetched metadata belonged to release B. Row indices pointed at unrelated questions. The candidate build was stopped before publication.\n\nThe correction loads a complete manifest into a temporary state, verifies every hash and vector length, then swaps the active release in one operation. Tests intentionally mix assets and require a controlled fallback instead of showing a candidate answer.",
  ],
  [
    "incident-poison",
    "Incident: unapproved document",
    "Synthetic incident: an imported draft runbook included instructions asking the assistant to ignore its evidence rules. The draft failed publication approval checks and did not enter the public index.\n\nThe response added an explicit adversarial document fixture and reinforced that document text is untrusted evidence. An allowlisted source can still contain hostile instructions; prompt boundaries, no tools and output validation provide additional layers.",
  ],
  [
    "incident-budget",
    "Incident: reservation recovery",
    "Synthetic incident: a Gateway process stopped after marking a reservation started but before saving provider usage. Releasing the reservation would have allowed quota reuse even though inference might have happened.\n\nRecovery now marks the attempt uncertain, retains its reserved charge and expires only the concurrency lease. A never-started expired reservation is released. Tests cover both outcomes and repeated recovery calls.",
  ],
  [
    "migration-model",
    "Migration: embedding model",
    "To replace the synthetic Atlas embedding model, assign a new embedding specification and regenerate every query and chunk vector. Equal dimensions do not make vectors from different models compatible.\n\nRun held-out retrieval evaluation and browser parity tests. Publish a complete new release with its model assets. Keep model and index versions coupled during rollback; never roll back only the model file.",
  ],
  [
    "migration-corpus",
    "Migration: corpus separation",
    "The fictional portfolio and operations corpora use distinct manifests, document namespaces and API routes. Moving a document between them requires explicit publication approval and a new release.\n\nThe server derives corpus ownership from the endpoint. It rejects foreign chunk IDs even when their text is public. Tests use collisions and mixed selections to ensure a client cannot bypass this boundary.",
  ],
  [
    "migration-schema",
    "Migration: schema version",
    "An Atlas schema change must declare a new schema version when old readers cannot interpret it safely. New clients reject unknown versions and fall back to static browsing.\n\nDeploy compatible readers before switching the current manifest. For rollback retain a complete approved previous release. Do not rename stable source IDs merely to simplify a migration; preserve provenance links when meaning is unchanged.",
  ],
  [
    "migration-release",
    "Migration: static release",
    "A synthetic release builds source pages, answer records and vector indexes from the same approved snapshots. The API accepts the new corpus version before the static pointer is switched.\n\nVerify old and new browser sessions during the transition. Old releases may remain accepted only if their evidence remains approved. Rollback restores a complete release and does not reset daily budget counters.",
  ],
  [
    "api-generate",
    "API: generation request",
    "Atlas generation accepts a request ID, corpus version, question, selected chunk IDs and verification tokens. It rejects client text, citation URLs, scores, model selection and administrative fields.\n\nThe request ID scopes idempotency to visitor and application. Replaying a started request must not dispatch another inference. A different body under the same ID is rejected. Successful output contains plain-text claims and server-built citations.",
  ],
  [
    "api-citations",
    "API: citation validation",
    "The synthetic generation response contains claims and canonical source IDs. Every claim must reference evidence in the supplied context. Unknown or foreign IDs invalidate the entire response.\n\nThe server constructs citation titles and URLs from its approved registry. It never trusts model-generated links. Citation membership alone does not prove entailment, so release evaluation includes human review of claim support.",
  ],
  [
    "api-budget",
    "API: budget admission",
    "The Atlas coordinator atomically checks daily application counts, visitor counts, the shared neuron estimate and active leases. Reservations occur before inference. The day boundary is UTC rather than a visitor’s local timezone.\n\nThe configured budget is an application policy. It cannot observe all provider-account usage. If the coordinator is unavailable, generation fails closed while the static knowledge browser continues to work.",
  ],
  [
    "api-privacy",
    "API: privacy boundaries",
    "Local Atlas search does not send questions to the generation API. Only an explicit generation action transmits a question and selected public evidence. Raw questions and generated answers are not persisted by the application.\n\nRate enforcement stores short-lived daily pseudonymous keys. Analytics excludes questions, prompts, embeddings and answer content. The privacy notice distinguishes application retention from the provider’s handling of inference data.",
  ],
];
export const documents = notes.map(([id, title, text]) => [
  id,
  title,
  `/pace-rag/knowledge/lab/sources/${id}.html`,
  `Synthetic example. ${text}`,
]);
export const answers = [
  [
    "fallback",
    "What happens if browser embeddings fail?",
    "Atlas preserves starter questions and source links, switches to lexical search, and offers a manual retry. Static source browsing remains the final fallback.",
    ["search-runbook"],
    [],
  ],
  [
    "quota",
    "Why can provider quota be exhausted with internal budget remaining?",
    "Other applications may consume the shared provider allowance. Atlas responds to provider quota errors by disabling generation while retaining local search.",
    ["quota-runbook"],
    [],
  ],
  [
    "uncertain",
    "Should a timed-out generation reservation be refunded?",
    "Not when inference may have started. Retain its conservative charge and expire only the concurrency lease; release only a reservation known not to have started.",
    ["incident-budget", "quota-runbook"],
    [],
  ],
  [
    "model-change",
    "Can equal-dimension embedding models share an index?",
    "No. Model changes require a new embedding specification and regenerated vectors, even when both models have the same dimensionality.",
    ["migration-model"],
    [],
  ],
  [
    "citation-check",
    "Does a valid citation prove an answer is supported?",
    "No. Source membership validation rejects forged IDs, while human claim-support evaluation checks whether the evidence entails the answer.",
    ["api-citations"],
    [],
  ],
  [
    "publish",
    "How does Atlas publish an index release?",
    "Build and verify the complete approved release, deploy compatible API evidence, then switch the static pointer. Never publish a partial index or mix releases.",
    ["migration-release", "catalog-adr"],
    [],
  ],
  [
    "isolation",
    "How are corpora isolated?",
    "Separate manifests and fixed API endpoints establish corpus ownership. The server rejects mixed or foreign chunk selections.",
    ["migration-corpus"],
    [],
  ],
  [
    "privacy",
    "Are questions sent to a server during local search?",
    "No generation request occurs during local search. Explicit generation sends the question and public evidence; application payloads are not persisted.",
    ["api-privacy"],
    [],
  ],
  ["unknown-fields", "Can the browser send its own trusted evidence text?", "No. The synthetic Gateway rejects unknown fields and resolves proposed document IDs against its own approved manifest. Browser-supplied text cannot become trusted evidence.", ["gateway-adr"], ["Can a client supply source text to the generation API?"]],
  ["hash-change", "What happens when a source document changes?", "Changed text needs a new hash and a complete replacement release. Dependent answers must be reviewed; old vectors must not be assigned to the changed text.", ["catalog-adr", "catalog-runbook"], []],
  ["stuck-job", "How should a stuck indexing job be recovered?", "Inspect the deterministic job key and lease expiry. Retry expired, incomplete work with the same inputs, verify any reusable artifact, and publish the current pointer only after the complete release passes verification.", ["queue-runbook"], []],
  ["index-key", "How does indexing deduplicate repeated work?", "The fictional Queue keys indexing by corpus ID, source hash and embedding specification. The same completed key reuses its artifact; changed source hashes create new work.", ["queue-adr"], []],
  ["mixed-index", "Why must metadata and vectors come from the same release?", "Mixed releases can map vector rows to unrelated questions. The synthetic incident response verifies hashes and row counts for a complete manifest before activating it.", ["incident-version"], []],
  ["prompt-injection", "Can an allowlisted document still contain hostile instructions?", "Yes. An allowlisted document can still contain malicious instructions. Treat document text as untrusted evidence and retain prompt boundaries, no tools, output validation and editorial review.", ["incident-poison"], []],
  ["timeout-ui", "Should source results disappear while generation is pending?", "No. The synthetic timeout incident keeps retrieval state separate from generation state so source passages remain available after generation fails.", ["incident-timeout"], []],
  ["revoked-source", "How should a revoked source be handled?", "Remove its old version from live generation immediately, retire dependent answers and rebuild the public release. Already-downloaded public copies cannot be remotely erased.", ["catalog-runbook"], []],
  ["unknown-schema", "What should a client do with an unsupported manifest schema?", "Reject unknown schema versions safely and fall back to static browsing. Deploy compatible readers before switching the current manifest.", ["migration-schema"], []],
  ["rollback-budget", "Does rolling back a release reset daily AI budgets?", "No. Rollback restores a complete approved release and must preserve daily budget counters. Model and index assets must remain coupled.", ["migration-release", "migration-model"], []],
  ["cross-corpus", "Can a request combine portfolio and operations chunks?", "No. The server derives corpus ownership from the fixed endpoint and rejects mixed or foreign chunk selections, even if the text itself is public.", ["migration-corpus"], []],
  ["release-retirement", "Can an old release remain available after its evidence is revoked?", "No. Old releases may remain accepted only while their evidence stays approved. Revoked evidence must be removed from the accepted-version set.", ["catalog-adr", "migration-release"], []],
];

// Actual implementation documentation has separate provenance from synthetic Atlas examples.
documents.push(...engineeringDocuments);
answers.push(...engineeringAnswers);
export const documentProvenance = Object.fromEntries(engineeringDocuments.map(([id]) => [id, "implementation-documentation"]));

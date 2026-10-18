# EFRD answer and evidence contract

19 October 2026. Shared types extend the existing corpus/citation contracts in `packages/knowledge-schema/src/contracts.ts`; runtime adapters are in `packages/semantic-core/src/answers.mjs`.

## Result and selection

`AnswerResult` carries one paragraph (hard maximum 120 words), origin, actual retrieval method, 1–4 supporting `AnswerSource` records when answered, at most three related questions, evidence statuses, an explanation, corpus version and optional answer/fact version. `SourceCitation` fields remain canonical: source ID, corpus, document version, source hash, title and authorized URL. Additional fields identify source type, review scope and evidence category. No client-authored URL becomes evidence.

Origins:

- `approved-cache`: an actual current reviewed registry record; exact normalized canonical/alternative wording or explicit user selection. The local-test review scope is visible and does not grant publication approval.
- `approved-composite`: bounded deterministic templates over imported owner-confirmed PACE v1.2 technology records. Fact IDs and upstream version/hashes make composition traceable. The method is `structured-facts`, not an invented hybrid/semantic score. No LLM is involved.
- `live-generation`: runtime-validated gateway output adapted into the same contract. The deployed/provider path remains disabled and unverified; this adapter is tested with fixtures only.
- `insufficient-evidence`: `answer: null`, no supporting source list, a concise limitation and separately identified related questions/passages. An empty source list never accompanies a purported factual answer.

The question normalizer handles whitespace, case, NFC and terminal question punctuation. Exact alias reuse is authorized by the enclosing hash-bound answer approval; alternatives were included in the reviewed record hash even where their legacy `approvedAt` field is null. New paraphrases are not promoted automatically.

No semantic automatic-answer threshold is calibrated or enabled. Existing restrictive future-policy hooks remain dormant. Cosine ranks candidates; lexical relevance is shown separately. No percentage of accuracy/confidence is inferred from either signal.

## Structured facts and intent limits

The public technology export is explicitly imported by `scripts/import-technology.mjs`, validating its schema, outer/per-record SHA-256, canonical public host and actual portfolio anchors. It is consumed locally without editing the portfolio. Existing owner-confirmed provenance is retained, with local-test use; this is not a bulk approval of new material.

Composition supports a bounded grammar for technology inventory, specific project/generation stacks and technology-to-project relationships. Every requested known technology must be present in a selected record. Unrecognized predicates, unknown tool constraints, private architecture, negation, absence claims, security, metrics, versions not explicitly queried by the supported grammar and ownership claims do not collapse into a simpler technology answer. Richer questions return to reviewed suggestions/evidence limitation.

Education legacy and modern groups remain distinct. Plain PHP/PDO's Hostel context is historical and unmaintained; Asset has no inferred employer or dates. Professional-only inventory queries select the established selected-work engagements; the owner inventory does not justify attributing the undated Asset system to a particular job. General résumé capability lists are not imported as project relationships.

Composite sources correspond to records actually used. When more than four project records support an aggregate, the dedicated owner-confirmed inventory source provides one concrete reference rather than padding citations with unrelated passages. Full used-fact IDs remain visible in Lab inspection. Related questions without canonical approved entries are visibly labelled new searches.

## Source integrity and versions

`answerCurrent` verifies status, expiry, corpus, source version/hash and canonical URL for every cache citation. Passage filtering checks corpus/release ownership and source integrity separately. Original vector row IDs are retained while filtering, so retiring an early row cannot silently assign its vector to another answer. The actual public build excludes draft/retired answers and unapproved documents. Packaging removes other generated release folders and reconstructs source pages from current authorized records.

Two historical stack-availability answers are retired in an explicit overlay; original editorial records and approval entries remain preserved. Earlier background snapshots remain usable only as attributed historical background; their obsolete stack qualifications are labelled superseded, and their chunks are excluded from open retrieval. Current technology answers use the new owner-confirmed inventory. No silent text overwrite grants a new approval.

The browser loader validates release pointers, schema/model specification, row mappings, asset byte lengths and SHA-256 before activation. An invalid pointer/version or corrupt asset fails into static browsing; missing vectors preserve lexical retrieval. Retirement cannot erase previously downloaded public bytes, and the local checks do not certify remote CDN cache behavior.

## Remote boundary and privacy

Remote responses are validated against the request ID, corpus/release, authorized retrieved chunk IDs, canonical source metadata, claim-to-citation membership, output length and usage shape. Server output validation also enforces the paragraph word bound. React renders plain text; no generated HTML is executed. Citation membership is not proof of entailment: human/source agreement review remains required.

Live generation requires explicit configuration marked verified plus the existing server live/accounting gates, Turnstile, signed visitors, source validation and atomic budget admission. No delivered frontend passes live configuration. Cache hits never dispatch generation. A verified quota-denial response disables further attempts in that component session; provider failures keep retrieval state and have no automatic retry.

Traces contain actual query/ranking information in component memory only. No new analytics, raw-question storage, provider polling or automatic answer promotion is introduced. Token/neuron billing is reported as not measured unless validated provider accounting is actually available; estimates are labelled estimates.

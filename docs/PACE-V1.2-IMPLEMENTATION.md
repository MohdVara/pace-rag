# PACE v1.2 — Implementation

18 October 2026. Content and information architecture enhancement; no redesign, deployment or independent PACE-RAG edit.

## Data and UI

`src/technology.ts` is the typed canonical six-project inventory. `TechnologyExperience` contains a stable ID, optional existing selected-work ID, public anchor, typed generation/group records, optional historical note and the inspected Hostel repository reference. Shared review metadata identifies the owner-confirmation date and bounded source-review timestamp separately.

`src/content.ts` attaches the canonical record to existing `Project` entries and derives `Project.stack` as a deduplicated flat projection. Existing consumers retain `stack: string[]`. The richer rendering uses the original generation/group structure, so flattening never merges education's displayed generations. Existing project sort order, diagram IDs, role dates/titles and unsupported-stack meetings/HR cases are preserved. There is no new client sorting/filtering feature or dependency.

`TechnologySummary` extends the stack area inside the existing engineering disclosures. It uses plain headings, definition lists and wrapping inline text, with existing theme variables and font scale. No logos, badges, animated carousels or technology buttons are introduced. Owner attribution and the professional-background CV link have distinct labels. WenSymes retains Microsoft 365 in its original narrative.

A compact **Additional engineering systems** native disclosure follows the six selected-work cards. It contains Hostel and Asset Management without flagship promotion or employment metadata. The historical repository link is descriptively labelled. Shared native `details` grouping and a fallback toggle handler retain exclusive engineering disclosures. The additional systems do not expand the existing six-value `ProjectId` union.

Capabilities retain their editorial layout and existing tools. A quiet paragraph links readers to project-specific evidence and distinguishes wider practice from independent/AI capability evidence. Experience dates/descriptions are untouched; no duplicate stack lists are added to the timeline.

`src/useFragmentNavigation.ts` additionally reveals the ancestor disclosure for `#system-hostel` and `#system-asset`. Existing commercial fragment validation, sticky-header alignment and focus behavior remain intact. The new headings accept programmatic focus without entering the normal tab order. Static content and native disclosure interaction work without JavaScript.

## Public evidence export

Build command runs `scripts/technology-evidence.mjs` before Vite copies public assets. `npm run export:technology` regenerates it independently. The generator transpiles the trusted typed inventory with the existing TypeScript dependency; there is no remote fetch, inference or embedding step.

Public artifact: `/evidence/technology-experience.v1.json`, tracked under `public/evidence/` and copied unchanged to `dist/evidence/`.

Contract:

- `schemaVersion: 1`, `contentVersion: pace-technology-v1.2`, `publicOnly: true`.
- Each record has `canonicalProjectId`, optional `selectedWorkId`, `projectTitle`, `canonicalPortfolioAnchor`, structured `generations[].groups[]`, legacy flags/limited notes, `provenance`, `reviewedAt`, `contentVersion`, `contentHash`.
- Provenance distinguishes dated owner confirmation from Hostel's bounded public-repository inspection, commit and inspected paths. The review timestamp denotes the bounded editorial/source review, not an invented exact time of owner confirmation.
- Each SHA-256 is over `JSON.stringify` of the record excluding its own `contentHash`; the outer hash covers the full payload excluding its own hash, including record hashes. Property order is generated deterministically. Do not infer a signature, publication permission for other data, or independent verification from a hash.
- Breaking readers require a new schema version/path. Content-only changes update hashes/version/review metadata. Do not edit the generated JSON independently of the canonical inventory.

## Future PACE-RAG indexing

The independent `pace-rag` repository is deliberately untouched. This JSON is an integration artifact, not automatic synchronization. Its older test cache can still contain “stack not established” wording for education, insurance, rental and WenSymes until a separately authorized ingestion update occurs.

A future importer should allowlist this public export, validate schema/project IDs/canonical anchors and content hashes, then preserve owner-confirmed provenance in source records. Index generation groups separately, particularly `campus/legacy` and `campus/modern`. Questions such as React, Docker, Kubernetes, cloud and database experience should map only to entries whose groups explicitly list the technology. Hostel must retain its historical limitations; infrastructure involvement cannot become a claim of sole administration or certification.

Before activating a new RAG version, explicitly review/replace contradictory older stack Q&A and source snapshots. A source-text change must invalidate dependent approvals, regenerate all affected vectors with the existing pinned embedding specification, and publish complete consistent manifests. Version mismatch must trigger refresh/lexical/static fallback, never reinterpret old vector rows or serve an obsolete stack answer. Retire revoked/contradictory accepted API evidence as appropriate. Generated answers must never enter the approved cache automatically. Do not import this export as universal approval for unrelated claims.

## Performance decision

Baseline main entry was 213,064 raw bytes against the unchanged strict 215,000-byte ceiling. The first unsplit implementation exceeded it at approximately 217.8 kB. Vite/Rolldown now emits `content.ts` and `technology.ts` in one `portfolio-content` shared static module. Static ESM import/modulepreload makes the same data available before hydration; there is no new loading state, asynchronous content fetch or SSR-only fallback. React/runtime and game boundaries are unchanged.

This decreases the main-entry bytes while total initial JavaScript grows for the new content; it is not a total-payload reduction claim. Exact final bytes and browser results are in QA. The generated JSON export is not preloaded or fetched by the homepage. No packages, icons, fonts, large duplicated runtime JSON, Workers AI, databases or embeddings were added.

## Files changed

- `src/technology.ts`, `src/content.ts`: canonical inventory and compatible projection.
- `src/App.tsx`, `src/App.css`, `src/useFragmentNavigation.ts`: restrained disclosure integration, evidence discoverability and fragment support.
- `vite.config.ts`: shared content chunk; `.gitignore`: local bounded review/measurement artifacts.
- `scripts/technology-evidence.mjs`, `public/evidence/technology-experience.v1.json`, `package.json`: reproducible public export.
- `tests/technology.test.mjs`, `scripts/technology-qa.mjs`: inventory/export/static/budget checks and expanded-browser coverage. `scripts/pace-accessibility-review.mjs` now parses Chrome’s normalized `color(srgb ...)` values correctly; no production colors changed.
- `docs/content-sources.md`, scoped v1.1 evidence/confidentiality notices, and the three PACE v1.2 documents.

No scenery, hero, game source, analytics behavior, existing navigation or production workflow was changed. Pre-existing uncommitted BAA documentation edits were preserved.

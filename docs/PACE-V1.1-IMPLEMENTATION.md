# PACE v1.1 implementation

18 October 2026. Starting point: clean `main` at `6ab946f`. No production, hosting, analytics-key, commit or deployment mutation.

## Navigation and evidence

`src/useFragmentNavigation.ts` replaces the mount-only effect in `Page.tsx`. It validates commercial hashes against `projectIds` in `content.ts`, opens native details, closes siblings and then measures/scrolls after font readiness. `hashchange` covers same-document links and browser history; initial mount covers direct visits, reloads and cross-page links. A bounded-to-lifecycle MutationObserver waits for lazy content when necessary; interaction cancels stale pending positioning. No arbitrary delay or routing dependency.

Only same-origin, same-document commercial link activations are intercepted. Ordinary scrolling never opens disclosures or steals focus. Keyboard activation focuses the project heading with preventScroll; pointer/history/direct-load positioning does not force heading focus. A real Firefox check showed Enter can produce click detail=1, so the handler remembers the actual Enter target as well as supporting detail=0 accessibility activation. Native exclusive disclosure remains the state owner. No React open-state duplication or hydration-open attribute is introduced.

Without JavaScript, a case fragment exposes the readable project card; the visitor opens native details manually. Automatic fragment expansion is a JS enhancement, not a no-JS guarantee.

`src/evidence.ts` centralizes typed project destinations and descriptive evidence labels. `EngagementContent.ts` now uses `EvidenceId` references: PolicyStreet for integration and leadership, education for modernisation, rental for domain modelling, WenSymes for broad enterprise full-stack work, NTM for AI-assisted process, capability boundaries for proposed RAG work. Work With Me renders these labels/destinations and exposes résumé/CV links at Contact. Homepage principles use the same project link helper.

## Professional communication

- `App.tsx`, `content.ts`, `Readability.css`: AI evidence boundary text, focusable commercial headings and broad source-supported WenSymes planning/remit. Display spelling WenSymes is consistent; no dates or employment status changed.
- `WorkWithMe.tsx`: invites discussion of roles and scoped projects, avoiding a new availability promise or implication that all opportunities must be consulting packages. Existing service descriptions and scope-first deliverables remain; two relevant evidence pathways were added on this secondary page.
- `NoTwoMondaysCaseStudy.tsx` / CSS: engineering-first H1, six-row Engineering at a Glance, summary-first action and integrated ten-link contents. All earlier chapter/architecture/verification fragments, historical metrics and longform material remain.
- Existing education cards remain distinct and compact; they overlap at broad confidentiality-safe scope but refer to different work/periods. No merging/deletion or extra technical disclosure to distinguish them.

## Interactive experience integration

- `IncidentCallout.tsx`: play and understated recruiter-preview paths. The main interactive experience remains available.
- `IncidentZeroRoute.tsx`: exact `mode=preview` query opens the existing chooser only after hydration; unknown modes retain opening. No outcome is selected automatically by this shortcut.
- `GameShell.tsx`: explicit recruiter demonstration label. Reports retain existing no-investigation-credit language, focus/replay and professional destination links.
- System Defence implementation unchanged. No scoring, balancing, generation, enemy, weapon, save/checkpoint format or narrative outcome changes.

## Metadata and performance

- `scripts/prerender.mjs`, `index.html`: route-specific OG/Twitter image URLs and alt, coordinated engineering-first NTM metadata and dated campaign description. Existing canonical/schema/sitemap and 404 behavior remain.
- `public/images/social/{work-with-me,no-two-mondays,incident-zero}.png`: original branded conceptual 1200×630 artwork; Defence reuses Incident appropriately. Each image is below 48KB; no screenshot is fabricated or represented as current.
- `scripts/social-previews.py`: optional Pillow regeneration using a locally licensed font. No redistributed font or build/runtime dependency.
- `Page.tsx`, `prerender.tsx`: Work With Me uses the existing lazy/Suspense/error-boundary pattern, with the actual component injected during SSR. Static HTML and shared styles remain available without JS.
- `problemSummaries.ts`, `WhatISolve.tsx`: compact shared homepage labels keep detailed service copy in the lazy route. An initial expanded build exceeded the existing 215KB main-client ceiling; route splitting resolved it without raising the budget. Exact final bytes/delta are in QA.

## Analytics and privacy

`analytics.ts` retains canonical-production host, development/automation/DNT exclusions, pageviews/leaves, named events and graceful SDK failure. Automatic capture is disabled; session recording is disabled even with the legacy environment flag. URL/referrer properties that can contain arbitrary query strings are denied. Incident entry events add only allowlisted play/preview mode, parsed without retaining query values. `.env.example` and README now accurately explain this configuration. No live ingestion query or conversion result claim.

DNT is not comprehensive consent. Applicable deployment privacy requirements were not established by this engineering task. Owner review is documented; no claim of legal compliance and no invented consent policy.

## Tests and maintained artifacts

- `tests/evidence.test.mjs`: safe hash validation and real generated evidence destinations.
- `tests/analytics.test.mjs`: recording/capture/query minimization and bounded preview-mode events.
- `tests/no-two-mondays.test.mjs`: summary, metadata and historical limitations in generated output.
- `tests/social-metadata.test.mjs`: image dimensions/size, OG/Twitter consistency, canonical/schema/sitemap/404 regression.
- `tests/production.test.mjs`: URL pathname handling for query-bearing preview links; existing bundle budget preserved.
- `scripts/pace-qa.mjs`: eight exact viewport sizes, system/light/dark preferences, Largest text, keyboard, native details, axe, routes/no-JS; engine-selectable. WebKit on macOS uses Option-Tab for links under default system settings.
- `scripts/pace-navigation-qa.mjs`: all six commercial cases, reload/history, source evidence journeys, keyboard focus, NTM contents/assets/chart, no-JS and lazy-route error/retry. End-of-document checks accept the actual scroll limit rather than demanding impossible top alignment.
- `scripts/pace-game-qa.mjs`: preview, replay, focus, conversion destinations, touch/desktop defence checkpoints and renderer failure recovery.
- `scripts/incident-review-qa.mjs`: fixes the harness to open Display before selecting its hidden theme control; supports a fresh normal-investigation-only run to isolate GPU/context load.
- `scripts/pace-live-qa.mjs`: read-only deployed route/refresh/canonical/asset/404 and external destination checks, explicitly separate from local changes.

The six PACE v1.1 documents and QA artifacts record evidence, residual uncertainty and owner review. No unrelated application changed.


## Follow-up resolution — 18 October 2026

- `src/analyticsPreference.ts` and Display control in `App.tsx`: explicit default-off choice, local consent persistence, memory fallback, cross-tab resync, accessible explanatory notice and withdrawal.
- `src/analytics.ts`: lazy SDK gated on permission and existing production exclusions plus GPC; initially opts out capture/persistence, uses sessionStorage only after grant, captures pageview manually after permission, suppresses campaign/referrer storage, detaches listeners/observer on withdrawal and guards in-flight SDK races. Existing event names and permanent recording/autocapture exclusions retained.
- `tests/analytics-preference.test.mjs`, expanded analytics tests and `scripts/pace-consent-qa.mjs`: preference/race/regrant lifecycle and cross-browser controls, remembered choice, cross-tab withdrawal, Largest text and no SDK requests from excluded local QA.
- `content.ts`: owner-confirmed current roles; consistent Centre Engineer narrative; WenSymes remit and broad technology summary grounded in the newly reviewed CV and explicit employer mapping.
- `App.tsx` / `DefenceRoute.tsx`: meaningful engineering-principles section semantics, grouped HUD label, accessible integrity text with decorative diamonds hidden.
- `Readability.css`: preference panel scrolls within the viewport; narrow Largest text hides decorative Aa to prevent actual monogram/control overlap while retaining Display label and access.
- `scripts/pace-accessibility-review.mjs`: full ARIA/incomplete review, computed contrast samples, reflow, scroll chart reachability and corrected narrow header/preference geometry.
- `scripts/defence-stage2-playtest.mjs`: explicit arena focus before keyboard controls; a fresh five-level victory now verified without injected game state or balance changes.
- `scripts/incident-review-qa.mjs`: full normal investigations in all three engines, explicit renderer-ready synchronization and page-error checks; early canvas insertion alone is not a ready signal.

No new runtime dependency, gameplay mechanic, save identifier, deployment or commit. Earlier v1.1 build/performance figures are historical; the follow-up resolution report contains final measurements.

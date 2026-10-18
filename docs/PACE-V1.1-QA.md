> Follow-up completed: default-off opt-in, semantics/narrow layout, fresh five-level victory and full three-engine investigations are now verified. Final suite: **84 passed**. See [PACE-V1.1-RESOLUTION.md](PACE-V1.1-RESOLUTION.md); initial snapshot below is preserved as historical evidence.

# PACE v1.1 QA

18 October 2026 (Asia/Kuching). Local final production preview: `http://127.0.0.1:4173`. Temporary tools: `/private/tmp/pace-qa`; Firefox/WebKit downloads: `/private/tmp/pace-browsers`. No new application dependency, lockfile change, deployment or production setting change.

## Build and automated checks

| Command | Result |
| --- | --- |
| `npm run typecheck` | Passed (also included in final build) |
| `npm run lint` | Passed |
| `SWC_NATIVE_BINDING_CACHE=/private/tmp/pace-swc npm run build` | Passed; all five routes plus static 404 generated |
| `npm test` against final build | **79 passed, 0 failed, 0 skipped** |
| `git diff --check` | Passed |

The writable SWC cache is the same local sandbox workaround as PACE v1, not a production configuration. Public GitHub refresh reused recent verified snapshots when fresh requests failed; no fresh visibility verification is claimed. Optional Phaser chunk warning remains; game runtime stays lazy.

New tests cover safe known commercial hashes, generated evidence destinations, NTM summary/date limitations, route social assets/metadata, disabled automatic capture/replay and bounded preview-mode events. Existing simulation/save/theme/reading/hydration/route tests remain passing. The production asset test now checks URL pathname rather than treating a query-bearing preview URL as a filesystem path. The main bundle budget remains **215,000 bytes**.

## Browser matrix and route checks

Installed Chrome (Chromium channel), Firefox 157.0 and WebKit 27.2 engines were actually run. WebKit is engine coverage, not a claim of testing the shipping Safari app or iOS device.

Each engine passed the expanded `scripts/pace-qa.mjs` matrix:

| Desktop | Mobile/tablet |
| --- | --- |
| 1280×720 | 320×568 |
| 1440×900 | 375×667 |
| 1920×1080 | 390×844 |
| | 768×1024 |
| | 1024×768 |

Light and dark at all eight sizes, plus Largest at 320px in both themes: **18 layout combinations per engine, 54 total**. System preference follows emulated light/dark changes. Reduced motion enabled for matrix checks; navigation suite separately covers non-reduced motion at desktop. Chrome/WebKit use touch-capable contexts on smaller widths; Firefox's unsupported hasTouch context option is omitted.

All five route landings/reloads at 375px, one h1, local resources, no horizontal overflow, no unexpected page errors, and JavaScript-disabled static content passed in each engine. Native mobile menu selection/Escape, skip-link focus, visible focus styles, native disclosure keyboard operation/exclusivity and hero Contact journey passed. macOS WebKit defaults omit links from plain Tab; the harness uses its native Option-Tab link navigation. No operating-system preference was changed.

`scripts/pace-navigation-qa.mjs` verifies all six commercial direct fragments and reloads, exclusive opening, history back/forward, unrelated/unknown hashes, keyboard-activated principles, every Work With Me evidence link, NTM ten-link contents, eleven linked images, chart scrolling, no overflow, no-JS and forced lazy-route error/retry. Browser checks identified Firefox Enter clicks with detail=1; the corrected input-modality handling restores heading focus. Bottom-of-document targets are tested against the reachable scroll limit, not an impossible fixed top position. NTM summary Largest-text results and exact counts are in each navigation results JSON.

Without JavaScript, automatic commercial expansion is unavailable: card summary remains readable and native details opens manually. All five routes keep meaningful static landing content; gameplay itself requires JavaScript.

## Accessibility

Axe found **zero detected violations** across all 54 homepage combinations, fifteen route checks and recruiter-preview report checks. Incomplete checks include `color-contrast` and, in some contexts, `aria-prohibited-attr`. Full WCAG conformance, exhaustive manual contrast review and screen-reader testing are **not** claimed.

Forced lazy-route failures (Work With Me/NTM) expose a focused error heading and Retry; retry loads actual content. Forced Incident map download failure preserves usable simplified inspection; forced Defence renderer failure exposes retry and return links. These intentional aborts are not counted as unexpected application errors.

Visual review includes branded social artwork, desktop and mobile NTM summary, existing homepage/route captures and keyboard focus behavior. Botanic artwork, typography, themes, reading controls and native interactions are retained.

## Gameplay journeys

`scripts/pace-game-qa.mjs` passed on all three engines:

- **9 recruiter preview journeys per engine (27 total)**: 320/390/1280 widths × three advertised outcomes; fresh entry and reload, explicit demonstration/no-credit label, no Archaeologist award, no canvas, report focus, résumé/CV/booking/work links, replay reset, simplified navigation/help focus and return path.
- Chrome/WebKit use simulated touch at narrow widths and keyboard at desktop. Firefox uses keyboard, not simulated touch. None is physical-device testing.
- **2 Defence flows per engine (6 total)** at 390/1280: start/focus, tool switching, paused pixel freeze, resume, checkpoint reload, same-seed restart and return links.
- **2 forced renderer failure/recovery paths per engine (6 total)**, plus JavaScript-disabled preview entry explanation.
- No unexpected JS errors; zero detected preview axe violations. Some contrast checks remain incomplete.

Additional existing Chrome harnesses ran against the development server using the same game implementation:

- `QA_INCIDENT_NORMAL_ONLY=1 node scripts/incident-review-qa.mjs`: all **three normal main endings** through actual investigation; full-evidence additional insight, partial-evidence variant without that award, all three existing chooser previews, replay, report focus/position, refresh and three renderer teardown cycles without listener growth. The initial combined responsive suite passed 360/390/430 before a later canvas initialization timeout; fresh-process normal suite passed. This is not a claim that the interrupted combined run passed every size.
- `node scripts/defence-stage2-qa.mjs`: 390×844, 844×390, 768×1024, 1280×800; simultaneous touch/cancel, blur pause, paused frames, corrupt/old/unsupported/blocked session storage, unavailable randomUUID, actual defeat and same/new-seed retry, stored intermission/victory fixtures and idempotence, visible final controls and five renderer lifecycle cycles.
- `node scripts/defence-checkpoint-qa.mjs`: actual level-three kill and damage reverted together on reload (provisional score 2800/integrity 1/alive 8 → committed score 2650/integrity 2/alive 9), preserving completed floor records. These are synthetic game test values, not commercial metrics.
- A fresh five-level ordinary-controls Defence playtest stalled with unchanged actor/threat state and was terminated. Cause was not established (automation/focus/navigation load is a hypothesis). **No fresh complete five-level combat victory is claimed.** Completion/victory are covered by deterministic simulation tests and real UI restoration from stored fixtures, not by a new full browser combat playthrough.

Firefox/WebKit deep normal-investigation and complete combat runs were not performed; their focused preview/Defence flows above passed. No game mechanics or saved identifiers were changed to make tests pass.

## Performance and bundles

Final local mobile Lighthouse 12.8.2: **99 Performance / 100 Accessibility / 100 Best Practices / 100 SEO**. FCP 1.6s; LCP 1.7s; CLS 0.002; TBT displayed 10ms. No run warnings. Compact measured report: `PACE-V1.1-LIGHTHOUSE.json`.

| Main client asset | PACE v1 baseline | Final | Delta |
| --- | --- | --- | --- |
| Raw bytes | 213,472 | 208,408 | **−5,064 (−2.37%)** |
| Gzip bytes (same Python gzip settings) | 64,765 | 64,284 | −481 |
| Existing raw budget | 215,000 | 215,000 | Unchanged |

The initial expanded build was about 217.84KB. Rather than raise the guard, Work With Me was split into an approximately 10KB lazy route with full build-time prerendering; compact homepage labels avoid importing its detailed copy. Social images total 139,501 bytes (45,396–47,487 each), are below 48KB each and are metadata assets, not eagerly loaded homepage images.

Lighthouse is one **local laboratory sample** under mobile emulation/simulated throttling, with other audit tools potentially affecting machine load. Historical 98 → current 99 is not evidence of a repeatable real-user improvement. No production field LCP/CLS/INP percentile or Core Web Vitals pass is asserted. TBT is not INP. No recruiter timing or conversion lift measured.

## Read-only production checks

The web reader could not access the domain/résumé. Separate actual HTTP/browser checks succeeded:

- All five deployed routes returned HTTP 200, loaded/refreshed with one h1 and expected canonical; sampled major script/image assets returned 200; no JS page errors observed.
- Unknown `/pace-v11-unknown-route` returned **404**, no canonical and `noindex, follow`.
- Cal.com discovery, hosted résumé, full CV and itch.io URLs returned 200. No booking, email send, provider form submission or PDF export performed.

The live version retains the earlier NTM title. These checks concern the currently deployed portfolio **before PACE v1.1**, not successful publication or verification of undeployed changes.

## Analytics review and measurement

Canonical host, production-only, webdriver and DNT exclusions remain fixture-tested. Pageviews/leaves and existing named events are retained. Automatic click/form capture and replay are disabled; legacy recording flag cannot enable it. URL/referrer properties are denied. Incident entry records only bounded `play`/`preview`, not query context. No live analytics query or ingestion check performed (automated/local QA is deliberately excluded).

| Journey | Available observation | Interpretation |
| --- | --- | --- |
| Homepage → selected work | `/` pageview then `section_viewed` work; optionally `case_study_opened` | Exposure/opened evidence, not necessarily CTA click or comprehension |
| Homepage → résumé | `resume_clicked` with home page path / placement | Intent, not confirmed download |
| Homepage → contact | `section_viewed` contact, then named email/copy/booking event | Section exposure then possible contact intent; no dedicated hero-click event added |
| Work With Me → evidence | Work With Me pageview followed by relevant destination page/section/disclosure event in same session | Navigation evidence; SDK startup timing can miss an automatic initial disclosure event, so not a guaranteed click count |
| Work With Me → booking | `booking_clicked` with Work With Me page path | Outbound intent, not completed booking |
| NTM engagement | `ntm_case_study_clicked`, NTM pageview / `section_viewed`, `external_project_clicked` | Reading/experience signals, not technical understanding |
| Incident preview | Existing `incident_zero_clicked` with bounded mode=preview | Shortcut intent; direct preview visits are not separately counted by query data |

No parallel event taxonomy/vendor or unnecessary event stream. DNT is **not** comprehensive consent; jurisdiction, audience and privacy policy remain owner review. Data minimization here is not a legal compliance guarantee. SDK identifiers are pseudonymous, not a claim of anonymous collection.

## Artifacts and reproducibility

- `output/playwright/pace-v1.1/layout-{chromium,firefox,webkit}/results.json` and screenshots.
- `output/playwright/pace-v1.1/navigation-{chromium,firefox,webkit}/results.json`, summary screenshots.
- `output/playwright/pace-v1.1/games{,-firefox,-webkit}/results.json` and report captures.
- `output/playwright/pace-v1.1/incident-normal/results.json`.
- `.qa/defence-stage2/browser-results.json`, `checkpoint-results.json` (ignored local synthetic QA artifacts).
- `output/playwright/pace-v1.1/live/results.json`, `production-http.json`.
- Full temporary Lighthouse JSON: `/private/tmp/pace-v11-lighthouse.json`; compact source-controlled report alongside this document.

See IMPLEMENTATION and README for commands and engine configuration. Generated browser outputs are ignored, not confidential reports committed to git. Remaining limitations: physical devices, screen readers, full manual WCAG review, production consent/legal assessment, fresh full-combat victory, deeper Firefox/WebKit investigations, fresh owner employment confirmation, live event delivery and real-user measurements.


## Remaining-issue follow-up

All current final results are recorded in RESOLUTION. The former fresh five-level and deeper Firefox/WebKit investigation limits are resolved. Explicit permission now gates SDK download/activation, manual pageview, named listeners and tab-scoped persistence; withdrawal and SDK-download races are fixture-tested, while real browser controls pass three engines. The subsequent device/PDF retry in RESOLUTION supersedes the original unavailable status: official résumé PDF acquisition and visual verification now pass. Actual device/screen-reader test scope and remaining field metrics are recorded there.

Final main asset 210,554 bytes raw / 65,050 gzip, budget unchanged; final local Lighthouse 99/100/100/100, LCP 1.8s, CLS 0. Ten final route/theme accessibility reviews pass with no violations/prohibited-ARIA incompletes; 258 contrast samples and ten reflow checks pass. Code/tests and targeted browser commands are in RESOLUTION and IMPLEMENTATION.

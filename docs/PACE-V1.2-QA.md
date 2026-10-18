# PACE v1.2 — QA

Executed 18–19 October 2026 (Asia/Kuching). Owner inventory/authorization is dated 18 October. Tests target locally served production build output, not the hosted portfolio. No deployment was performed.

## Build and automated verification

| Check | Observed result |
| --- | --- |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed. |
| `npm run build` | Passed: public export, client build and all static routes prerendered. Existing large optional-game chunk advisory remains; no new dependency was added. |
| `npm test` | **115 passed, 0 failed**: existing 107 tests plus 8 technology tests. |
| `npm run export:technology` | Repeated regeneration produces the same export hash. Public and shipped JSON match. |
| New inventory checks | Exact six-project technology membership, no extra assignments, explicit education generations/versions, generated `Project.stack`, original sorted work order, Microsoft 365 narrative, historical Hostel limitations, no fabricated Asset metadata, name normalization, URLs/provenance/hashes, unique/valid anchors, static per-project stacks and unchanged bundle ceiling. |
| `git diff --check` | Passed. |

The first new test mistakenly expected declaration order rather than the existing `projectIds`-sorted order. The assertion was corrected to the unchanged actual hierarchy: insurance, WenSymes, campus, rental, meetings, HR. No project reordering was introduced to satisfy the test.

## Browser coverage

The final built portfolio was served at `http://127.0.0.1:4175` because existing servers occupied 4173/4174; those servers were not stopped. Tooling is the existing optional Playwright/axe installation outside production dependencies. Browser: local installed Chrome/Chromium; widths are emulated CSS viewports, not physical devices.

- `scripts/technology-qa.mjs`: seven widths **320, 375, 390, 768, 1024, 1440, 1920**, light/dark, Default/Largest. Each checks all six represented stacks through native keyboard disclosures. No technology-group or document horizontal overflow, hydration/console errors or failed local resources. Education has two visible generation groups. Both additional systems remain readable.
- The same script with `QA_TEXT_SIZES=large` separately passed **14 Large-text combinations** at all seven widths and both themes, because Large retains multi-column layouts that Largest intentionally changes. Together the focused checks cover **42 width/theme/text combinations** with no overflow or browser errors.
- Direct links reveal all four enriched existing cases plus `system-hostel` and `system-asset`. New and existing details preserve exclusive engineering-disclosure behavior. All six technology summaries and native disclosures are usable with JavaScript disabled.
- Four targeted expanded-panel axe reviews cover education, WenSymes and additional systems in light/dark and Largest text. The new named technology containers use an explicit `role="group"`.
- Existing `scripts/pace-qa.mjs`: **18 layout/theme/text combinations**, five static/direct/reloaded routes, five JavaScript-disabled routes; zero axe violations, page errors or failed local resources. Includes skip link, menu, focus, disclosure exclusivity, display preference/theme switching and contact navigation.
- Existing `scripts/fragment-qa.mjs`: **40 fragment-position checks** passed at 375/1440, normal/reduced motion, direct visits, refresh, same-page and cross-page links.
- Existing `scripts/pace-game-qa.mjs`: nine recruiter-preview journeys at 320/390/1280, two System Defence start/control/pause/resume/checkpoint/restart/return journeys, two simulated chunk-failure recovery journeys; no page errors or axe violations. Touch is simulated. It does not claim an exhaustive rerun of every game campaign.
- Existing `scripts/baa-qa.mjs`: **24 layout/theme/text checks**, two motion lifecycle checks, canvas/renderer failures and two no-JavaScript widths passed. Forest/river code and portrait production placement are untouched. Its isolated candidate-comparison captures are harness experiments, not deployed visual changes.
- Existing `scripts/pace-accessibility-review.mjs`: **10 route/theme reviews**, **10 reflow checks**, **258 computed contrast samples**, Largest-text display/consent bounds. Passed after correcting the harness's handling of Chrome `color(srgb ...)` serialization. The old RGB-only parser treated normalized sRGB components as 0–255, producing a false portrait-caption contrast failure; no production color was changed for this result.

Whole-page axe retains incomplete color-contrast findings on decorated content; these are not silently called passed pixel-level contrast. The targeted existing review bounds selected text/backgrounds and grid overlays. There was no actual screen-reader session, physical-device session, browser-native zoom certification or additional-engine certification in this update.

## Screenshots inspected

Under `output/playwright/pace-v1.2/`:

- `campus-1440-light-default.png`: existing conceptual project panel plus quiet technology groups; distinct legacy/modern labels.
- `campus-320-dark-largest.png`: expanded legacy/modern text wraps without overflow at Largest.
- `wensymes-390-light-largest.png`: existing Microsoft 365 narrative and separately grouped confirmed application/cloud inventory.
- `additional-320-light-largest.png`: Hostel historical note and descriptive repository link; Asset stack without invented metadata.
- `campus-mobile-dark-largest-viewport.png`: manually inspected viewport capture below the sticky header. Long full-element mobile captures contain a sticky-header stitching artifact; this viewport capture distinguishes the actual reading layout from that screenshot artifact.

Existing whole-home and scenery screenshots are retained in `existing-pace/` and `scenery/`. These are local generated QA artifacts, not public employer screenshots. No architecture image or private system screenshot was introduced.

## Static rendering and export

`dist/index.html` contains every confirmed technology under its correct project anchor, native disclosure markup, education generation labels, Hostel note and owner attribution. Static source and browser no-JavaScript checks passed. Existing role dates/titles, hero, navigation, game routes and selected-work order are unchanged.

`dist/evidence/technology-experience.v1.json` matches the public generated artifact. Schema version 1 / content version `pace-technology-v1.2`; six records; outer SHA-256 `5640d20f34302f5cba7caf11fcc7e95b366dda42079d9f0d2c43a5ae2999e9f8`. Per-record hashes and canonical anchors pass. The homepage does not fetch/preload this JSON; the shared typed content module is the single runtime mapping.

## Bundle measurements

| Artifact | Raw bytes | gzip level 9 |
| --- | ---: | ---: |
| Reviewed baseline main entry | 213,064 | Not remeasured here |
| Initial unsplit PACE v1.2 main | Approximately 217.82 kB (build output), over budget | Not retained as a release artifact |
| Final main `index-Buvkjbia.js` | **205,843** | 63,680 |
| Shared `portfolio-content-BWDNJbRU.js` | 12,531 | 4,126 |
| Existing Rolldown runtime | 716 | 430 |
| Final main + initial modulepreloads | **219,090** | Separate compressed assets above |

The strict main ceiling stays **215,000 raw bytes**, with 9,157 bytes headroom. Content splitting moves existing and new public content to a shared static module; it does not reduce total startup bytes. It adds one preloaded content request while retaining deterministic SSR/hydration and existing lazy game/analytics boundaries. No Lighthouse or field-performance improvement is claimed.

## Reproduce

```sh
npm run typecheck
npm run lint
npm run build
npm test
npm run preview -- --host 127.0.0.1 --port 4175
# In another terminal, with the existing optional QA tooling installed:
QA_URL=http://127.0.0.1:4175 node scripts/technology-qa.mjs
QA_URL=http://127.0.0.1:4175 QA_TEXT_SIZES=large QA_OUTPUT_DIR=output/playwright/pace-v1.2/large node scripts/technology-qa.mjs
QA_URL=http://127.0.0.1:4175 QA_OUTPUT_DIR=output/playwright/pace-v1.2/existing-pace node scripts/pace-qa.mjs
QA_URL=http://127.0.0.1:4175 QA_MODULES_DIR=/private/tmp/pace-qa node scripts/fragment-qa.mjs
QA_URL=http://127.0.0.1:4175 QA_OUTPUT_DIR=output/playwright/pace-v1.2/games node scripts/pace-game-qa.mjs
QA_URL=http://127.0.0.1:4175 QA_OUTPUT_DIR=output/playwright/pace-v1.2/scenery node scripts/baa-qa.mjs
QA_URL=http://127.0.0.1:4175 QA_OUTPUT_DIR=output/playwright/pace-v1.2/accessibility-review node scripts/pace-accessibility-review.mjs
```

Optional QA modules default to `/private/tmp/pace-qa` and can be selected with `QA_MODULES_DIR`. Their presence is not required by the production build. Raw new Node/bundle/source-review evidence is ignored in `output/pace-v1.2/`; browser results/screenshots are ignored under `output/playwright/pace-v1.2/`.

## Remaining limits and readiness

Ready for owner code/content review and a separately authorized deployment. No production deployment, resources, CI publishing changes, new AI service, embedding generation or independent PACE-RAG edits were made. Existing uncommitted BAA documents were preserved. Public hosting headers/404 behavior were not verified remotely.

The independent RAG cache can still contain older “stack not established” answers. The new export does not update those records automatically. A separate, reviewed ingestion/version migration is required as documented in IMPLEMENTATION. No unsupported architecture, employer for Asset, hosting vendor, technology version, scale, certification or infrastructure-ownership claim has been added.

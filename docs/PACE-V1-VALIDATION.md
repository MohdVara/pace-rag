# PACE v1 validation

Completed 18 October 2026 (Asia/Kuching). Scope: local final production build; no deployment or commit. Temporary browser audit tools installed outside project dependencies in `/private/tmp/pace-qa`. No application dependency or lockfile changed.

## Build and automated checks

- `SWC_NATIVE_BINDING_CACHE=/private/tmp/pace-swc npm run build`: PASS, including TypeScript, Vite client build, SSR and five static routes plus 404.
- Initial plain build failed because SWC could not access its default native-cache lock under the restricted sandbox. Setting a writable temporary native cache resolved it; no build configuration workaround was committed.
- `npm run lint`: PASS on final source and QA script.
- `npm test`: **73 passed, 0 failed, 0 skipped** on final build. Covers existing game simulations, persistence, route metadata/static content, fragments/assets, source privacy, reading/theme preferences, public GitHub filtering and analytics. New bootstrap tests verify every static route hydrates, development roots render, and missing-page fallback remains correct. NTM link events have behavioral tests.
- `git diff --check`: PASS.
- Build public GitHub refresh used the existing recent verified snapshots because unauthenticated retrieval was unavailable in the build environment. This was not new verification of repository visibility.
- Existing optional Phaser chunk still exceeds Vite's 500kB warning threshold. It remains lazy and absent from homepage preload. This pass does not refactor game engines.
- Main client chunk is approximately 213.5kB raw / 65.6kB gzip; content budget raised from 211kB to 215kB for the added bounded commercial summary and linked decision examples. No heavy library was introduced.

## Browser and accessibility

`QA_MODULES_DIR=/private/tmp/pace-qa node scripts/pace-qa.mjs`: PASS against `http://127.0.0.1:4173` using installed Chrome.

- Homepage widths: **320, 375, 768, 1024, 1440px**, light and dark. At 320px, Largest text also checked in both themes (12 layout combinations).
- No document horizontal overflow, JavaScript page errors or failed local resource responses observed.
- Keyboard skip link moves focus to main; native mobile menu opens/closes, selection closes it, Escape returns focus. All commercial disclosures operate by keyboard and remain exclusive. Primary hero CTA reaches Contact.
- Axe: **zero detected violations** in each layout combination and all five mobile route landings. Some `color-contrast` and `aria-prohibited-attr` checks remain incomplete; automated results do not constitute exhaustive WCAG conformance.
- Initial test found an inaccessible image in the external itch.io store iframe. Replaced that widget with the existing reviewed local screenshot, an accurate historical caption and retained direct project link. Game access is preserved.
- Full rule scan identified visible/accessibility-name mismatch in the mobile wordmark and GitHub source links. Corrected names to include visible text and reran successfully.
- Browser screenshots visually inspected: desktop hero, 320px hero, desktop commercial cards and mobile NTM architecture. Brand, reading hierarchy and native focus indicators remain visible.
- Existing `/`, `/work-with-me/`, `/no-two-mondays/`, `/incident-zero/`, `/incident-zero/defence/`: direct loads and reloads return local HTTP 200, one h1 and no horizontal overflow at 375px. Axe route checks pass.
- JavaScript-disabled browser checks: all five routes retain one h1 and readable static landing content; WenSymes disclosure opens natively. Games themselves require JavaScript.
- Existing production artifact tests verify canonical/metadata/schema, sitemap, route styles/assets, unique fragments, 404 noindex and lazy game boundaries. Browser additionally visits the NTM architecture fragment. This is not an exhaustive click of every link on every route.
- Browser checks use reduced motion; existing motion implementation was preserved. No new animation added.

Results and screenshots: `output/playwright/pace/results.json`, `home-*-*.png`, `desktop-viewport.png`, `ntm-architecture-mobile.png`. The QA script is repeatable; the results JSON records incomplete accessibility checks explicitly.

## Performance: laboratory only

Final Lighthouse **12.8.2**, mobile emulation against local Vite production preview, default simulated throttling, 18 October 2026. Summary: `PACE-V1-LIGHTHOUSE.json`.

| Category / lab metric | Final result |
| --- | --- |
| Performance | 98 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| First Contentful Paint | 1.5s |
| Largest Contentful Paint | 1.9s |
| Cumulative Layout Shift | 0 |
| Total Blocking Time | 10ms |

No Lighthouse warnings. These are one local laboratory sample; concurrent tools, cache, machine load and network differ from production. An earlier updated-build sample scored Performance 95; this variation is not evidence of a measured optimization gain. No original-build baseline was measured. No 75th-percentile field LCP/CLS, INP or real-user Core Web Vitals pass is claimed. TBT is not INP. Production CDN/cache behavior was not measured.

## External paths and measurement

Public HTTP GET checks returned **200** for the existing Cal.com discovery URL, hosted two-page résumé, full CV and NTM itch.io project. This verifies availability at check time only; résumé content/PDF export quality and booking/email completion were not tested. No appointment submitted or email sent.

PostHog production ingestion was not exercised locally: canonical-host, automation and DNT gates remain. Event fixtures pass; use the evidence register's definitions for an authorized production check. No live analytics or conversion-rate data was queried.

## Remaining limitations and recommendations

- Deeper WenSymes engineering detail needs owner-confirmed evidence and disclosure permission. Laravel 12, leave/payroll delivery, tests and measurable outcomes were deliberately omitted. Current summary is bounded and suitable for review.
- Existing professional claims retain prior owner-supplied provenance; the public web reader could not freshly read the hosted documents. Public HTTP 200 is not independent fact verification.
- No physical device, Safari/Firefox, screen-reader session, human recruiter usability research, exhaustive manual contrast audit or live production smoke test performed.
- Existing gameplay logic was untouched. Portfolio simulation tests pass; this task did not rerun NTM's separate game repository tests or replay the historical eight-hour campaign.
- Both GitHub Pages and Cloudflare deployment workflows exist. No remote host settings were changed. Preview fallback behavior does not verify Cloudflare's production 404 status/headers.

## Before vs. after (qualitative unless stated)

| Before | After |
| --- | --- |
| Work-first hero, résumé secondary | Opportunity/contact first, engineering work secondary, hosted résumé tertiary |
| Campus leads; no current WenSymes case | PolicyStreet flagship, WenSymes bounded case, discreet education case |
| Roles require reading expanded copy | Role metadata visible on every commercial card |
| Engineering judgment scattered through longer copy | Three linked decision examples in existing Capabilities section |
| Homepage NTM described chiefly as an office story | Systems/verification framing with separate engineering and experience links |
| External itch.io store iframe with axe image-alt failure | Local reviewed image with alt/caption; direct itch.io access retained |
| NTM absent from hydration allowlist | NTM uses static-content hydration, covered by runtime tests |
| NTM clicks absent from named funnel | Distinct case-study and external-project events in existing vendor |

## Deployment readiness

**Ready for owner review and normal deployment; not deployed.** No failing local check blocks the scoped changes. Omitted evidence-dependent enhancements are future work, not fabricated placeholders.

Review the diff and content registers, use the established deployment target, rebuild/validate in CI, and deploy the generated `dist` only after explicit authorization. For Cloudflare, the existing `npm run deploy:cloudflare` rebuilds before publication; do not also publish through the other provider. After deployment, smoke-test all five direct routes, 404 status, résumé/booking links and privacy-respecting analytics. Retain the previous deployment for rollback.


## Modified implementation files

- `src/App.tsx`: CTA hierarchy, visible project roles, linked decision examples, navigation attribution, accessible wordmark name.
- `src/content.ts`: commercial ordering, bounded WenSymes case, discreet education copy, explicit role metadata.
- `src/SystemDiagrams.tsx`: WenSymes conceptual scope visual, generalized education descriptions, clear conceptual captions.
- `src/EngagementContent.ts`: generalized education proof reference.
- `src/NoTwoMondays.tsx`, `src/App.css`: engineering framing, local preview and historical caption; direct experience link retained.
- `src/Readability.css`: responsive decision examples using existing tokens.
- `src/PublicEngineering.tsx`: GitHub accessible link names include their visible wording.
- `src/main.tsx`: recognize NTM as a prerendered route for hydration.
- `src/analytics.ts`: two allowlisted NTM interaction events; existing privacy gates unchanged.
- `tests/hydration.test.mjs`, `tests/analytics.test.mjs`, `tests/production.test.mjs`: bootstrap regression, new event behavior, revised confidentiality/content and bundle checks.
- `scripts/pace-qa.mjs`: repeatable responsive, keyboard, route, no-JavaScript and axe checks.
- `README.md`, `docs/content-sources.md`: current workflow and provenance boundaries; historical analytics statements clarified.
- `docs/portfolio/PACE-V1-{AUDIT,CONTENT-EVIDENCE,CONFIDENTIALITY-REVIEW,VALIDATION}.md`, `PACE-V1-LIGHTHOUSE.json`: required review documents and compact lab measurement.

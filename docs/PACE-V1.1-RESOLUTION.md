# PACE v1.1 remaining-issue resolution

18 October 2026, Asia/Kuching. This follow-up supersedes the pending items in the initial v1.1 reports. Existing uncommitted work was preserved. Nothing committed, pushed, deployed or changed in production infrastructure.

## Resolved

| Previously remaining | Resolution / evidence |
| --- | --- |
| Current employment and title ambiguity | Owner explicitly confirmed WenSymes Principal Full Stack Developer since March 2025; Centre for Content Creation Principal Full Stack Engineer since June 2022; Tertiary Courses Technical Trainer since June 2018; all still current. Campus contribution now consistently says Engineer. This is owner verification, not independent employment certification. |
| WenSymes case too generic | Owner supplied current CV and identified its Confidential entry as WenSymes. Fresh browser review supports internal HR/operational administration tools, full-stack web, Google Cloud, Microsoft 365, and planning around data consistency, access control and uptime. Case text and technology summary now use these facts only. No Laravel version, payroll, module internals, security implementation or invented outcomes. |
| Analytics lacked explicit visitor choice | Display includes accessible default-off Usage analytics checkbox and notice. No SDK request before permission. Withdrawal removes named listeners/observers and opts out SDK capture/persistence; regrant does not duplicate tracking. Local choice persists; blocked storage defaults off with explicit memory-only choice. Cross-tab withdrawal/storage clearing resync. DNT/GPC override opt-in. Analytics data uses sessionStorage only after grant; automatic capture/replay remain disabled. |
| Consent race while SDK downloads | Eligibility is checked again after import and before activation; withdrawal during download prevents SDK initialization/pageview. Unit test exercises this race. |
| ARIA incomplete findings | Engineering-principles container is now a labelled section. Defence HUD is a labelled group; decorative integrity diamonds are hidden with readable integrity text. Final ten route/theme scans have zero axe violations and no prohibited-ARIA incomplete findings. |
| Manual contrast/reflow review | 258 computed samples of previously incomplete text/overlay cases pass at least 4.5:1; reviewed homepage minimum 5.06:1 light, 7.36:1 dark. Decorative SVG/arrows distinguished from meaningful content; ending chart reaches final row. Ten reflow checks pass. This is bounded browser/DOM review, not full rendered-pixel or screen-reader certification. |
| Narrow Largest-text header overlap | Actual monogram/Display overlap found at 320px. Hide only decorative Aa at <=375px/Largest; keep visible Display label. Final controls no longer overlap, and preference panel fits/scrolls within 320×568. |
| Fresh full Defence victory unverified | Harness previously sent keyboard controls without focusing arena. Harness now explicitly focuses it. A stable, fresh unseeded run cleared all five floors via ordinary keyboard/pointer controls, both tools, no injected game/session state, zero defeats/page errors. Score 9550, final integrity 2, completion count 1. Actual intermission/final reloads preserve totals. 94.5s is automation time, not human playtime. No balance/scoring/mechanics changes. |
| Deep normal Incident journeys only Chrome | Chromium, Firefox and WebKit each pass three complete investigations, partial-evidence reconciliation, three previews, replay isolation, report focus/links, route reload and three paused-renderer teardown cycles, with no page errors. Harness waits actual renderer readiness rather than mere canvas insertion, avoiding premature teardown during asset loading. |

## Final validation

- Build including TypeScript: **PASS** (`SWC_NATIVE_BINDING_CACHE=/private/tmp/pace-swc npm run build`).
- ESLint: **PASS**.
- Automated tests: **84 passed, 0 failed, 0 skipped**.
- Final targeted accessibility review: **10 route/theme scans, 258 contrast samples, 10 reflow checks, 2 narrow preference journeys passed**.
- Consent browser checks: Chrome/Firefox/WebKit each pass 320×568 and 1440×900, light/dark at Largest; default off, remembered grant, cross-tab withdrawal, keyboard control and no SDK requests from excluded local/automated contexts. Unit fixtures separately cover canonical-production eligibility, actual activation and revocation/races.
- Main client: **210,554 bytes raw / 65,050 gzip**, under unchanged **215,000-byte** ceiling. Relative to initial v1.1, +2,146 raw bytes for explicit permission lifecycle/UI and evidence/semantic corrections. Relative to PACE v1: −2,918 raw bytes; gzip +285 bytes using the same compression settings. No runtime dependency added.
- Final local mobile Lighthouse: **99 Performance / 100 Accessibility / 100 Best Practices / 100 SEO**, LCP 1.8s, CLS 0, TBT displayed 10ms; no warnings. `PACE-V1.1-RESOLUTION-LIGHTHOUSE.json` records exact lab values. Not a field Core Web Vitals/INP or conversion measurement.
- `git diff --check`: passed.

The interruption had stopped the local preview server. First resumed browser attempts returned connection-refused; restarting preview and rerunning all final checks succeeded. These failed attempts were environmental and are not reported as passes.

## Source and technical decisions

The owner's current role confirmation takes precedence over earlier CV title variants. Naming the Confidential CV engagement WenSymes was explicitly owner-provided. Older 2016–2017 HR work remains separately attributed. Internal rules, records, infrastructure configuration and architecture remain omitted.

The current CV describes RAG knowledge/onboarding tools as being built. Reviewed public repositories/profile scope did not provide a reproducible RAG artifact. The portfolio continues to distinguish professional capability/in-progress work from public production evidence. No RAG demo or production claim is invented to fill a gap.

The analytics control removes the prior absence of explicit choice. Its notice states provider, purpose, fields, tab storage, exclusions and withdrawal. This is a technical opt-in implementation, not jurisdiction-specific legal certification or a claim that already delivered analytics data is deleted remotely. No live event ingestion or provider configuration was changed.

## Device and PDF retry — 18 October 2026

The official two-page résumé export is now acquired and verified. Its Download PDF button appears before page rendering finishes; waiting for both rendered pages before activating it returned the official file in two independent browser attempts. Both exported pages were rendered using PDFium and visually inspected: readable text, no visible overlap or clipping. The reviewed file is 90,707 bytes, SHA-256 `3ed01cba5f75438e9d793c133fef2acc07f1242d425447c03565591dcc0fa0f8`. The unchanged source is saved locally at ignored `output/pdf/Mohd-Paramasvara-Resume.pdf`; QA evidence is in ignored `.qa/resume-export-retry/`.

This resolves export acquisition and layout verification. It does not revise the source CV or publish its content. Existing source title/Confidential labels and the broader historical education detail have not been silently rewritten or added to the portfolio. `profile.resumePdf` remains null pending owner review of the source for public distribution. Hosted résumé/CV links remain functional.

## Still external or unavailable

| Item | Exact boundary |
| --- | --- |
| Physical-device and actual VoiceOver testing | Retry detected a paired physical iPhone 12 Pro Max in both Apple device tools and native Safari. After the owner corrected the iPhone setting, Safari changed its status to “No inspectable contents”. The owner then confirmed the current-build LAN preview loaded in Safari on the physical phone; repeated native inspector/Develop checks still exposed no webpage target. This establishes owner-observed physical-device loading, but navigation, reflow and interactions remain unverified. VoiceOver actually launched and navigation/rotor commands were attempted, but the automation surface exposed no verifiable announcements or rotor/cursor evidence. VoiceOver was restored to its original inactive state. No physical-device interaction suite or screen-reader pass is claimed. Browser engine/AX/keyboard checks remain separate. |

| Public RAG artifact | No suitable existing artifact found in bounded reviewed public scope. A separate genuine demo or owner-approved artifact would be future work; no private employer repository was inspected. |
| Field performance / recruiting outcomes | Requires actual production/visitor evidence; no invented Core Web Vitals percentile, conversion lift or comprehension timing. |

These are external validation/artifact requirements, not known failing code paths. No known remaining P0/P1 implementation blocker. Review the diff and use the established release workflow only after explicit deployment authorization.

## Artifacts

- `output/playwright/pace-v1.1/defence-full/playtest-results.json`, `level-{1..5}-result.png`.
- `output/playwright/pace-v1.1/incident-{chromium,firefox,webkit}/results.json`.
- `output/playwright/pace-v1.1/accessibility-review/results.json`, ARIA snapshots, contrast/reflow and narrow preference captures.
- `output/playwright/pace-v1.1/consent-{chromium,firefox,webkit}/results.json` and captures.
- `output/playwright/pace-v1.1/device-voiceover/retry-notes.md`: exact actual-device discovery, owner-observed load, remote-inspection and VoiceOver limitations.
- `output/pdf/Mohd-Paramasvara-Resume.pdf`, `.qa/resume-export-retry/`: ignored owner source and PDF verification artifacts.
- `tests/analytics-preference.test.mjs`, expanded `tests/analytics.test.mjs`; existing full production suite.
- `scripts/pace-accessibility-review.mjs`, `pace-consent-qa.mjs`; corrected normal Incident and full Defence harnesses.

Browser outputs and owner checklist remain ignored local artifacts. No confidential reports committed.

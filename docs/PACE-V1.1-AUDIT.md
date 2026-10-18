# PACE v1.1 delta audit

18 October 2026, Asia/Kuching. Starting branch `main`, commit `6ab946f`; working tree clean. PACE v1 source, five review documents, routes, build scripts, game UI/test harnesses, native disclosure conventions and current tests inspected. No deployment or infrastructure change authorized.

## Baseline

Five explicit routes in `Page.tsx` plus static 404; no additional route aliases found beyond optional trailing slashes. NTM now correctly hydrates from PACE v1. Existing tokens, Borneo SVGs, theme/text preferences, motion, lazy games, static SEO and commercial ordering remain strengths. Baseline main asset: 213,472 bytes from the existing PACE v1 build; 215,000-byte production test ceiling. Historical Lighthouse scores are not current measurements.

## Findings and decisions

| ID / priority | Route / existing behavior / evidence | Impact and confidence | Solution / risk | Verification |
| --- | --- | --- | --- | --- |
| NAV-01 / P1 | `/#case-*`: `Page.tsx` scrolls mount-time hash only; `App.tsx` details default closed | Confirmed source defect; evidence stays hidden and hash changes lack explicit handling | Validate against typed project IDs; open native exclusive disclosure before scrolling; handle direct load, hash changes and history; keyboard focus only on activated links / medium interaction risk | Direct/reload/cross-page/same-page/back-forward/keyboard/mobile/no-JS tests |
| EVD-01 / P1 | Work With Me uses repeated untyped `/#case-${proof}` strings; leadership points to rental, architecture diagnosis to low-detail campus | Confirmed relevance/maintainability gap | Central typed evidence destinations; strongest supported leadership/integration case PolicyStreet, modernisation campus, domain modeling rental, enterprise delivery WenSymes / low | Typecheck, all generated destinations and browser clicks |
| NTM-01 / P1 | NTM has extensive longform with tooling-first H1, no short structured executive summary | Confirmed editorial gap, comprehension benefit is hypothesis | Engineering-first headline; concise glance summary and integrated contents links; preserve every longform chapter/dated metric / low | Static output tests, keyboard/fragment/table/diagram review |
| INC-01 / P1 | Incident homepage callout exposes play while recruiter preview exists deeper in route | Confirmed discoverability gap | Secondary explicit preview path; validate fresh direct entry and each demonstration outcome / medium navigation risk, no mechanics changes | Normal/recruiter/simplified/replay/conversion/touch/focus journeys |
| AI-01 / P1 | Capability descriptions group RAG and AI-assisted engineering without evidence categories | Confirmed ambiguity, not proof of false professional experience | Label public NTM methodology separately from résumé-listed RAG/vector skills and proposed services; evidence checklist / low | Copy/provenance review, capability/service link tests |
| COM-01 / P1 | WenSymes case repeats broad ownership; historical education cards overlap but have different scopes/periods | Confirmed wording repetition; deeper responsibilities unverified | Tighten broad owner-sourced remit; explicitly separate consideration from implemented controls; retain historical entries and links, compact supporting summaries / low | No new stacks/modules/metrics, chronology and confidentiality review |
| ID-01 / P2 | Wensymes/WenSymes capitalization inconsistent; ongoing dates are prior owner record | Confirmed naming inconsistency; current employment status unverified | Consistent display name, preserve dates/status pending owner review; do not imply immediate availability / low | Shared content and provenance review |
| SEO-01 / P2 | Prerender routes inherit one social image | Confirmed metadata gap | Owned programmatic 1200×630 route previews and OG/Twitter alt, no fabricated screenshots / low | PNG inspection, generated metadata tests, size limits |
| ANA-01 / P1 | Production host/DNT/automation gates exist; autocapture is broad and replay can be enabled by environment without an explicit visitor permission control | Confirmed collection configuration; applicable consent jurisdiction unknown | Minimize to explicit portfolio intent events, exclude automatic form/game capture and replay; document that DNT alone is not comprehensive consent / medium measurement change | SDK fixture tests and config review; no live ingestion query |
| QA-01 / P1 | PACE v1 browser suite checks landings, not full user journeys; only Chrome previously checked | Confirmed coverage gap | Add navigation/evidence journeys and exercise existing deterministic game facilities; try available engines and report exact gaps / low | Expanded viewport matrix, engine results and named gameplay checkpoints |
| HOST-01 / P2 | Local preview fallback does not prove production 404 behavior | Confirmed validation boundary, live host status untested | Read-only deployed route/metadata/asset checks, record production separately / no remote mutations | HTTP statuses/refresh/unknown route check |

## Constraints

No game balance, narrative/scoring, saved identifiers, employment dates, testimonials, business metrics or proprietary architecture changes. Do not merge distinct education engagements or delete their public fragments. NTM historical verification stays date-scoped. Unsupported deeper WenSymes/RAG details and actual availability go to owner review without blocking safe work.

Audit recorded before shared navigation/content implementation. Independent route reviews report their findings as implementation proceeds; final status is reconciled in IMPLEMENTATION, QA and RESULTS.

## Final reconciliation

NAV-01, EVD-01, NTM-01, INC-01, AI-01 and SEO-01 are implemented and verified. COM-01 improves only supported broad copy and retains separate education histories; detailed claims are deferred. ID-01 naming is consistent, while current status/dates remain an owner check. ANA-01 disables broad capture/replay and excludes URL/referrer properties; applicable consent policy is not inferred. QA-01 now includes Chrome, Firefox and WebKit, eight viewports, real preview/evidence journeys and deterministic game checkpoint/failure/completion fixtures. A fresh full five-level combat run remains unverified after a stalled harness. HOST-01 current live status/canonical/assets/refresh and actual 404 checks passed read-only.

Final build/lint/79 automated tests pass; main JS 208,408 bytes under unchanged 215,000-byte ceiling; local Lighthouse 99/100/100/100. These figures are scoped in QA and do not establish production field performance or hiring outcomes. RESULTS classifies owner-dependent and remaining validation work. No new P0 blocker was identified, no employer detail invented and no production action performed.


## Remaining-issue follow-up reconciliation

Current-role/date uncertainty is resolved through explicit owner confirmation. WenSymes now uses the owner-supplied CV's confirmed Confidential entry, with broad approved tools/remit only. Analytics is off until explicit visitor permission; withdrawal/race handling and DNT/GPC are tested. ARIA and narrow Largest-text overlap defects found during review are fixed. Fresh full Defence victory and normal Incident investigations now pass all requested available engines (full Defence run Chrome; full Incident in three engines). Final build/lint/84 tests pass. See RESOLUTION for current measurements and genuinely unavailable external checks; earlier pending-game/role/choice entries are superseded.

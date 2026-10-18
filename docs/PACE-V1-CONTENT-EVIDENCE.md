# PACE v1 content evidence

Reviewed 18 October 2026 (Asia/Kuching). This register distinguishes source provenance from independent verification. Existing public copy is not proof by itself. No private employer repository, internal artifact, raw player record or chat transcript was used.

| Public claim / surface | Evidence category and source | Decision / limitation |
| --- | --- | --- |
| Principal full-stack engineer, technical lead, architecture; career since 2013 | Owner-provided professional history, previously reviewed and recorded in `docs/content-sources.md`; current user brief corroborates broad remit | Preserve existing positioning; no new credential or experience-year total |
| PolicyStreet role progression and provider rate normalization, quotation and issuance | Previously reviewed owner-supplied résumé/CV provenance in `docs/content-sources.md`; existing `content.ts` agrees | Reuse documented responsibilities; not a new independent verification; no integration count, financial result, traffic, team size or project-specific stack |
| WenSymes HR platform and principal full-stack contribution | Current owner brief identifies HR platform; prior source review explicitly records owner-authorized naming and principal role; existing experience supplies broad HR/administration remit | New bounded case summary; no detailed implementation, payroll, leave module delivery or Laravel version asserted |
| HR data consistency/access control | General engineering considerations, explicitly described as such in case text; existing role description mentions these concerns | Not a claim about implemented architecture, security controls or measured reliability |
| Education modernisation and leadership | Prior owner-provided résumé review and current brief; earlier narrower disclosure direction recorded in provenance | Broad responsibilities only. Generic project title; retain employer in accurate career history. No internal topology, workflow, storage or deployment details |
| Historical HR work (2016–2017) | Owner-provided résumé review in provenance | Keep separate from WenSymes; do not transfer past employer's work to current engagement |
| Rental ownership and 20+ properties | Owner-provided résumé review in provenance | Existing claim retained, not newly verified or increased; no financial figures added |
| NTM modular simulation, state management, save compatibility, deterministic replay, human-directed AI | Existing 15 October case study and source register (`docs/no-two-mondays-case-study.md`) | Homepage summary links to detailed dated evidence; do not imply exhaustive verification or backend/multiplayer scale |
| Existing NTM campaign numbers | Latest completed local campaign directory remains `completionist-v131-15-10-2026`; aggregate `coverage-integrity.json` reports ok=true, 112,402 verified/unique runs, 8,050 independently replayed retained artifacts; `completion-coverage.json` agrees on completed/verified runs, with 40 baseline runs separately recorded | Retain dated case-study numbers unchanged. No raw traces or private target identities copied; game tests were not rerun; no claim of current hosted build parity |
| Homepage NTM screenshot | Already-reviewed `public/images/no-two-mondays/office.jpg`, provenance in existing case-study source register | Caption identifies early 10 October development capture; not current production UI or a commercial screenshot |
| Decision examples | Synthesis of the documented PolicyStreet normalization, broad education modernisation, and NTM evidence | Examples describe particular work, not claims that every project used identical practices |
| Role dates and employment | Existing résumé-preferred conflict resolution in `docs/content-sources.md` | No dates changed; new WenSymes card uses year-only 2025 onward from existing March 2025 role |
| Contact / résumé / booking | Existing `profile` links; mailto and Cal.com paths retained | Hosted résumé is an external document, not an actual PDF download event. No booking submission, email send, availability promise or PDF quality claim |

## Source access limitations

Attempts to reopen the public portfolio, hosted résumé and CV through the web reader on 18 October were inaccessible/cache misses. This run therefore does **not** label their contents freshly publicly verified. Earlier repository source notes are owner-provided provenance, not a replacement for independent corroboration. No unsupported accomplishment was introduced to fill this gap.

## Owner evidence checklist

- Confirm the exact public spelling of WenSymes and current principal remit, and approve any further project detail.
- Confirm whether Laravel 12 is accurate and authorized for public attribution. No version is published in the new case.
- Supply a disclosure-approved challenge, technical decision and bounded contribution for WenSymes if a deeper case is desired. Leave/payroll/employee workflows, tests and outcomes need separate confirmation.
- Reconfirm PolicyStreet disclosure scope before adding any new architecture, reliability details or commercial outcomes. Current changes reorganize existing owner-sourced broad facts.
- Supply an owner-reviewed résumé PDF if a direct download is desired. The current site correctly offers hosted résumé/CV links.
- Any quantitative outcome needs its source, measurement period, ownership attribution and public disclosure permission. Do not place private evidence in this repository.

## Analytics definitions

Existing PostHog vendor, startup gates and event names are retained. These are intent/engagement events, not verified hiring or sales conversions.

| Event | Trigger | Properties | Validation |
| --- | --- | --- | --- |
| `ntm_case_study_clicked` (added) | Link whose path is `/no-two-mondays/`, including architecture fragment links | `page_path`, `placement` | Behavioral SDK fixture test; route links checked in browser |
| `external_project_clicked` (added) | Exact allowlisted NTM itch.io project URL | `page_path`, `placement` | Behavioral SDK fixture test; no user-entered data or destination property |
| `case_study_opened` (existing) | Commercial native details opens | `page_path`, `case_id` | Existing analytics test; browser keyboard exclusivity |
| `section_viewed` (existing) | Section enters existing observation threshold once per document | `page_path`, `section` | Existing analytics test; NTM now has stable section ID |
| `resume_clicked`, `full_cv_clicked` (existing) | Hosted résumé/CV link click | `page_path`, `placement` | Existing SDK fixture; intent only, not completed download |
| `booking_clicked`, `email_clicked`, `email_copy_clicked` (existing) | Existing booking/email/copy interaction | `page_path`, `placement` | Existing behavioral tests; not completed booking or delivered email |

No parallel `portfolio_*` taxonomy was added: it would duplicate existing funnel events. Existing pageview/autocapture configuration is preserved. DNT, canonical-production host and automation exclusions remain; replay stays off by default. No live analytics query, new consent mechanism/vendor or PII property was added. Validate live ingestion after authorized deployment with existing privacy controls; local automated QA deliberately does not initialize analytics.

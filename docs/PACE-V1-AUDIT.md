# PACE v1 repository audit

Reviewed 18 October 2026 (Asia/Kuching). Scope: portfolio repository only; no production deployment or game changes.

## Current state and strengths

React 18 / TypeScript / Vite; `Page.tsx` selects five existing routes plus a missing-page view. `scripts/prerender.mjs` emits native HTML with route metadata and styles. Cloudflare and GitHub Pages consume `dist`. No router or backend is required. `content.ts` holds career/project data; App composes shared navigation, projects, timeline, capabilities and contact. `index.css`, App, NaturalGraphics, SystemDiagrams, VisualMotion and Readability styles define the existing system.

Preserve Borneo botanical SVGs, portrait, restrained palette, typography, interactive function diagrams, motion preferences, readable text controls, native disclosures and lazy games. The NTM route already supplies detailed architecture, human accountability, historical verification and limitations. Existing source notes distinguish skills from project stacks. Contact offers scheduling, email and copy; résumé and CV are hosted documents, not local PDFs. No new download should be advertised without a verified export.

## Prioritised backlog

| Priority / problem | Repository evidence | Proposed correction / benefit | Effort / risk | Verification |
| --- | --- | --- | --- | --- |
| P0: confidential education detail exceeds new low-disclosure brief | `content.ts` meetings case and `SystemDiagrams.tsx` publish attendance granularity, recording storage and integration details | Generalise this supplementary case and corresponding engagement copy; retain employer in career history | Small / low; preserve IDs | Static output and disclosure review |
| P1: commercial flagship lacks prominence | `content.ts` sorts campus before insurance | Lead with PolicyStreet; consistent domain, role and contribution metadata | Small / low | Native disclosure, fragments, visual QA |
| P1: current HR engagement has no project case | Experience lists Wensymes, projects contain only historic HR work at another employer | Add bounded WenSymes case using broad documented HR/full-stack remit; omit conditional Laravel/payroll/implementation claims | Small / medium editorial | Evidence register and owner follow-up |
| P1: first CTA does not invite a conversation | Hero primary is Explore my work; booking appears near page bottom | Primary opportunity/contact anchor, secondary work, tertiary résumé; preserve booking URL | Small / low | Keyboard and mobile CTA journey |
| P1: judgment is scattered across long sections | Capability map lists disciplines; NTM contains detailed decisions | Compact decision examples with direct links to commercial and independent evidence | Small / low | Static links, responsive layout |
| P1: NTM homepage entry reads primarily as a game | `NoTwoMondays.tsx` emphasises story; case study already covers systems and verification | Lead with simulation/verification, distinguish engineering and experience paths, no new counts | Small / low | Route and external-link checks |
| P1: named tracking misses NTM | `analytics.ts` covers bookings, résumés, other games and commercial disclosures | Extend existing allowlisted click taxonomy for NTM case study and external project; no new vendor or impression event | Small / low | Analytics behavioural tests |
| P2: route SEO is already comprehensive | `index.html`, prerender script, robots and sitemap have titles, canonicals, schema and static content | Preserve; validate all routes rather than duplicate metadata | Small / low | Production artifact tests |
| P2: quality targets lack current measurements | Existing QA is historical; no PACE measurements | Rebuild, run tests/lint, browser QA, automated accessibility and available Lighthouse lab checks | Medium / low | PACE validation report |
| P2: evidence/disclosure gaps | Provenance notes record prior résumé review, not new independent verification | Record provenance confidence and questions; do not publish speculative stacks or metrics | Small / low | Content/confidentiality registers |

## Implementation status

Audit completed before implementation. P0 education disclosure reduction and P1 project ordering, WenSymes summary, role metadata, CTA hierarchy, engineering examples, NTM positioning and named event extensions are implemented. Browser testing additionally identified an inaccessible image within the external itch.io store iframe; it was replaced with an existing reviewed, dimensioned local screenshot and direct project link. The NTM client hydration allowlist omission was fixed and covered by runtime bootstrap tests. All existing routes and public metadata remain. Final results and exact validation are recorded in the companion PACE documents. No identity redesign, dependency addition, proprietary architecture diagram or gameplay changes are planned. Field Core Web Vitals and actual recruiting conversions require real-user evidence and cannot be established by this local work.

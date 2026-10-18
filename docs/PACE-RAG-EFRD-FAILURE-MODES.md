# EFRD failure behavior

19 October 2026. `FailureDemos.tsx` and `failures.mjs` provide explicitly labelled **Simulated failure scenario** fixtures. They have no public control endpoint, credentials or connection to production budgets.

| Scenario | Demonstration | Real local verification and limit |
| --- | --- | --- |
| Model unavailable | Lexical retrieval on an isolated corpus with semantic initialization unavailable | Browser interception rejects the actual worker request; keyword cache remains available; retry requires opt-in. Cancellation uses a deliberately inert worker and confirms termination. These do not claim physical-device memory failure coverage. |
| AI daily quota | One in-memory transport denial, then a locally blocked second attempt | Existing mocked gateway tests verify quota error handling/circuit behavior and local SQLite admission. No real provider allowance, invoice or recovery time was observed. |
| Provider unavailable | A bounded short fixture response marks unavailability, then blocks fixture retries | Existing API timeout/capacity paths and browser worker fallback are separate. Live browser/provider transport is disabled, so no production provider outage is certified. |
| Wrong semantic match | Deliberately identical unit vectors force cosine 1.0; pure real retrieval policy still abstains | This verifies selection rules, not embedding accuracy. Actual model ranking is measured independently by the held-out suite. |
| Stale/revoked source | Isolated source retirement plus wrong-release chunks | Real current-source/version filters reject reuse. Browser tests corrupt manifest/source bytes and verify controlled static fallback. Packaged old-release paths are absent and receive local 404s. |
| Cross-corpus | Foreign chunk injected into an in-memory clone | The same retrieval authorization filters reject it. Node tests and evaluation verify no foreign references. Synthetic examples never establish professional achievements. |

Every demonstration reports `realGenerationRequests: 0`; no simulation can refund, reset or mutate a real quota. Cache-only browser tests separately observe actual request events and require zero generation/session/provider requests. The absence of observed calls is not a provider billing audit.

Worker initialization has a bounded timeout and can be cancelled. The component disposes workers on corpus/view changes and unmount. Static/lexical results remain during initialization and after failure. The reusable assistant never downloads the model merely on opening, checking semantic mode, selecting a reviewed question or resolving a deterministic technology answer.

The guarded live API is existing scaffolding: local mocks and SQLite tests are implemented evidence, while deployed Cloudflare runtime, actual Turnstile validation, model/account compatibility, billable reasoning accounting and real provider grounding remain unverified. All live/accounting switches remain false. No deployment or provisioning occurred.

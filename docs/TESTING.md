# Try the populated test app

Start `npm run dev` and open http://127.0.0.1:5180/pace-rag/. The current cache contains 38 current portfolio answers, 20 synthetic engineering answers and 20 implementation-documentation answers. Approval badges say **Test-approved**, not publication-reviewed. Synthetic scenarios are not claims about real production incidents.

## Portfolio review

Choose **Portfolio assistant preview** for the minimal view, or **Portfolio review** under Engineering inspection for traces. Try these exact questions to exercise the cached-answer path:

| Question | Expected content |
| --- | --- |
| What did you work on at PolicyStreet? | Rate fetching, normalization, quotation and policy issuance; public product scope. |
| Which insurance products did your integration work cover? | Motor, medical, group medical and fire. |
| What rental lifecycle rules did you model? | Contracts, payments, renewals, cancellations and reporting. |
| How many properties did the rental project cover? | Publicly described scope of more than 20 properties. |
| Which cloud and productivity platforms are named for WenSymes? | Google Cloud and Microsoft 365; no invented framework details. |
| What verification concerns does No Two Mondays demonstrate? | Save compatibility and replay verification. |
| Does Incident Zero describe a real employer outage? | No; fictional story and synthetic data. |
| Have you deployed RAG at enterprise production scale? | No substantiated enterprise-production claim from this evidence. |
| Where can I find your résumé? | Public résumé/CV links in the cited contact source. |
| Can you share private architecture details or unreported business metrics? | Public evidence boundaries; no private details or invented outcomes. |

For semantic recommendations, try “Tell me how insurance quotes reached partners” or “How did you handle rental renewals and reports?” Related wording should produce question suggestions and passages. Select the relevant question to read its cached answer; a high similarity score alone must not silently reuse a different answer.

## Synthetic engineering

Choose **Implementation & synthetic lab** under Engineering inspection. Try:

- What happens if browser embeddings fail?
- Can the browser send its own trusted evidence text?
- What happens when a source document changes?
- Why must metadata and vectors come from the same release?
- Can an allowlisted document still contain hostile instructions?
- Should source results disappear while generation is pending?
- How should a revoked source be handled?
- Does rolling back a release reset daily AI budgets?

Use a paraphrase such as “What if my local model cannot start?” to exercise semantic recommendations. Exact questions and approved alternative wording exercise cache hits. Arbitrary queries remain suggest-only; no live AI is configured.

## Resource and fallback checks

1. Open a fresh browser context and Network tools. Opening the app or a cached starter must not fetch `/models/`, `/runtime/` or the embedding worker.
2. Uncheck **Use semantic search**. Submit an exact question: the test-approved cached answer should appear without model requests. A keyword query should still return passages.
3. Enable semantic mode. Merely checking the box must not download the model. Submit a custom semantic question to initialize it; keyword results should remain visible during initialization.
4. Try a second semantic query; it reuses the worker. After one successful semantic query, disconnect the network and test another in-memory query.
5. Block the worker URL or model assets, reload, and submit. Keyword retrieval should survive. Failed model attempts must not repeat until explicit opt-in.
6. Open the static knowledge library with JavaScript disabled. Source and answer text should remain readable.
7. Switch corpora while the model initializes. The old worker must stop and stale results must not appear in the new corpus.

Automated equivalent: `npm run test:browser` while the app serves at port 5180. For packaged static output, run `npm run preview:static`, then in a second terminal use `PACE_RAG_LAB_URL=http://127.0.0.1:5183/pace-rag/ npm run test:browser`.

## EFRD answer and inspection checks

- Ask “What technologies have you worked with?” or “Which projects used React?” The answer should be assembled from the owner-confirmed technology export, with actual project references and no model initialization.
- Ask “Which frameworks and cloud platforms have you used professionally?” Education generations must remain distinct; undated Asset work must not acquire an employer or period.
- Ask “How does PACE-RAG avoid wasting AI inference?” in the implementation Lab. It should reuse the newly test-approved cache entry with implementation-documentation sources and zero model/provider requests.
- Ask “What was your exact production traffic at PolicyStreet?” It must not invent a number. In keyword mode it abstains immediately; semantic mode may initialize local ranking but still cannot invent an answer.
- Open **Inspect this retrieval** for real cosine/lexical scores, record/source names, index version, measured ranking latency and remote request count. Supporting citations remain under the answer; other passages have their own disclosure.
- Run each **Simulated failure scenario**. The result must identify the fixture, zero real generation requests and its limited interpretation.

The 90% Top-3 target is not currently met by the strict held-out wording suite; do not interpret safe abstention or a displayed similarity score as proof of answer quality. [Evaluation methodology](PACE-RAG-EFRD-EVALUATION.md) and the local scorecard expose measured results.

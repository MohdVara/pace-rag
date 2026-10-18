# Privacy and resource use

Questions entered during local search remain in browser memory. Query embeddings run locally and use device CPU/memory. The model is approximately 23 MB plus runtime/tokenizer overhead and is loaded only on the first submitted custom semantic query. Opening the assistant, selecting a cached starter, enabling the semantic checkbox, and keyword-only queries do not start a model download. Browser caches may retain public assets and may be evicted.

Only explicit live-generation activation sends a question and selected public evidence to Cloudflare Workers AI. Live AI is disabled in the delivered preview. The application does not persist raw questions, prompts, embeddings or generated answers, and does not forward them to PostHog or error-reporting services.

If enabled, live abuse protection uses a signed daily pseudonymous visitor token in tab storage and daily HMACs of coarse network prefixes. Coordinator records expire after 48 hours. These controls are separate from optional portfolio analytics. No invasive fingerprint is used. Provider data handling is governed separately by Cloudflare; no zero-provider-retention claim is made.

Lab sources explicitly distinguish synthetic Atlas examples from actual PACE-RAG implementation documentation. Portfolio snapshots preserve approved public disclosure boundaries and do not ingest private employer material. New Q&A and source snapshots require owner review before publication. Downloaded public copies cannot be remotely erased.

EFRD diagnostic queries and rankings stay in component memory. Only fixed test questions appear in the reproducible published evaluation artifacts; visitor questions are never collected for that purpose. No telemetry or third-party tracking was added.

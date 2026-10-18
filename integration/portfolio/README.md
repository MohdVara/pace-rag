# PACE-RAG v1.3 portfolio adapter

The adapter now implements the owner-requested native expandable “Ask about my engineering experience” section near About in `mohdvara.github.io`. It reuses `@pace-rag/portfolio-assistant@1.3.0`, with Professional Experience scope only, three starter questions, custom search, supporting citations, related questions, graceful abstention and a link to the full Engineering RAG Lab. It is neither an iframe nor a floating chatbot.

`files/` mirrors the current adapter, stylesheet, asset verifier and integration tests. `adapter.patch` contains only this task's tracked portfolio edits (against the pre-task working tree); existing PACE/BAA/technology edits are preserved. Do not blindly apply the historical v0.1.0 patch or archive.

## Rebuild the pinned package

From `pace-rag`, run `npm run build:release`, `npm run package:portfolio`, then `npm pack --workspace @pace-rag/portfolio-assistant --pack-destination output`. Copy the resulting archive to the portfolio's `vendor/` and install that exact file. Commit the archive and lockfile together when reviewing the final changes. The asset set includes no Lab, fictional or implementation corpus. Generated `public/pace-rag` is ignored in Git and rebuilt from the installed package.

The portfolio build and dev scripts verify and copy approved assets. Tampered bytes, unlisted files, wrong versions, preview manifests and foreign-corpus evidence fail the build. No executable code comes from a moving CDN URL.

The disclosure is static HTML; opening it mounts the lazy React assistant. Cached/ontology answers avoid the model, and custom semantic queries initialize MiniLM only when needed. Closing unmounts the worker and returns focus. `VITE_PACE_RAG_ENABLED=false npm run build` is the integration rollback path.

See [the release report](../../docs/PACE-RAG-V1.3-PUBLIC-RELEASE.md) for measured bundles, browser checks and limitations. No deployment or automatic publishing is part of this work.

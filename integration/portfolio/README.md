# Staged portfolio adapter

Preserved from the earlier local opt-in integration. The portfolio source and dependencies have been detached; its existing BAA edits were preserved. Do not apply this patch until the standalone retrieval, owner content review and integration gates pass.

`adapter.patch` contains the tracked-file integration changes; `files/` contains the added adapter, asset-copy helper and checks. The historical archive at `output/integration-history/pace-rag-portfolio-assistant-0.1.0.tgz` is historical review evidence and predates the query-triggered loading correction. Rebuild and repack a fresh package before integration; do not install this archive.

Future local validation: build/package in pace-rag, stage the fresh archive under portfolio/vendor, review/apply the patch and added files, install the local package, build with preview enabled, test no model request on opening, close/corpus-switch cleanup, static fallbacks, and enforce main JavaScript <=215,000 bytes. Production deployment requires explicit owner approval.

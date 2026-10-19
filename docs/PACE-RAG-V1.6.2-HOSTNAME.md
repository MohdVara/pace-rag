# PACE-RAG v1.6.2 hostname patch

The public Lab hostname is `https://pace-rag.paramasvara.online/`.
This patch rebuilds the professional assistant package so static knowledge
libraries and default navigation use that domain too. The portfolio installs
the new 1.6.2 archive and validates its file hashes before copying assets.

Remaining review links and saved report URL fields are normalized to the current
hostname. Historical reports retain their measured times, statuses and results,
with explicit notes that URL normalization did not repeat those measurements.

Unused full assistant archives are removed from the current vendor directory;
their original bytes remain in Git history. The v1.5 ranking fallback now uses
`vendor/pace-rag-ranking-baseline-1.5.0.tgz` in the portfolio repository. Its nine
corpus files are copied byte-for-byte from the original v1.5 archive and verified
against the original manifest. It contains no navigation pages or model binaries.
`PACE_V15_ARCHIVE` can still specify a compatible original archive explicitly.

The approved professional and Lab corpus versions, model, ranker, source/answer
approval hashes and v1.6.1 retrieval measurements are unchanged. The existing
v1.6.1 evaluation page and release checks remain active for 1.6.2. Automatic
semantic reuse and live generation remain disabled.

Validation: the approved Cloudflare build, package checksums, 108 RAG tests,
122 portfolio tests and portfolio production build pass. Forcing the archived
v1.5 fallback reproduces the existing paired lexical report byte-for-byte.
Scanning both current repository trees, remaining archive contents and generated
publication assets finds zero obsolete-hostname references.

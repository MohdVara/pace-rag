# PACE-RAG v1.2 — UX clarity

## Audit — 19 October 2026

The existing `/pace-rag/` React entry (`apps/rag-lab/src/main.tsx`) has two independent button rows. “Engineering inspection” / “Portfolio assistant preview” select presentation; “Implementation & synthetic lab” / “Portfolio review” select physical `lab` / `portfolio` indexes. Assistant preview silently forces portfolio. Remount keys clear prior results and terminate workers. `Assistant.tsx` owns retrieval, exact cache, technology composition, optional guarded generation and disclosures; `Inspection.tsx` renders actual trace state. `FailureDemos.tsx` runs six isolated simulations. No live configuration is supplied.

Physical indexes have hash-verified manifests, cached answers, source snapshots, chunks and matching vectors. The portfolio contains 38 active answers / 18 documents. Lab contains 40 answers / 24 documents: 20 Atlas fictional fixtures and four PACE implementation documents. Static HTML libraries and source pages exist under `/knowledge/{portfolio,lab}/`. Static architecture, privacy and evaluation pages are built by `scripts/static-pages.mjs`. There is no deployed-service claim. All source approvals are local-test only and release validation rejects them.

The search form exposes model controls and technical status before the task. Additional inspection, passage, live-generation and release disclosures compete with the answer. Starters for the combined Lab favor implementation records, concealing fictional source discovery. Existing Node, legacy browser and EFRD browser tests cover retrieval, source integrity, no eager model, failure/cancellation, current-only artifacts and responsive layouts. Prior EFRD ranking results remain below release targets; UI changes cannot establish human comprehension.

## Revised interaction

One primary source selector: Professional Experience; How PACE-RAG Works; Fictional Test Documents. Standard answer-first search is shared; inspection is an optional disclosure for the same result. Repository-relative provenance and scoped source libraries make source origin inspectable before searching. Model settings are secondary. Source changes remount the assistant and cancel outstanding work.

The two immutable physical releases remain unchanged to preserve content-bound approvals and vectors. Lightweight source views filter validated documents, dependent answers and both vector matrices before any search or static-ready callback. Runtime source checks additionally enforce the selected nature. See [provenance](PACE-RAG-CORPUS-PROVENANCE.md) and [QA](PACE-RAG-UX-QA.md) for boundaries and actual verification.

Completed implementation and acceptance evidence: [UX QA](PACE-RAG-UX-QA.md). The owner subsequently confirmed human authorship with AI assistance for the Atlas fixtures; [provenance](PACE-RAG-CORPUS-PROVENANCE.md) records that basis separately from publication approval. V1.3 ontology work is layered on these same source boundaries.

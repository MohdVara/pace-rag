import { readFile, writeFile, mkdir, cp, readdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { SCOPES, inScope, sourceProvenance, natureLabels } from "../packages/knowledge-schema/src/provenance.mjs";
const output = resolve("dist/lab");
const escape = (text) =>
  String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const shell = (title, body) =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${escape(title)} · PACE-RAG</title><style>body{font:1.1rem/1.7 system-ui,sans-serif;max-width:75ch;margin:3rem auto;padding:0 1rem;color:#20352b;background:#f5f6ee;overflow-wrap:anywhere}dt{font-weight:650}dd{margin-inline-start:1rem;margin-block-end:.65rem}a{color:#245541}h1,h2{line-height:1.2}li{margin:.5rem 0}article{border-top:1px solid #748574;padding:1rem 0}:focus-visible{outline:3px solid #865f12;outline-offset:4px}</style></head><body><a href="/pace-rag/">PACE-RAG Lab</a><main><h1>${escape(title)}</h1>${body}</main></body></html>`;
function metadata(doc, compact=false) {
 const m=sourceProvenance(doc);
 if(compact)return `<p>${escape(m.documentType)} · ${escape(natureLabels[m.sourceNature] || 'Unverified source')}</p><p>${escape(m.purpose)}</p><p>Origin: <code>${escape(m.sourceFileReference)}</code>. ${m.authorship==='ai-assisted'?'Human-authored with AI assistance (owner-confirmed).':'Authorship unknown.'}</p><p>Document ID: <code>${escape(m.documentId)}</code>. ${escape(m.reviewStatus)}</p>`;
 return `<p>${escape(natureLabels[m.sourceNature] || 'Unverified source')}</p><dl><dt>Document type</dt><dd>${escape(m.documentType)}</dd><dt>Purpose</dt><dd>${escape(m.purpose)}</dd><dt>Stable document identifier</dt><dd><code>${escape(m.documentId)}</code></dd><dt>Source origin</dt><dd>${escape(m.origin)}</dd><dt>Repository source file</dt><dd><code>${escape(m.sourceFileReference)}</code></dd><dt>Authorship</dt><dd>${escape(m.authorshipDescription)}</dd><dt>Review / publication</dt><dd>${escape(m.reviewStatus)}</dd><dt>Publication terms</dt><dd>${escape(doc.license)}</dd><dt>Review date</dt><dd>${escape(m.reviewedAt || 'Not recorded')}</dd><dt>Last updated</dt><dd>Not established by a source history.</dd></dl>`;
}
for (const corpus of ["portfolio", "lab"]) {
  const root = resolve(output, "knowledge", corpus),
    pointer = JSON.parse(await readFile(resolve(root, "current.json"), "utf8")),
    folder = resolve(root, pointer.corpusVersion),
    docs = JSON.parse(
      await readFile(resolve(folder, "documents.json"), "utf8"),
    ),
    answers = JSON.parse(
      await readFile(resolve(folder, "answers.json"), "utf8"),
    );
  // Keep only the active generated release and rebuild its authorized source pages.
  for (const item of await readdir(root, {withFileTypes:true})) if (item.isDirectory() && /^[a-f0-9]{16}$/.test(item.name) && item.name !== pointer.corpusVersion) await rm(resolve(root,item.name),{recursive:true});
  await rm(resolve(root, "sources"), {recursive:true,force:true});
  await mkdir(resolve(root, "sources"), { recursive: true });
  for (const doc of docs.filter(doc => doc.status === "approved"))
    await writeFile(
      resolve(root, "sources", `${doc.id}.html`),
      shell(
        doc.title,
        `${metadata(doc)}<h2>Document content</h2><p>${doc.approval?.scope === "local-test" ? "Source snapshot · content review pending." : doc.status === "approved" ? "Reviewed public source snapshot." : "Draft source snapshot · owner review required."} ${["insurance","education","wensymes","rental"].includes(doc.id) ? "Historical background snapshot: earlier stack-availability qualifications are superseded by the owner-confirmed technology inventory dated 18 October 2026. See the current technology source in this library." : ""} ${doc.provenance === "synthetic" ? "Synthetic engineering example." : doc.provenance === "implementation-documentation" ? "Actual implementation documentation; local verification limits apply." : ""}</p>${doc.id === "rag" ? '<p>Historical evidence wording: the current independent PACE-RAG demonstration is documented in the <a href="https://mohd.paramasvara.online/pace-rag-case-study/">engineering case study</a>. Enterprise production delivery remains unverified.</p>' : ""}${doc.text
          .split("\n\n")
          .map((p) => `<p>${escape(p)}</p>`)
          .join(
            "",
          )}<p><a href="${escape(doc.canonicalUrl)}">Canonical source</a></p><p>Content hash: <code>${doc.contentHash}</code></p>`,
      ),
    );
  const currentDocs = docs.filter(doc => doc.status === "approved");
  const currentAnswers = answers.filter(answer => answer.status === "approved" && answer.citations.every(c => currentDocs.some(doc => doc.id === c.sourceId)));
  const preview = [...docs, ...answers].some(record => record.approval?.scope === "local-test") ||
    docs.some((doc) => doc.status !== "approved") ||
    answers.some((answer) => answer.status !== "approved");
  const body = `<p>${preview ? "Preview. Content review is pending." : "Reviewed public knowledge."} No live inference is required to read this library.</p><h2>Documents</h2><ul>${currentDocs.map((doc) => `<li><a href="sources/${doc.id}.html">${escape(doc.title)}</a></li>`).join("")}</ul><h2>${preview ? "Test questions and answers" : "Reviewed questions and answers"}</h2>${currentAnswers.map((answer) => `<article><h3>${escape(answer.canonicalQuestion)}</h3><p>${escape(answer.answerText)}</p><ul>${answer.citations.map((c) => `<li><a href="${escape(c.url)}">${escape(c.title)}</a></li>`).join("")}</ul></article>`).join("")}`;
  for (const [scopeId, scope] of Object.entries(SCOPES).filter(([, scope])=>scope.corpusId===corpus)) {
    const scopedDocs=currentDocs.filter(doc=>inScope(doc,scopeId));
    const scopedIds=new Set(scopedDocs.map(doc=>doc.id));
    const scopedAnswers=currentAnswers.filter(answer=>answer.citations.every(c=>scopedIds.has(c.sourceId)));
    const target=resolve(output,'knowledge',scope.library);
    await mkdir(target,{recursive:true});
    const about=scopeId==='fictional'?'<h2>About these documents</h2><p>These are fictional engineering records included to demonstrate search, source attribution and failure behavior. They do not represent actual employer systems, customer incidents or confidential operational records. Human-authored with AI assistance, confirmed by the portfolio owner on 19 October 2026. Specific tools and preparation dates are not recorded. A map adds labels and local URLs; no text-generation script is recorded.</p>':'';
    const listing=scopedDocs.map(doc=>`<article><h3><a href="../${corpus}/sources/${escape(doc.id)}.html">${escape(doc.title)}</a></h3>${metadata(doc,true)}</article>`).join('');
    const questions=scopedAnswers.map(answer=>`<article><h3>${escape(answer.canonicalQuestion)}</h3><p>${escape(answer.answerText)}</p><ul>${answer.citations.map(c=>`<li><a href="${escape(c.url)}">${escape(c.title)}</a></li>`).join('')}</ul></article>`).join('');
    await writeFile(resolve(target,'index.html'),shell(`${scope.title} — source library`,`<p>${escape(scope.explanation)}</p>${about}<p>${scopedDocs.length} source documents. ${preview ? "Content review pending." : "Reviewed public sources."} ${scopeId==='professional'?'Owner-confirmed technology involvement is separate from independent proof of ownership, impact or deployment scale.':''}</p><h2>Documents</h2>${listing}<h2>Reviewed questions and answers</h2>${questions}`));
  }
  await writeFile(
    resolve(root, "index.html"),
    shell(
      `${corpus === "lab" ? "Implementation and synthetic Lab" : "Portfolio"} knowledge library`,
      body,
    ),
  );
}
// The legacy Lab library is a directory, never a combined implementation/fictional list.
await writeFile(resolve(output,'knowledge/lab/index.html'),shell('Choose a knowledge source',`<p>Implementation evidence and fictional scenarios have separate search scopes and libraries.</p><ul><li><a href="../implementation/index.html">How PACE-RAG Works — source library</a></li><li><a href="../fictional/index.html">Fictional Test Documents — source library</a></li></ul>`));
const report = await readFile("evaluation/reports/current.json", "utf8").catch(
  () =>
    JSON.stringify({
      status: "not-run",
      message:
        "Evaluation has not been run. No measured success rate is claimed.",
    }),
);
await writeFile(
  resolve(output, "evaluation.html"),
  shell(
    "Evaluation and limitations",
    `<p>Engineering demonstration. Automatic semantic answer reuse is disabled. Citation membership does not establish factual entailment. Human grounding review and physical-device/screen-reader checks are release gates.</p><pre style="white-space:pre-wrap">${escape(report)}</pre>`,
  ),
);
await writeFile(
  resolve(output, "privacy.html"),
  shell(
    "Privacy and resource use",
    `<p>Local search keeps questions in browser memory and uses device CPU and memory. Opening the assistant or choosing a cached starter does not download a model. A custom query loads the local model only when semantic retrieval is needed; exact cache, supported technology lookups and keyword-only queries do not. The model weighs approximately 23 MB before runtime and tokenizer overhead. Static retrieval uses no Workers AI neurons.</p><p>Live generation is disabled by default. When explicitly configured and requested, it transmits the question and public evidence to Cloudflare Workers AI. The application does not persist raw questions, prompts or generated answers. Short-lived daily pseudonymous abuse keys expire after 48 hours. Provider processing is governed separately by Cloudflare.</p><p>No assistant questions, answers or embeddings are sent to analytics. Browser caches may be evicted. Already-downloaded public material cannot be remotely erased.</p>`,
  ),
);
await writeFile(
  resolve(output, "_headers"),
  `/knowledge/*/current.json\n  Cache-Control: no-cache\n/knowledge/*/*/manifest.json\n  Cache-Control: public, max-age=31536000, immutable\n/models/*\n  Cache-Control: public, max-age=31536000, immutable\n/runtime/*\n  Cache-Control: public, max-age=31536000, immutable\n/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: no-referrer\n`,
);
console.log(
  "Static source, knowledge, privacy and evaluation pages generated.",
);
await rm("apps/rag-lab/public/knowledge", {recursive:true,force:true});
await cp(resolve(output, "knowledge"), "apps/rag-lab/public/knowledge", {
  recursive: true,
});
for (const file of ["privacy.html", "evaluation.html"])
  await cp(resolve(output, file), resolve("apps/rag-lab/public", file));
const semanticPath='evaluation/reports/v13-verification-hybrid-semantic.json';
try {
  const report=JSON.parse(await readFile(semanticPath,'utf8'));
  const metrics=Object.entries(report.scorecards).map(([corpus,m])=>`<article><h2>${escape(corpus)}</h2><p>${m.positiveQuestions} independent-wording positives, ${m.criticalQuestions} critical questions, ${m.compositeQuestions} structured questions.</p><ul><li>Top-1 ranking: ${(m.top1ApprovedAnswerRankingAccuracy*100).toFixed(1)}%</li><li>Top-3 recall: ${(m.top3CandidateRecall*100).toFixed(1)}% (target 90%; ${m.top3CandidateRecall>=.9?'met in this sample':'not met'})</li><li>Appropriate critical abstention: ${(m.appropriateAbstentionRate*100).toFixed(1)}%</li><li>Incorrect automatic answers: ${m.incorrectAutomaticMatches}</li><li>Invalid supporting references: ${m.invalidCitationReferences}; cross-corpus references: ${m.crossCorpusReferences}</li><li>Direct-answer coverage across common positive/composite intents: ${(m.directAnswerCoverageCommonIntents*100).toFixed(1)}%</li></ul></article>`).join('');
  await mkdir(resolve(output,'evaluation'),{recursive:true});
  for(const name of ['v13-verification-hybrid-semantic.json','v13-verification-hybrid-semantic-cases.json','v13-verification-baseline-semantic.json','v13-verification-hybrid-lexical.json','v13-development-hybrid-semantic.json'])await cp(`evaluation/reports/${name}`,resolve(output,'evaluation',name)).catch(()=>{});
  await writeFile(resolve(output,'evaluation.html'),shell('PACE-RAG v1.3 retrieval evaluation and limitations',`<p>Professional verification uses 50 separate positive questions and 20 critical queries frozen before the ranking trial. Baseline Top-3 recall was 88%; hybrid recall is 94%. The original development set improved from 79% to 92% on 100 professional positives. The implementation figures below reuse the 40-question development set and are not separate final verification. Measured ${escape(report.measuredAt)}. Dataset ${escape(report.dataset.version)}; software ${escape(report.softwareVersion)}. Labels are agent-authored and await independent owner review. No automatic semantic-answer cutoff is calibrated.</p>${metrics}<p>Top-3 suggestions are not direct-answer correctness. Professional verification Top-1 is 66%, with three Top-3 misses. Lexical-only verification Top-3 is 78%. Zero incorrect automatic answers does not mean zero irrelevant suggestions. Local ranking adds lexical work; model download, physical-device memory and live billing are not measured here.</p><p>Zero live provider calls in this pure local evaluation. Live generation is disabled; no live grounding was executed.</p><p><a href="evaluation/v13-verification-hybrid-semantic.json">Final semantic verification</a> · <a href="evaluation/v13-verification-hybrid-semantic-cases.json">Per-question results</a> · <a href="evaluation/v13-verification-baseline-semantic.json">Same-set baseline</a> · <a href="evaluation/v13-verification-hybrid-lexical.json">Lexical fallback</a> · <a href="evaluation/v13-development-hybrid-semantic.json">Development results</a></p><p>Reproduce: <code>npm run eval:v13 -- --semantic --verification</code> after preparing model/index assets. <a href="https://mohd.paramasvara.online/pace-rag-case-study/">Engineering case study</a>.</p>`));
} catch { /* Preserve the previous honest not-run report when no EFRD result exists. */ }
await writeFile(resolve(output,'architecture.html'),shell('PACE-RAG architecture and methodology',`<p>Knowledge first. Inference optional. Evidence always.</p><p>Choose Professional Experience, How PACE-RAG Works or Fictional Test Documents. The latter two are disjoint validated search views of the immutable Lab release; documents, dependent answers and matching vector rows are filtered together. Inspection opens the same result without another retrieval.</p><ol><li>Load checksum-verified public corpus records, reviewed question registry and static source pages. The model does not start on opening.</li><li>Exact reviewed wording reuses its own cached citations. Bounded technology templates use only the owner-confirmed versioned PACE v1.2 inventory, preserving generation and project ownership.</li><li>Other custom semantic questions initialize the pinned MiniLM q8 single-thread WASM worker. Professional semantic candidates combine 80% question cosine, 20% normalized answer-body BM25 and a bounded canonical-question intent adjustment. Other sources retain 65% cosine and 35% reviewed question-and-answer BM25. These are ranking signals, not approval or confidence. Passage retrieval uses cosine or lexical overlap separately. Scores describe relevance, not accuracy probabilities.</li><li>Without a supported direct answer, show an evidence limitation and distinct related questions/passages. Keyword/static paths remain available after failure.</li><li>Live generation is disabled. Existing guarded gateway/budget tests use local SQLite and deterministic provider/Turnstile mocks; they are not deployed Cloudflare or billing verification.</li></ol><p>Supporting sources belong to the answer, not merely top-ranked passages. Traces remain in memory. Draft/retired answers are excluded from current artifacts, previous generated release folders are omitted from static packages, and stale asset hashes/versions fail closed. Already-downloaded public bytes cannot be erased remotely.</p><p>Current source snapshots and cached Q&A have owner publication approval. Content changes require a new hash-bound review; production capabilities remain unverified. No generated answer is automatically promoted.</p><p><a href="evaluation.html">Observed evaluation and reproducible case results</a> · <a href="privacy.html">Privacy/resource boundaries</a></p>`));
for(const file of ['evaluation.html','architecture.html'])await cp(resolve(output,file),resolve('apps/rag-lab/public',file));

await rm("apps/rag-lab/public/evaluation",{recursive:true,force:true});
await cp(resolve(output,"evaluation"),"apps/rag-lab/public/evaluation",{recursive:true}).catch(()=>{});

// General definitions are intentionally separate from professional source evidence.
const {entities,ONTOLOGY_VERSION}=await import('../packages/semantic-core/src/technology/ontology.mjs');
await writeFile(resolve(output,'technology-ontology.html'),shell('Technology definitions and provenance',`<p>Curated general technology knowledge: ${escape(ONTOLOGY_VERSION)}. These definitions do not establish professional project usage. Project associations come only from the separate owner-confirmed inventory. Agent-curated definitions approved for public display; primary references support definitions, not professional usage.</p>${entities.map(e=>`<article><h2>${escape(e.canonicalName)}</h2><p>${escape(e.description)}</p><p>Aliases: ${escape(e.aliases.join(', ')||'Canonical name only')}.</p><p>Categories: ${escape(e.categories.join(', '))}.</p><p>Directed relationships: ${escape(['ecosystem','builtOn','partOf','versionOf','relatedTo'].flatMap(key=>(e[key]||[]).map(id=>`${key}: ${id}`)).join('; ')||'No additional relationship recorded')}.</p><a href="${escape(e.source)}">Primary technology reference</a></article>`).join('')}`));
await cp(resolve(output,'technology-ontology.html'),resolve('apps/rag-lab/public','technology-ontology.html'));
for(const name of ['toer-understanding-v1.json','toer-understanding-cases-v1.json','ux-scoped-semantic-v1.json','ux-scoped-lexical-v1.json','ux-scoped-semantic-cases-v1.json','ux-toer-local-verification-v1.json'])await cp(`evaluation/reports/${name}`,resolve(output,'evaluation',name)).catch(()=>{});
await writeFile(resolve(output,'technology-evaluation.html'),shell('Technology understanding evaluation',`<p>Local deterministic development evaluation, separate from the historical embedding ranking baseline. Fixed agent-authored questions; labels are not independently reviewed and the set is not a blind certification. No live provider or statistical reliability claim.</p><p><a href="evaluation/toer-understanding-v1.json">140-question technology report</a> · <a href="evaluation/toer-understanding-cases-v1.json">Per-question results and errors</a> · <a href="evaluation/ux-scoped-semantic-v1.json">Separated professional / implementation semantic evaluation</a></p><p><a href="evaluation/ux-toer-local-verification-v1.json">Current local UX, browser and bundle verification</a>.</p><p>Reproduce: <code>npm run eval:technology</code> and <code>npm run eval:retrieval -- --scoped --semantic</code>. Current source publication approval is separate from retrieval ranking targets and production verification.</p>`));
await cp(resolve(output,'technology-evaluation.html'),resolve('apps/rag-lab/public','technology-evaluation.html'));
await cp(resolve(output,'evaluation'),'apps/rag-lab/public/evaluation',{recursive:true});

// Current v1.4 measurements replace the historical v1.3 summary; originals remain available.
try {
 const read=async name=>JSON.parse(await readFile(`evaluation/reports/${name}.json`,'utf8'));
 const fresh=await read('v14-fresh-precision-semantic'),prior=await read('v14-fresh-prior-semantic');
 const rows=['development','verification','fresh'];let table='<table><thead><tr><th>Dataset</th><th>Questions</th><th>Before Top-1 / Top-3</th><th>After Top-1 / Top-3</th></tr></thead><tbody>';
 for(const id of rows){const before=(await read(`v14-${id}-prior-semantic`)).scorecards.professional,after=(await read(`v14-${id}-precision-semantic`)).scorecards.professional;table+=`<tr><td>${id==='fresh'?'New frozen v1.4 development verification':id}</td><td>${after.positiveQuestions}</td><td>${(before.top1ApprovedAnswerRankingAccuracy*100).toFixed(1)}% / ${(before.top3CandidateRecall*100).toFixed(1)}%</td><td>${(after.top1ApprovedAnswerRankingAccuracy*100).toFixed(1)}% / ${(after.top3CandidateRecall*100).toFixed(1)}%</td></tr>`;}
 table+='</tbody></table>';
 for(const id of rows)for(const rank of ['prior','precision'])for(const suffix of ['', '-cases']){const name=`v14-${id}-${rank}-semantic${suffix}.json`;await cp(`evaluation/reports/${name}`,resolve(output,'evaluation',name));}
 await writeFile(resolve(output,'evaluation.html'),shell('PACE-RAG v1.4 retrieval precision',`<p>Measured ${escape(fresh.measuredAt)}. All labels are agent-authored and await independent review. The new 40-positive / 20-critical set was frozen before ranking trials; it has now been evaluated and is no longer unseen. The ranking was developed on the original set, not tuned against either verification set.</p>${table}<p>Fresh Top-1 remains below the suggested 80% target. No automatic semantic answer reuse was enabled. Critical queries abstain; citation and source-isolation checks report zero errors. Finite ranking results do not establish correctness probabilities, enterprise security, live grounding or provider accounting.</p><p><a href="evaluation/v14-fresh-precision-semantic.json">New verification measurements</a> · <a href="evaluation/v14-fresh-precision-semantic-cases.json">Per-query outcomes</a> · <a href="evaluation/v14-fresh-prior-semantic.json">Same-set prior ranker</a> · <a href="evaluation/v14-verification-precision-semantic.json">Preserved 50-question set</a> · <a href="evaluation/v14-development-precision-semantic.json">Development set</a></p>`));
 await cp(resolve(output,'evaluation.html'),resolve('apps/rag-lab/public/evaluation.html'));
 await cp(resolve(output,'evaluation'),'apps/rag-lab/public/evaluation',{recursive:true});
} catch { /* Earlier evaluation stays visible until current measurements exist. */ }
// Fail packaging rather than publish an invented or stale worked example.
await (await import('./worked-example.mjs')).writeWorkedExample(output);
await cp(resolve(output,'examples'),resolve('apps/rag-lab/public/examples'),{recursive:true});
// Current release measurements are required; historical reports remain archived.
{
 const read=async name=>JSON.parse(await readFile(`evaluation/reports/${name}.json`,'utf8'));
 const names=['development','verification','v14-regression'];
 const reports=await Promise.all(names.map(async name=>({name,before:await read(`v15-${name}-prior-semantic`),after:await read(`v15-${name}-precision-semantic`)})));
 const pct=n=>(n*100).toFixed(1)+'%';
 const rows=reports.map(({name,before,after})=>{const b=before.scorecards.professional,a=after.scorecards.professional;return `<tr><td>${escape(name)}</td><td>${a.positiveQuestions}</td><td>${pct(b.top1ApprovedAnswerRankingAccuracy)} / ${pct(b.top3CandidateRecall)}</td><td>${pct(a.top1ApprovedAnswerRankingAccuracy)} / ${pct(a.top3CandidateRecall)}</td></tr>`;}).join('');
 for(const name of names)for(const rank of ['prior','precision'])for(const suffix of ['', '-cases']){const file=`v15-${name}-${rank}-semantic${suffix}.json`;await cp(`evaluation/reports/${file}`,resolve(output,'evaluation',file));}
 await writeFile(resolve(output,'evaluation.html'),shell('PACE-RAG v1.5 retrieval precision',`<p>Previously inspected, agent-authored regression sets, not fresh independent evaluation. Development questions alone informed the intent refinements. No verification-specific tuning was performed after these measurements.</p><table><caption>v1.4 → v1.5: Top-1 / Top-3 suggestion ranking</caption><thead><tr><th>Set</th><th>Positives</th><th>v1.4</th><th>v1.5</th></tr></thead><tbody>${rows}</tbody></table><p>The independent ≥80% Top-1 / ≥90% Top-3 target remains unverified: a separately authored holdout and label adjudication are required. The reviewer packet is prepared, but no independent review or real-user testing has occurred. All 100 distinct professional critical questions abstain, with zero observed wrong automatic answers, invalid supporting references or cross-corpus references. Automatic semantic reuse and live generation remain disabled.</p><p><a href="evaluation/v15-development-precision-semantic.json">Development measurements</a> · <a href="evaluation/v15-development-precision-semantic-cases.json">All development outcomes</a> · <a href="evaluation/v15-verification-precision-semantic-cases.json">50-question outcomes</a> · <a href="evaluation/v15-v14-regression-precision-semantic-cases.json">40-question outcomes</a> · <a href="examples/php-frameworks.json">Actual deterministic PHP-framework worked example</a></p><p>Scores rank topical relevance, not correctness probabilities. These local results do not verify live-provider grounding, billing, Cloudflare security, physical devices or actual screen-reader use.</p>`));
 await cp(resolve(output,'evaluation.html'),resolve('apps/rag-lab/public/evaluation.html'));
 await cp(resolve(output,'evaluation'),resolve('apps/rag-lab/public/evaluation'),{recursive:true});
}
// Owner-approved v1.6 knowledge measurements supersede historical evaluations.
if(JSON.parse(await readFile('package.json','utf8')).version==='1.6.0'){
 const r=JSON.parse(await readFile('evaluation/reports/knowledge-v16-approved-semantic.json','utf8'));
 const current=JSON.parse(await readFile(resolve(output,'knowledge/portfolio/current.json'),'utf8'));
 if(!r.publicationApproved||r.approvedV16CorpusVersion!==current.corpusVersion)throw Error('Approved v1.6 evaluation does not match release corpus');
 const pct=x=>(100*x).toFixed(1)+'%';
 const table='<table><caption>Approved content refresh; unchanged v1.5 ranker</caption><thead><tr><th>Set</th><th>Positives</th><th>v1.5 Top-1 / Top-3</th><th>v1.6 Top-1 / Top-3</th></tr></thead><tbody>'+Object.entries(r.sets).map(([id,s])=>`<tr><td>${escape(id)}</td><td>${s.after.positiveQuestions}</td><td>${pct(s.before.top1)} / ${pct(s.before.top3)}</td><td>${pct(s.after.top1)} / ${pct(s.after.top3)}</td></tr>`).join('')+'</tbody></table>';
 for(const mode of ['semantic','lexical'])for(const suffix of ['','-cases']){const name=`knowledge-v16-approved-${mode}${suffix}.json`;await cp(`evaluation/reports/${name}`,resolve(output,'evaluation',name));}
 await writeFile(resolve(output,'evaluation.html'),shell('PACE-RAG v1.6 approved knowledge refresh',`<p>Owner approved the four refreshed commercial source snapshots and all affected/new Q&amp;A. Versioned source/answer hashes and publication permissions are validated; this approval does not certify ranking, deployed security, provider billing or independent evaluation.</p>${table}<p>Existing development Top-1 fell from 80% to 72%; both preserved verification Top-3 scores also regressed. New topic coverage improved. No ranker or threshold tuning or relabeling was performed. Labels remain agent-authored; candidateExact uses indexed reviewed wording and is not a holdout. All 124 professional critical requests abstain, with zero observed false automatic answers, citation failures or cross-corpus references. Live generation and automatic semantic answer reuse remain disabled.</p><p><a href="evaluation/knowledge-v16-approved-semantic.json">Approved corpus measurements</a> · <a href="evaluation/knowledge-v16-approved-semantic-cases.json">All semantic outcomes</a> · <a href="evaluation/knowledge-v16-approved-lexical.json">Lexical fallback measurements</a></p>`));
 await cp(resolve(output,'evaluation.html'),resolve('apps/rag-lab/public/evaluation.html'));await cp(resolve(output,'evaluation'),resolve('apps/rag-lab/public/evaluation'),{recursive:true});
}
if(JSON.parse(await readFile('package.json','utf8')).version==='1.6.1'){
 await (await import('./ranking-review-check.mjs')).verifyRankingReview();
 const r=JSON.parse(await readFile('evaluation/reports/v161-semantic-paired.json','utf8'));
 const pct=x=>(100*x).toFixed(1)+'%';
 const table='<table><caption>Frozen agent-authored regression sets; no independent holdout</caption><thead><tr><th>Set</th><th>v1.5 Top-1 / Top-3</th><th>v1.6 Top-1 / Top-3</th><th>v1.6.1 Top-1 / Top-3</th></tr></thead><tbody>'+Object.entries(r.sets).map(([id,s])=>`<tr><td>${escape(id)}</td><td>${pct(s.v15.top1)} / ${pct(s.v15.top3)}</td><td>${pct(s.v16.top1)} / ${pct(s.v16.top3)}</td><td>${pct(s.corrected.top1)} / ${pct(s.corrected.top3)}</td></tr>`).join('')+'</tbody></table>';
 for(const mode of ['semantic','lexical'])await cp(`evaluation/reports/v161-${mode}-paired.json`,resolve(output,'evaluation',`v161-${mode}-paired.json`));
 await writeFile(resolve(output,'evaluation.html'),shell('PACE-RAG v1.6.1 retrieval investigation',`<p>Actual local paired artifacts reproduce the reported v1.5 and v1.6 baselines. Approved content, labels, scoring rules and MiniLM are preserved. Bounded question-facet adjustments and deterministic answer-ID ties partially recover suggestions. A question-heavy lexical trial was rejected for poorer legacy recall.</p>${table}<p>Recovery remains incomplete: Original 100 Top-1 is 76% against an 80% target; Preserved 50 Top-3 is 94% against 96%. These are known release limitations, not certified recovery. The 40-question set reaches 75% / 100%. All 124 professional critical requests abstain, and no incorrect automatic answers, citation failures or cross-corpus references were observed. All eight requested exact examples and five new approved answers remain available. Automatic semantic reuse and live inference remain disabled. No fresh external holdout or deployed Cloudflare verification exists.</p><p><a href="evaluation/v161-semantic-paired.json">Semantic per-query ranks, Top-5 and score contributions</a> · <a href="evaluation/v161-lexical-paired.json">Lexical fallback comparison</a></p>`));
 await cp(resolve(output,'evaluation.html'),resolve('apps/rag-lab/public/evaluation.html'));await cp(resolve(output,'evaluation'),resolve('apps/rag-lab/public/evaluation'),{recursive:true});
}

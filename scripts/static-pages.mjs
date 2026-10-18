import { readFile, writeFile, mkdir, cp, readdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
const output = resolve("dist/lab");
const escape = (text) =>
  String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const shell = (title, body) =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${escape(title)} · PACE-RAG</title><style>body{font:1.1rem/1.7 system-ui,sans-serif;max-width:75ch;margin:3rem auto;padding:0 1rem;color:#20352b;background:#f5f6ee}a{color:#245541}h1,h2{line-height:1.2}li{margin:.5rem 0}article{border-top:1px solid #748574;padding:1rem 0}:focus-visible{outline:3px solid #865f12;outline-offset:4px}</style></head><body><a href="/pace-rag/">PACE-RAG Lab</a><main><h1>${escape(title)}</h1>${body}</main></body></html>`;
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
        `<p>${doc.approval?.scope === "local-test" ? "Test-approved source snapshot · publication review required." : doc.status === "approved" ? "Reviewed public source snapshot." : "Draft source snapshot · owner review required."} ${["insurance","education","wensymes","rental"].includes(doc.id) ? "Historical background snapshot: earlier stack-availability qualifications are superseded by the owner-confirmed technology inventory dated 18 October 2026. See the current technology source in this library." : ""} ${doc.provenance === "synthetic" ? "Synthetic engineering example." : doc.provenance === "implementation-documentation" ? "Actual implementation documentation; local verification limits apply." : ""}</p>${doc.text
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
  const body = `<p>${preview ? "Local test preview. Test-approved Q&A and source snapshots are available; public release requires owner approval." : "Reviewed public knowledge."} No live inference is required to read this library.</p><h2>Documents</h2><ul>${currentDocs.map((doc) => `<li><a href="sources/${doc.id}.html">${escape(doc.title)}</a></li>`).join("")}</ul><h2>${preview ? "Test questions and answers" : "Reviewed questions and answers"}</h2>${currentAnswers.map((answer) => `<article><h3>${escape(answer.canonicalQuestion)}</h3><p>${escape(answer.answerText)}</p><ul>${answer.citations.map((c) => `<li><a href="${escape(c.url)}">${escape(c.title)}</a></li>`).join("")}</ul></article>`).join("")}`;
  await writeFile(
    resolve(root, "index.html"),
    shell(
      `${corpus === "lab" ? "Implementation and synthetic Lab" : "Portfolio"} knowledge library`,
      body,
    ),
  );
}
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
    `<p>Local draft review. Automatic semantic answer reuse is disabled. Citation membership does not establish factual entailment. Human grounding review and physical-device/screen-reader checks are release gates.</p><pre style="white-space:pre-wrap">${escape(report)}</pre>`,
  ),
);
await writeFile(
  resolve(output, "privacy.html"),
  shell(
    "Privacy and resource use",
    `<p>Local search keeps questions in browser memory and uses device CPU and memory. Opening the assistant or choosing a cached starter does not download a model. The first submitted custom semantic query loads the local model; keyword-only queries do not. The model weighs approximately 23 MB before runtime and tokenizer overhead. Static retrieval uses no Workers AI neurons.</p><p>Live generation is disabled by default. When explicitly configured and requested, it transmits the question and public evidence to Cloudflare Workers AI. The application does not persist raw questions, prompts or generated answers. Short-lived daily pseudonymous abuse keys expire after 48 hours. Provider processing is governed separately by Cloudflare.</p><p>No assistant questions, answers or embeddings are sent to analytics. Browser caches may be evicted. Already-downloaded public material cannot be remotely erased.</p>`,
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
const semanticPath='evaluation/reports/efrd-semantic-v1.json';
try {
  const report=JSON.parse(await readFile(semanticPath,'utf8'));
  const metrics=Object.entries(report.scorecards).map(([corpus,m])=>`<article><h2>${escape(corpus)}</h2><p>${m.positiveQuestions} independent-wording positives, ${m.criticalQuestions} critical questions, ${m.compositeQuestions} structured questions.</p><ul><li>Top-1 ranking: ${(m.top1ApprovedAnswerRankingAccuracy*100).toFixed(1)}%</li><li>Top-3 recall: ${(m.top3CandidateRecall*100).toFixed(1)}% (target 90%; ${m.top3CandidateRecall>=.9?'met in this sample':'not met'})</li><li>Appropriate critical abstention: ${(m.appropriateAbstentionRate*100).toFixed(1)}%</li><li>Incorrect automatic answers: ${m.incorrectAutomaticMatches}</li><li>Invalid supporting references: ${m.invalidCitationReferences}; cross-corpus references: ${m.crossCorpusReferences}</li><li>Direct-answer coverage across common positive/composite intents: ${(m.directAnswerCoverageCommonIntents*100).toFixed(1)}%</li></ul></article>`).join('');
  await mkdir(resolve(output,'evaluation'),{recursive:true});
  for(const name of ['efrd-semantic-v1.json','efrd-semantic-cases-v1.json','efrd-lexical-v1.json','efrd-lexical-cases-v1.json','efrd-local-verification-v1.json'])await cp(`evaluation/reports/${name}`,resolve(output,'evaluation',name)).catch(()=>{});
  await writeFile(resolve(output,'evaluation.html'),shell('EFRD evaluation and limitations',`<p>Measured ${escape(report.measuredAt)}. Dataset ${escape(report.dataset.version)}; software ${escape(report.softwareVersion)}. Agent-authored held-out wording is separate from indexed aliases; labels await independent review. This set was inspected during development and is not a blind certification. No semantic automatic-answer cutoff is calibrated.</p>${metrics}<p>Zero live provider calls in this pure local evaluation. No live generation grounding was executed. Browser fallback/request measurements are separately recorded in QA. Targets, finite observations and claim entailment are distinct.</p><p><a href="evaluation/efrd-semantic-v1.json">Machine-readable semantic report</a> · <a href="evaluation/efrd-semantic-cases-v1.json">Per-question semantic results</a> · <a href="evaluation/efrd-lexical-v1.json">Lexical fallback report</a> · <a href="evaluation/efrd-local-verification-v1.json">Local browser, resource and bundle evidence</a></p><p>Reproduce: <code>npm run eval:retrieval -- --semantic</code> after preparing model/index assets. Physical devices, screen readers and real provider billing are not verified here.</p>`));
} catch { /* Preserve the previous honest not-run report when no EFRD result exists. */ }
await writeFile(resolve(output,'architecture.html'),shell('PACE-RAG architecture and methodology',`<p>Knowledge first. Inference optional. Evidence always.</p><ol><li>Load checksum-verified public corpus records, reviewed question registry and static source pages. The model does not start on opening.</li><li>Exact reviewed wording reuses its own cached citations. Bounded technology templates use only the owner-confirmed versioned PACE v1.2 inventory, preserving generation and project ownership.</li><li>Other custom semantic questions initialize the pinned MiniLM q8 single-thread WASM worker. Canonical/alias and passage rankings use real cosine and lexical scores. Scores describe relevance, not accuracy probabilities.</li><li>Without a supported direct answer, show an evidence limitation and distinct related questions/passages. Keyword/static paths remain available after failure.</li><li>Live generation is disabled. Existing guarded gateway/budget tests use local SQLite and deterministic provider/Turnstile mocks; they are not deployed Cloudflare or billing verification.</li></ol><p>Supporting sources belong to the answer, not merely top-ranked passages. Traces remain in memory. Draft/retired answers are excluded from current artifacts, previous generated release folders are omitted from static packages, and stale asset hashes/versions fail closed. Already-downloaded public bytes cannot be erased remotely.</p><p>New technical Q&A was explicitly authorized for local testing. Public publication still requires owner content/license review. No generated answer is automatically promoted.</p><p><a href="evaluation.html">Observed evaluation and reproducible case results</a> · <a href="privacy.html">Privacy/resource boundaries</a></p>`));
for(const file of ['evaluation.html','architecture.html'])await cp(resolve(output,file),resolve('apps/rag-lab/public',file));

await rm("apps/rag-lab/public/evaluation",{recursive:true,force:true});
await cp(resolve(output,"evaluation"),"apps/rag-lab/public/evaluation",{recursive:true}).catch(()=>{});

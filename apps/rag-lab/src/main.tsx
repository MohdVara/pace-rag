import {portfolioUrl,caseStudyUrl} from "./links";
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import FailureDemos from "./FailureDemos";
import Assistant from "../../../packages/portfolio-assistant/src/Assistant";
import { SCOPES } from "../../../packages/knowledge-schema/src/provenance.mjs";
import type { KnowledgeScope } from "../../../packages/knowledge-schema/src/contracts";
import "./style.css";
function Lab() {
  const [scopeId, setScopeId] = useState<KnowledgeScope>("professional");
  const [publicationReady, setPublicationReady] = useState(false);
  const scope=SCOPES[scopeId];
  return <>
    <a className="skip" href="#main">Skip to search</a>
    <header className="lab-nav"><a href={portfolioUrl}>mpv. / engineering</a><span>PACE-RAG v1.6.1 · Engineering RAG Lab{publicationReady&&<> · <span>Public demo</span></>}</span></header>
    <main id="main">
      <p className="eyebrow">ENGINEERING RAG LAB</p>
      <h1>Knowledge first.<br/><em>Inference optional.</em><br/>Evidence always.</h1>
      <p>PACE-RAG means <strong>Portfolio Assistant with Cited Evidence — Retrieval-Augmented Generation</strong>. Reviewed cached answers, deterministic technology composition and local retrieval ground responses. Live generative inference is currently disabled; RAG names the architectural approach and direction, not a model call for every query.</p>
      <p className="intro">Ask questions about professional experience, explore how this RAG system works, or test document retrieval using fictional engineering scenarios. Every answer identifies its sources.</p>
      <fieldset className="source-selector"><legend>What would you like to explore?</legend><div>{(Object.keys(SCOPES) as KnowledgeScope[]).map(id=><label key={id} className={id===scopeId?'source-choice selected':'source-choice'}><input type="radio" name="knowledge-source" value={id} checked={id===scopeId} onChange={()=>setScopeId(id)}/><span><strong>{SCOPES[id].title}</strong><span>{SCOPES[id].description}</span></span></label>)}</div></fieldset>
      <section className="source-explanation" aria-label="About the selected source">
        <h2>{scopeId==='fictional'?'About these documents':`About ${scope.title}`}</h2><p>{scope.explanation}</p>
        {scopeId==='fictional'&&<p>Bundled Atlas test fixtures are literal text in this repository. They were human-authored with AI assistance, as confirmed by the portfolio owner. The specific tools and preparation dates are not recorded. They do not represent employer systems, customer incidents or confidential operational records.</p>}
        <a href={`/pace-rag/knowledge/${scope.library}/index.html`}>Browse source documents</a>
        {scopeId==='fictional'&&<p><a href="/pace-rag/knowledge/lab/sources/search-runbook.html">Inspect a fictional source document</a></p>}
      </section>
      <Assistant key={scopeId} scopeId={scopeId} corpusId={scope.corpusId} lab libraryExternal onPublicationReady={setPublicationReady}/>
      <section className="lab-notes" aria-label="Further exploration"><h2>Explore the system</h2><p><a href={caseStudyUrl}>PACE-RAG engineering case study</a></p><p><a href="/pace-rag/architecture.html">RAG architecture</a> · <a href="/pace-rag/evaluation.html">Evaluation and known limitations</a> · <a href="/pace-rag/technology-evaluation.html">Technology query evaluation</a> · <a href="/pace-rag/privacy.html">Privacy and resource use</a></p><FailureDemos/></section>
    </main><footer className="lab-bottom">Evidence always. Independent engineering demonstration; no enterprise production deployment claim.</footer>
  </>;
}
createRoot(document.getElementById("root")!).render(<React.StrictMode><Lab/></React.StrictMode>);

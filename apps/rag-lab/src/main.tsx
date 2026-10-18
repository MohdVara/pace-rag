import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import FailureDemos from "./FailureDemos";
import Assistant from "../../../packages/portfolio-assistant/src/Assistant";
import "./style.css";
function Lab() {
  const [view, setView] = useState<"lab" | "assistant">("lab");
  const [corpus, setCorpus] = useState<"portfolio" | "lab">("lab");
  return (
    <>
      <a className="skip" href="#main">
        Skip to search
      </a>
      <header className="lab-nav">
        <a href="https://mohd.paramasvara.online/">mpv. / engineering</a>
        <span>PACE-RAG v1.1 · local review</span>
      </header>
      <main id="main">
        <p className="eyebrow">ENGINEERING RAG LAB</p>
        <h1>
          Knowledge first.
          <br />
          <em>Inference optional.</em>
        </h1>
        <p className="intro">
          Knowledge first. Inference optional. Evidence always. Inspect actual implementation documentation and clearly labelled synthetic examples; professional evidence stays in its own corpus.
        </p>
        <nav className="corpus-tabs" aria-label="Choose experience"><button aria-pressed={view==='lab'} onClick={()=>setView('lab')}>Engineering inspection</button><button aria-pressed={view==='assistant'} onClick={()=>setView('assistant')}>Portfolio assistant preview</button></nav>
        {view==='lab'&&<nav className="corpus-tabs" aria-label="Choose an isolated corpus">
          <button
            aria-pressed={corpus === "lab"}
            onClick={() => setCorpus("lab")}
          >
            Implementation & synthetic lab
          </button>
          <button
            aria-pressed={corpus === "portfolio"}
            onClick={() => setCorpus("portfolio")}
          >
            Portfolio review
          </button>
        </nav>}
        <Assistant key={`${view}-${corpus}`} corpusId={view==='assistant'?'portfolio':corpus} lab={view==='lab'} />
        {view==='lab'&&<FailureDemos/>}
        <section className="lab-notes">
          <h2>What this demonstrates</h2>
          <div>
            <article>
              <h3>Browser retrieval</h3>
              <p>
                Pinned MiniLM embeddings run in a Web Worker. Static vectors
                rank questions and document chunks without a generation API.
              </p>
            </article>
            <article>
              <h3>Evidence boundaries</h3>
              <p>
                Similarity suggests related questions. Supporting evidence is separate from topical passages. Generation can use only independently validated,
                approved server evidence.
              </p>
            </article>
            <article>
              <h3>Graceful degradation</h3>
              <p>
                Model failure falls back to lexical search. API failure leaves
                search intact. Source pages remain ordinary static HTML.
              </p>
            </article>
          </div>
          <p>
            <a href="/pace-rag/architecture.html">Architecture and methodology</a> · <a href="/pace-rag/evaluation.html">Evaluation and limitations</a> ·{" "}
            <a href="/pace-rag/privacy.html">Privacy and resource use</a>
          </p>
        </section>
      </main>
      <footer className="lab-bottom">
        Independent engineering demonstration. No enterprise production
        deployment claim.
      </footer>
    </>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Lab />
  </React.StrictMode>,
);

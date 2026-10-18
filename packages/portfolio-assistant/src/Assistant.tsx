import { useEffect, useRef, useState } from "react";
import type { AnswerResult, AnswerSource, GenerateResponse, ServiceError } from "../../knowledge-schema/src/contracts";
import type { AssistantProps } from "./index";
import { loadCorpus, type LoadedCorpus } from "../../semantic-core/src/load";
import { EmbeddingClient } from "../../semantic-core/src/client";
import { retrieve, answerCurrent } from "../../semantic-core/src/retrieval.mjs";
import { resolveAnswer, validateRemoteGeneration, generatedAnswer } from "../../semantic-core/src/answers.mjs";
import Inspection, { type InteractionResources } from "./Inspection";
import { challenge } from "./live";
import "./style.css";
class ServiceFailure extends Error { constructor(public serviceError:ServiceError){super(serviceError.message);} }
const sourceLabels:Record<string,string>={"owner-confirmed":"Owner-confirmed", "synthetic-lab":"Synthetic example", "public-demonstrated":"Implementation documentation"};
function Sources({sources}:{sources:AnswerSource[]}) {return <section className="pace-supporting"><h4>Sources &amp; evidence</h4><ul className="pace-sources">{sources.map(source=><li key={source.sourceId}><a href={source.url}>{source.title}</a><small>{sourceLabels[source.evidenceStatus]||source.evidenceStatus} · {source.approvalScope==='local-test'?'Test review':'Publication review'}</small></li>)}</ul></section>;}
export default function Assistant({corpusId='portfolio',assetBase='/pace-rag/',onClose,lab=false,live}:AssistantProps){
  const [data,setData]=useState<LoadedCorpus>();
  const [question,setQuestion]=useState(''); const [query,setQuery]=useState('');
  const [result,setResult]=useState<ReturnType<typeof retrieve>>(); const [answer,setAnswer]=useState<AnswerResult>();
  const [generation,setGeneration]=useState<GenerateResponse>(); const [status,setStatus]=useState('Loading the static knowledge library…');
  const [ready,setReady]=useState(false),[busy,setBusy]=useState(false),[liveBusy,setLiveBusy]=useState(false),[quotaDenied,setQuotaDenied]=useState(false);
  const [semanticEnabled,setSemanticEnabled]=useState(true); const [resources,setResources]=useState<InteractionResources>({requested:false,sent:0,received:false});
  const lifecycle=useRef<AbortController>(),client=useRef<EmbeddingClient>(),operation=useRef<AbortController>();
  const disposed=useRef(false),searchId=useRef(0); const verification=useRef<HTMLDivElement>(null);
  const visibleStarted=useRef(0);
  useEffect(()=>{if(!answer)return;const frame=requestAnimationFrame(()=>{if(visibleStarted.current)performance.measure('pace-rag:answer-next-frame',{start:visibleStarted.current,end:performance.now(),detail:{origin:answer.origin}});});return()=>cancelAnimationFrame(frame);},[answer]);
  useEffect(()=>{
    disposed.current=false;const abort=new AbortController();lifecycle.current=abort;
    setData(undefined);setReady(false);setBusy(false);setResult(undefined);setAnswer(undefined);setGeneration(undefined);
    loadCorpus(assetBase,corpusId,abort.signal,loaded=>{if(!abort.signal.aborted){setData({...loaded});setStatus('Static knowledge ready. Cached questions and keyword search are available.');}})
      .then(loaded=>{if(abort.signal.aborted)return;setData(loaded);if(!loaded.questionVectors||!loaded.chunkVectors){setSemanticEnabled(false);setStatus(loaded.vectorError||'Lexical search ready. Semantic assets are unavailable.');return;}
        const capabilities=navigator as Navigator&{connection?:{saveData?:boolean};deviceMemory?:number};
        const enabled=!(capabilities.connection?.saveData||(capabilities.deviceMemory&&capabilities.deviceMemory<2));setSemanticEnabled(enabled);
        setStatus(enabled?'Knowledge ready. The local model downloads only when a custom semantic query needs it.':'Data saver or limited memory detected. Keyword search is ready; semantic search is optional.');
      }).catch(()=>{if(!abort.signal.aborted)setStatus('Knowledge assets are unavailable. Use the static knowledge browser below.');});
    return()=>{disposed.current=true;searchId.current++;abort.abort();client.current?.dispose();client.current=undefined;operation.current?.abort();};
  },[assetBase,corpusId]);
  function cancelSearch(){searchId.current++;client.current?.dispose();client.current=undefined;setReady(false);setBusy(false);setStatus('Semantic search cancelled. Keyword results remain available.');}
  async function search(text=question,useSemantic=semanticEnabled){
    if(!data||busy||!text.trim())return;
    const started=performance.now(),id=++searchId.current,signal=lifecycle.current!.signal;
    visibleStarted.current=started;
    setBusy(true);setGeneration(undefined);setQuestion(text);setQuery(text);setResources({requested:false,sent:0,received:false});
    const lookup=(vector?:Float32Array)=>retrieve({question:text,corpus:data,vector,questionVectors:data.questionVectors,chunkVectors:data.chunkVectors});
    const lexical=lookup();const direct=resolveAnswer({question:text,corpus:data,retrieval:lexical}) as AnswerResult;
    setResult(lexical);setAnswer(direct);setResources(value=>({...value,renderMs:performance.now()-started}));
    try {
      if(direct.origin!=='insufficient-evidence'){setStatus('Reviewed local answer ready. No model initialization or remote generation needed.');return;}
      if(useSemantic&&data.questionVectors&&data.chunkVectors){
        if(!client.current){setStatus('Loading the local semantic model for your query. Keyword results are available below.');client.current=new EmbeddingClient(assetBase,message=>{if(!signal.aborted&&id===searchId.current)setStatus(message);},data.workerPath!);}
        try {const embeddingStart=performance.now();const vector=await client.current.embed(text);
          if(!signal.aborted&&id===searchId.current){const ranked=lookup(vector);setResult(ranked);setAnswer(resolveAnswer({question:text,corpus:data,retrieval:ranked}) as AnswerResult);setReady(true);setStatus('Semantic search ready. Similarity ranks relevance; it is not factual confidence.');setResources(value=>({...value,embeddingMs:performance.now()-embeddingStart,renderMs:performance.now()-started}));}
        } catch {if(!signal.aborted&&id===searchId.current){client.current?.dispose();client.current=undefined;setReady(false);setSemanticEnabled(false);setStatus('Lexical search ready. The semantic model is unavailable; enable it to retry on your next query.');}}
      }
    } finally {if(!signal.aborted&&id===searchId.current)setBusy(false);}
  }
  async function generate() {
    if (!live || !live.verified || !data || !result || liveBusy || quotaDenied || !verification.current) return;
    setResources(value => ({...value,requested:true}));
    setLiveBusy(true);
    setGeneration(undefined);
    const abort = new AbortController();
    operation.current = abort;
    try {
      const api = new URL(live.apiBase);
      if (
        !["https:", "http:"].includes(api.protocol) ||
        (api.protocol === "http:" &&
          !["localhost", "127.0.0.1"].includes(api.hostname))
      )
        throw new Error("Invalid API configuration");
      let visitorToken = "";
      try {
        visitorToken =
          sessionStorage.getItem(`pace-rag-visitor-${api.origin}`) || "";
      } catch {}
      const token = await challenge(
        live.turnstileSiteKey,
        verification.current,
        abort.signal,
      );
      const post = async (path: string, body: unknown) => {
        const deadline = setTimeout(() => abort.abort(), 30000);
        try {
          if (path.endsWith("/generate")) setResources(value => ({...value,sent:value.sent+1}));
          const response = await fetch(new URL(path, api), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: abort.signal,
          });
          if (path.endsWith("/generate")) setResources(value => ({...value,received:true}));
          const value = await response.json();
          if (!response.ok) {
            if (value.error?.code === "VERIFICATION_REQUIRED") {
              try {
                sessionStorage.removeItem(`pace-rag-visitor-${api.origin}`);
              } catch {}
            }
            if (value.error?.code) throw new ServiceFailure(value.error);
            throw new Error(
              value.error?.message ||
                "Live AI is unavailable. Cached search remains available.",
            );
          }
          return value;
        } finally {
          clearTimeout(deadline);
        }
      };
      let turnstileToken = token;
      if (!visitorToken) {
        const session = await post(`/v1/${corpusId}/session`, {
          turnstileToken: token,
        });
        visitorToken = session.visitorToken;
        try {
          sessionStorage.setItem(
            `pace-rag-visitor-${api.origin}`,
            visitorToken,
          );
        } catch {}
        turnstileToken = await challenge(
          live.turnstileSiteKey,
          verification.current,
          abort.signal,
        );
      }
      const requestId = crypto.randomUUID();
      const timer = setTimeout(() => abort.abort(), 30000);
      try {
        const response: GenerateResponse = await post(
          `/v1/${corpusId}/generate`,
          {
            requestId,
            corpusVersion: data.corpusVersion,
            question: query,
            selectedChunkIds: result.passages.map((p) => p.id),
            visitorToken,
            turnstileToken,
          },
        );
        validateRemoteGeneration(response, {corpus:data,requestId,passages:result.passages});
        if (!disposed.current) setGeneration(response);
      } finally {
        clearTimeout(timer);
      }
    } catch (error) {
      if (error instanceof ServiceFailure && error.serviceError.code === "PROVIDER_QUOTA") setQuotaDenied(true);
      setResources(value => ({...value,failure:error instanceof Error ? error.message : "Unavailable"}));
      if (!disposed.current)
        setGeneration({
          kind: "unavailable",
          requestId: "",
          error:
            error instanceof ServiceFailure
              ? error.serviceError
              : {
                  code: "MODEL_UNAVAILABLE",
                  message: abort.signal.aborted
                    ? "AI request timed out or was cancelled. Your sources remain available."
                    : error instanceof Error
                      ? error.message
                      : "AI unavailable",
                  fallback: "cached-search",
                },
        });
    } finally {
      if (!disposed.current) setLiveBusy(false);
    }
  }
  const displayedAnswer = generation?.kind === "generated" && data ? generatedAnswer(generation,data) as AnswerResult : answer;
  const liveAvailable=!!live?.verified;
  const approved=data?.answers.filter(item=>answerCurrent(item,data))||[];
  const starters=corpusId==='portfolio'?approved.filter(item=>['portfolio-answer-insurance-work','portfolio-answer-modernisation','portfolio-answer-rag-evidence','portfolio-answer-contact'].includes(item.id)):approved.filter(item=>item.id.startsWith('lab-answer-efrd-')).slice(0,4);
  return <section className="pace-assistant" aria-label={lab?'Engineering RAG Lab search':'Ask about my engineering work'}>
    <header className="pace-header"><div><p className="pace-kicker">PACE-RAG / {corpusId==='portfolio'?'Engineering work':'Implementation & synthetic examples'}</p><h2>{lab?'Inspect the retrieval. Follow the evidence.':'Ask about my engineering work'}</h2></div>{onClose&&<button type="button" onClick={onClose}>Close assistant</button>}</header>
    {data?.manifest.preview&&<p className="pace-preview">Local test preview. Test-approved cached answers and owner-confirmed technology facts are available. Publication and live evidence ingestion remain blocked.</p>}
    <p className="pace-status" role="status">{status}</p>
    {data?.manifest.semanticReady&&<label><input type="checkbox" checked={semanticEnabled} disabled={busy} onChange={event=>setSemanticEnabled(event.target.checked)}/>Use semantic search for custom queries (downloads a local model when needed)</label>}
    <form onSubmit={event=>{event.preventDefault();void search();}}><label htmlFor={`pace-query-${corpusId}`}>Your question</label><textarea id={`pace-query-${corpusId}`} maxLength={600} rows={2} value={question} onChange={event=>setQuestion(event.target.value)} placeholder={corpusId==='portfolio'?'Which projects used React?':'How does PACE-RAG avoid wasting AI inference?'}/><div className="pace-actions"><button type="submit" disabled={!data||busy||liveBusy}>{busy?'Searching…':'Search knowledge'}</button>{busy&&<button type="button" onClick={cancelSearch}>Cancel semantic search</button>}<span>{semanticEnabled&&data?.questionVectors?(ready?'Semantic + lexical fallback':'Semantic when needed + keyword fallback'):'Keyword search'} · no automatic remote inference</span></div></form>
    {data&&!result&&<div className="pace-starters"><h3>Start with a reviewed question</h3>{corpusId==='portfolio'&&<button type="button" onClick={()=>void search('What technologies have you worked with?',false)}>What technologies have you worked with?</button>}{starters.map(item=><button type="button" key={item.id} onClick={()=>void search(item.canonicalQuestion,false)}>{item.canonicalQuestion}</button>)}</div>}
    {displayedAnswer&&<article className="pace-answer"><p className="pace-kicker">{displayedAnswer.origin==='live-generation'?'AI-generated answer':displayedAnswer.origin==='approved-cache'?(displayedAnswer.approvalScope==='local-test'?'Test-approved cached answer · publication review required':'Reviewed cached answer'):displayedAnswer.origin==='approved-composite'?'Assembled from owner-confirmed facts':'Insufficient evidence'}</p><h3>{query}</h3><p>{displayedAnswer.answer||displayedAnswer.explanation}</p>{displayedAnswer.sources.length>0&&<Sources sources={displayedAnswer.sources}/>}
      <details className="pace-how"><summary>How this answer was produced</summary><dl><dt>Answer origin</dt><dd>{displayedAnswer.origin}</dd><dt>Retrieval method</dt><dd>{displayedAnswer.retrievalMethod}</dd><dt>AI generation used</dt><dd>{displayedAnswer.origin==='live-generation'?'Yes':'No'}</dd><dt>Evidence status</dt><dd>{displayedAnswer.evidenceStatus.join(', ')}</dd></dl><p>{displayedAnswer.explanation}</p><a href={`${assetBase}#main`}>Inspect the Engineering RAG Lab</a></details>
      {displayedAnswer.nextAction&&<p><a href={displayedAnswer.nextAction.href}>{displayedAnswer.nextAction.label}</a></p>}
    </article>}
    {answer&&answer.relatedQuestions.length>0&&<section className="pace-followups"><h3>{answer.answer?'Explore related questions':'Related questions'}</h3>{answer.relatedQuestions.map(text=><button className="pace-related" type="button" key={text} disabled={busy} onClick={()=>void search(text,false)}>{approved.some(a=>a.canonicalQuestion===text)?text:`Search: ${text}`}</button>)}</section>}
    {lab&&data&&result&&answer&&<Inspection corpus={data} retrieval={result} answer={displayedAnswer||answer} resources={resources}/>}
    {result&&result.passages.length>0&&<details className="pace-passages"><summary>Other retrieved passages · topical relevance, not supporting citations</summary>{result.passages.map(passage=><article key={passage.id}><p className="pace-kicker">Source passage{lab?` · ${passage.score.toFixed(3)} ${result.method}`:''}</p><p>{passage.text}</p><a href={passage.citation.url}>{passage.citation.title}</a>{lab&&<small>{passage.id} · lexical {passage.lexicalScore.toFixed(3)}</small>}</article>)}</details>}
    {result&&<section className="pace-generation" aria-label="Optional live generation"><h3>Optional synthesis</h3><p>{liveAvailable?'Explicit generation sends the question and authorized public evidence to the guarded API. No automatic retry or cache publication occurs.':'Live AI is disabled and unavailable in this build. Local answers and retrieval remain usable.'}</p>{liveAvailable&&<button type="button" onClick={()=>void generate()} disabled={liveBusy||quotaDenied||!result.passages.length}>{quotaDenied?'Generation paused after quota denial':liveBusy?'Verifying and generating…':'Generate an answer from these sources'}</button>}<div ref={verification}/>{liveBusy&&<button type="button" onClick={()=>operation.current?.abort()}>Cancel AI request</button>}</section>}
    {generation?.kind==='generated'&&<p className="pace-usage">{generation.usage.basis==='provider-token-usage'?'Validated token-accounting estimate':'Conservative reservation estimate'}: {generation.usage.accountedNeurons.toFixed(1)} neurons. Provider billing: not measured.</p>}
    {generation?.kind==='insufficient-evidence'&&<p role="status">{generation.message}</p>}{generation?.kind==='unavailable'&&<p role="status">{generation.error.message}</p>}
    <details className="pace-library"><summary>Browse all reviewed questions</summary>{approved.map(item=><button type="button" key={item.id} disabled={busy} onClick={()=>void search(item.canonicalQuestion,false)}>{item.canonicalQuestion}</button>)}</details>
    <footer className="pace-footer">{corpusId==='portfolio'&&<nav aria-label="Professional links"><a href="https://mohd.paramasvara.online/#work">Projects</a><a href="https://rxresu.me/mwara95/2-page-resume">Résumé</a><a href="https://mohd.paramasvara.online/#contact">Contact</a></nav>}<a href={`${assetBase}knowledge/${corpusId}/index.html`}>Browse the static knowledge library</a><p>Local search uses device CPU, memory and model downloads. Cache-only Workers AI inference calls: 0. {corpusId==='lab'?'Implementation documentation and synthetic examples have distinct source labels.':'Public portfolio evidence only; no confidential employer material.'}</p></footer>
    {lab&&data&&<details className="pace-diagnostics"><summary>Release and matching diagnostics</summary><dl><dt>Corpus / version</dt><dd>{data.corpusId} / {data.corpusVersion}</dd><dt>Embedding specification</dt><dd>{data.manifest.embedding.id}</dd><dt>Policy</dt><dd>Exact approved wording and deterministic fact templates; no uncalibrated semantic automatic answers.</dd><dt>Sources / chunks</dt><dd>{data.documents.length} / {data.chunks.length}</dd></dl></details>}
  </section>;
}

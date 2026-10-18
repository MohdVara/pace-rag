import {Component, lazy, Suspense, useRef, useState, type ReactNode} from 'react';

const Assistant = lazy(() => import('./PaceAssistant'));

class AssistantRecovery extends Component<{children: ReactNode}, {failed: boolean}> {
  state = {failed: false};
  static getDerivedStateFromError() { return {failed: true}; }
  render() {
    return this.state.failed ? <p role="status">The assistant could not load. <a href="/pace-rag/knowledge/portfolio/index.html">Browse the static knowledge library</a>.</p> : this.props.children;
  }
}

export default function PaceAssistantLauncher() {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  return <div>
    <button ref={button} type="button" className="button secondary" aria-expanded={open} aria-controls="pace-assistant-region" onClick={() => setOpen(!open)}>
      Ask about my engineering work
    </button>
    <div id="pace-assistant-region" hidden={!open}>{open && <>
      <AssistantRecovery><Suspense fallback={<p role="status">Loading the knowledge assistant…</p>}>
        <Assistant corpusId="portfolio" onClose={() => { setOpen(false); button.current?.focus(); }} />
      </Suspense></AssistantRecovery>
    </>}</div>
    <noscript><a href="/pace-rag/knowledge/portfolio/index.html">Browse the static knowledge library</a></noscript>
  </div>;
}

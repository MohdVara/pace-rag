import {Component, lazy, Suspense, useRef, useState, type ReactNode} from 'react';
import './PaceAssistantLauncher.css';

const Assistant = lazy(() => import('./PaceAssistant'));
const library = '/pace-rag/knowledge/professional/index.html';

class AssistantRecovery extends Component<{children: ReactNode}, {failed: boolean}> {
  state = {failed: false};
  static getDerivedStateFromError() { return {failed: true}; }
  render() {
    return this.state.failed ? <p role="status">The assistant could not load. <a href={library}>Read the source library</a> or try opening it again.</p> : this.props.children;
  }
}

export default function PaceAssistantLauncher() {
  const [open, setOpen] = useState(false);
  const disclosure = useRef<HTMLDetailsElement>(null);
  const summary = useRef<HTMLElement>(null);
  function close() {
    if (disclosure.current) disclosure.current.open = false;
    setOpen(false);
    summary.current?.focus();
  }
  return <details ref={disclosure} className="experience-assistant" onToggle={event => setOpen(event.currentTarget.open)}>
    <summary ref={summary}>Ask about my engineering experience</summary>
    <div id="pace-assistant-region" role="region" aria-label="Engineering experience assistant">
      <p className="experience-assistant-intro">Explore my professional experience through concise answers and supporting sources. Search runs on your device. Live AI is disabled.</p>
      {open && <AssistantRecovery><Suspense fallback={<p role="status">Loading the knowledge assistant…</p>}><Assistant onClose={close} /></Suspense></AssistantRecovery>}
      <p className="experience-assistant-links"><a href={library}>Browse professional sources</a><a href="https://pace-reg.paramasvara.online/pace-rag/">Explore the Engineering RAG Lab ↗</a></p>
      <noscript><p>Interactive search needs JavaScript. The source library and Lab documentation remain readable.</p></noscript>
    </div>
  </details>;
}

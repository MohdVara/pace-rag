import Assistant from '@pace-rag/portfolio-assistant';
import '@pace-rag/portfolio-assistant/style.css';

const starters = [
  'What technologies have you worked with?',
  'Which projects used React?',
  'What modernisation experience is public?',
] as const;

export default function PaceAssistant({onClose}: {onClose: () => void}) {
  return <Assistant corpusId="portfolio" scopeId="professional" assetBase="/pace-rag/" presentation="portfolio" starterQuestions={starters} libraryExternal onClose={onClose} />;
}

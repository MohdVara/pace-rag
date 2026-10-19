// Keep the currently working public hostname; local origins are dev-only.
export const portfolioUrl = import.meta.env.DEV
  ? (import.meta.env.VITE_PORTFOLIO_URL || 'http://localhost:5173/')
  : 'https://mohd.paramasvara.online/';
export const caseStudyUrl = new URL('pace-rag-case-study/', portfolioUrl).href;

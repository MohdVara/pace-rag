// Presentation registry, not new approved answer content. Paths are repository-relative.
/** @type {Record<import('./contracts').KnowledgeScope,{title:string;corpusId:import('./contracts').CorpusId;nature:import('./contracts').SourceNature;description:string;explanation:string;library:string}>} */
export const SCOPES = {
  professional: { title: 'Professional Experience', corpusId: 'portfolio', nature: 'professional-evidence', description: 'Explore reviewed project information, technologies and professional experience.', explanation: 'Answers use reviewed portfolio information, public project references and technology details confirmed by the portfolio owner.', library: 'professional' },
  implementation: { title: 'How PACE-RAG Works', corpusId: 'lab', nature: 'implementation-evidence', description: 'Explore the architecture, implementation decisions, testing and limitations of this RAG system.', explanation: 'Answers use documentation and implementation evidence from this RAG project. Locally tested behavior is distinguished from planned or unverified services.', library: 'implementation' },
  fictional: { title: 'Fictional Test Documents', corpusId: 'lab', nature: 'synthetic-fixture', description: 'Explore fictional engineering scenarios created to test retrieval, citations and failure handling.', explanation: 'These are fictional engineering documents used to test retrieval. They are not company records or evidence of real production incidents.', library: 'fictional' },
};
const fixtures = {
 'atlas-overview': ['Fictional architecture overview', 'Introduces the fictional Atlas service and its publication boundaries.'],
 'gateway-adr': ['Fictional architecture decision', 'Illustrates bounded requests and server-resolved evidence.'],
 'catalog-adr': ['Fictional architecture decision', 'Illustrates immutable source versions and retirement.'],
 'queue-adr': ['Fictional architecture decision', 'Illustrates deterministic indexing and artifact reuse.'],
 'search-runbook': ['Fictional engineering runbook', 'Demonstrates fallback when browser embeddings are unavailable.'],
 'quota-runbook': ['Fictional engineering runbook', 'Illustrates cached search during a hypothetical provider quota denial.'],
 'catalog-runbook': ['Fictional engineering runbook', 'Illustrates investigating and retiring stale evidence.'],
 'queue-runbook': ['Fictional engineering runbook', 'Illustrates recovery of incomplete indexing work.'],
 'incident-timeout': ['Fictional incident', 'Illustrates preserving sources after a hypothetical generation timeout.'],
 'incident-version': ['Fictional incident', 'Illustrates the risk of mixing metadata and vector releases.'],
 'incident-poison': ['Fictional incident', 'Illustrates untrusted document instructions and review boundaries.'],
 'incident-budget': ['Fictional incident', 'Illustrates conservative treatment of uncertain provider usage.'],
 'migration-model': ['Fictional migration procedure', 'Illustrates rebuilding vectors when an embedding model changes.'],
 'migration-corpus': ['Fictional migration procedure', 'Illustrates keeping knowledge collections separate.'],
 'migration-schema': ['Fictional migration procedure', 'Illustrates safe handling of incompatible manifest schemas.'],
 'migration-release': ['Fictional migration procedure', 'Illustrates complete-release publication and rollback.'],
 'api-generate': ['Fictional API specification', 'Illustrates bounded generation requests and replay protection.'],
 'api-citations': ['Fictional API specification', 'Distinguishes citation membership from factual support.'],
 'api-budget': ['Fictional API specification', 'Illustrates atomic budget admission and closed failure.'],
 'api-privacy': ['Fictional API specification', 'Illustrates local search and explicit transmission boundaries.'],
};
const implementationIds = new Set(['efrd-retrieval','efrd-evidence','efrd-resources','efrd-evaluation']);
/** @returns {import('./contracts').SourceNature | undefined} */
export function sourceNature(doc) {
 if (doc.corpusId === 'portfolio' && ['approved-portfolio','owner-reported-capability','licensed-public','owner-confirmed-technology'].includes(doc.provenance)) return 'professional-evidence';
 if (doc.corpusId === 'lab' && implementationIds.has(doc.id) && doc.provenance === 'implementation-documentation') return 'implementation-evidence';
 if (doc.corpusId === 'lab' && fixtures[doc.id] && doc.provenance === 'synthetic') return 'synthetic-fixture';
 return undefined; // Unregistered/ambiguous material cannot enter a scoped view.
}
export function inScope(doc, scopeId) { return !!SCOPES[scopeId] && sourceNature(doc) === SCOPES[scopeId].nature; }
export function sourceProvenance(doc) {
 const nature = sourceNature(doc), fixture = fixtures[doc.id];
 return {
  sourceNature: nature, authorship: fixture ? 'ai-assisted' : 'unknown',
  authorshipDescription: fixture ? 'Human-authored with AI assistance. Confirmed by the portfolio owner on 19 October 2026; specific tools and preparation dates are not recorded.' : 'Unknown — human or AI authorship has not been established.', documentId: doc.id, documentTitle: doc.title,
  sourceFileReference: fixture ? 'content/lab/records.mjs' : nature === 'implementation-evidence' ? 'content/lab/engineering.mjs' : doc.provenance === 'owner-confirmed-technology' ? 'content/portfolio/technology-evidence.json' : 'content/portfolio/records.mjs',
  origin: fixture ? 'Bundled test fixture: literal text in the repository. A map adds the synthetic prefix and local source URL; no text-generation script is recorded.' : nature === 'implementation-evidence' ? 'Bundled PACE-RAG implementation documentation; compare with the code and reproducible QA reports.' : doc.provenance === 'owner-confirmed-technology' ? 'Imported owner-confirmed public technology inventory; this confirms involvement, not sole ownership or production impact.' : 'Bundled portfolio source snapshot; claim scope remains subject to its review.',
  documentType: fixture?.[0] || (nature === 'implementation-evidence' ? 'Engineering implementation documentation' : 'Professional evidence snapshot'),
  purpose: fixture?.[1] || (nature === 'implementation-evidence' ? 'Explains implemented behavior and its verification limits.' : 'Supports bounded professional information and project references.'),
  publicationApproved: doc.status === 'approved' && doc.approval?.scope === 'publication',
  reviewStatus: doc.status === 'approved' ? (doc.approval?.scope === 'local-test' ? 'Content review pending.' : 'Publication approval recorded.') : 'Not approved for use.',
  reviewedAt: doc.reviewedAt || undefined,
  updatedAt: undefined,
 };
}
export const natureLabels = { 'professional-evidence': 'Professional experience', 'implementation-evidence': 'Engineering implementation', 'synthetic-fixture': 'Fictional test data' };

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import {
  EMBEDDING,
  normalizeText,
  validateCorpus,
} from "../../packages/knowledge-schema/src/validate.mjs";
import { validateTechnology } from "../../packages/knowledge-schema/src/technology.mjs";
import { validateOntology, inventoryEntity } from "../../packages/semantic-core/src/technology/ontology.mjs";
export const hash = (text) => createHash("sha256").update(text).digest("hex");
export function approvalHash(record) {
  const { status, approval, reviewedAt, ...body } = record;
  return hash(JSON.stringify(body));
}
export async function loadContent(corpusId, { release = false, applyApprovals = true } = {}) {
  const input = await import(`../../content/${corpusId}/records.mjs`);
  const approvals = JSON.parse(
    await readFile(
      new URL(`../../content/${corpusId}/approvals.json`, import.meta.url),
      "utf8",
    ),
  );
  const apply = (record) => {
    const entry = applyApprovals && approvals[record.id];
    if (entry) {
      if (entry.contentHash !== approvalHash(record))
        throw new Error(`Approval invalidated: ${record.id}`);
      record.status = "approved";
      record.approval = entry;
      record.reviewedAt = entry.approvedAt;
    }
    return record;
  };
  const documents = input.documents.map(([id, title, canonicalUrl, text]) =>
    apply({
      id,
      corpusId,
      version: "1",
      title,
      canonicalUrl,
      text: normalizeText(text),
      contentHash: hash(normalizeText(text)),
      reviewedAt: null,
      reviewAfter: "2027-01-16T00:00:00Z",
      provenance: input.documentProvenance?.[id] || (corpusId === "lab" ? "synthetic" : "approved-portfolio"),
      license: "Owner-authorized public display; copyright retained. No reuse license granted.",
      status: "draft",
      approval: null,
    }),
  );
  const answers = input.answers.map(
    ([id, canonicalQuestion, answerText, sourceIds, alternatives]) =>
      apply({
        id: `${corpusId}-answer-${id}`,
        corpusId,
        version: "1",
        canonicalQuestion,
        alternatives: alternatives.map((text, i) => ({
          id: `${corpusId}-${id}-alt-${i}`,
          text,
          approvedAt: null,
        })),
        answerText,
        citations: sourceIds.map((id) => {
          const source = documents.find((d) => d.id === id);
          if (!source) throw new Error(`Missing source ${id}`);
          return {
            sourceId: id,
            corpusId,
            documentVersion: source.version,
            sourceHash: source.contentHash,
            title: source.title,
            url: source.canonicalUrl,
          };
        }),
        embeddingSpecId: EMBEDDING.id,
        reviewedAt: null,
        reviewAfter: "2027-01-16T00:00:00Z",
        status: "draft",
        approval: null,
        matchPolicy: {
          mode: "suggest-only",
          intent: id,
          protectedFacets:
            corpusId === "portfolio" ? ["professional-claim"] : [],
          policyVersion: "suggest-only-v1",
        },
      }),
  );
  let technologyEvidence, retirements;
  if (corpusId === "portfolio") {
    technologyEvidence = validateTechnology(JSON.parse(await readFile(new URL('../../content/portfolio/technology-evidence.json', import.meta.url), 'utf8')));
    validateOntology();
    for(const record of technologyEvidence.records)for(const generation of record.generations)for(const group of generation.groups)for(const name of group.technologies)if(!inventoryEntity(name))throw new Error(`Unmapped inventory technology: ${name}`);
    const { contentHash, ...body } = technologyEvidence;
    if (hash(JSON.stringify(body)) !== contentHash) throw new Error('Technology export hash mismatch');
    for (const record of technologyEvidence.records) {
      const { contentHash, ...body } = record;
      if (hash(JSON.stringify(body)) !== contentHash) throw new Error('Technology record hash mismatch');
    }
    retirements = JSON.parse(await readFile(new URL('../../content/portfolio/retirements.json', import.meta.url), 'utf8'));
    for (const answer of answers) if (retirements.answerIds.includes(answer.id)) answer.status = 'retired';
    const sources = [{ canonicalProjectId: 'inventory', projectTitle: 'Owner-confirmed technology inventory', canonicalPortfolioAnchor: '/pace-rag/knowledge/portfolio/sources/technology-inventory.html', generations: technologyEvidence.records.flatMap(r => r.generations), contentHash: technologyEvidence.contentHash, reviewedAt: technologyEvidence.reviewedAt }, ...technologyEvidence.records];
    for (const record of sources) {
      const text = record.canonicalProjectId === 'inventory'
        ? technologyEvidence.records.map(r => `${r.projectTitle}: ${r.generations.map(g => `${g.label || 'Confirmed stack'}: ${g.groups.map(group => `${group.label}: ${group.technologies.join(', ')}`).join('; ')}`).join('. ')}.${r.note ? ' ' + r.note : ''}`).join('\n\n')
        : `${record.projectTitle}. ${record.generations.map(g => `${g.label || 'Confirmed stack'}: ${g.groups.map(group => `${group.label}: ${group.technologies.join(', ')}`).join('; ')}`).join('. ')}.${record.note ? ' ' + record.note : ''}`;
      const doc = { id: `technology-${record.canonicalProjectId}`, corpusId, version: technologyEvidence.contentVersion, title: record.projectTitle, canonicalUrl: record.canonicalPortfolioAnchor, text, contentHash: hash(text), reviewedAt: null, reviewAfter: '2027-01-16T00:00:00Z', provenance: 'owner-confirmed-technology', license: 'Owner-authorized public technology facts; no private architecture or source code imported', status: 'draft', approval: null, upstreamHash: record.contentHash };
      documents.push(apply(doc));
    }
  }
  if (release) {
    const review = JSON.parse(await readFile(new URL('../../content/publication-review.json', import.meta.url), 'utf8'));
    for (const [path, digest] of Object.entries(review.supportingFiles)) {
      if (hash(await readFile(new URL(`../../${path}`, import.meta.url))) !== digest) throw new Error(`Publication review invalidated: ${path}`);
    }
    const records = [...documents, ...answers], approved = review.corpora[corpusId];
    if (records.length !== Object.keys(approved).length) throw new Error('Publication review record set changed');
    for (const record of records) {
      if (approved[record.id]?.contentHash !== approvalHash(record) || approved[record.id]?.version !== record.version) throw new Error(`Publication review invalidated: ${record.id}`);
    }
  }
  return validateCorpus({ corpusId, documents, answers, technologyEvidence, retirements }, { release });
}
export function chunksFor(data, version) {
  const chunks = [];
  for (const doc of data.documents) {
    if (doc.status !== "approved" || data.retirements?.retrievalExcludedDocuments.includes(doc.id)) continue;
    // Conservative pre-split; actual tokenizer length is checked before embedding.
    const paragraphs = doc.text.split(/\n\s*\n/);
    let ordinal = 0;
    for (const paragraph of paragraphs) {
      const sentences = paragraph.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) || [
        paragraph,
      ];
      let text = "";
      const flush = () => {
        if (!text) return;
        const id = `${data.corpusId}-${doc.id}-${ordinal}`;
        const embeddingInput = normalizeText(`${doc.title}\n${text}`);
        chunks.push({
          id,
          corpusId: data.corpusId,
          corpusVersion: version,
          documentId: doc.id,
          documentVersion: doc.version,
          sectionId: `section-${ordinal}`,
          ordinal: ordinal++,
          text: normalizeText(text),
          textHash: hash(normalizeText(text)),
          embeddingInput,
          embeddingInputHash: hash(embeddingInput),
          embeddingRow: chunks.length,
          citation: {
            sourceId: doc.id,
            corpusId: data.corpusId,
            documentVersion: doc.version,
            sourceHash: doc.contentHash,
            title: doc.title,
            url: doc.canonicalUrl,
            chunkId: id,
          },
        });
        text = "";
      };
      for (const sentence of sentences) {
        if (text.length + sentence.length > 650) flush();
        text += sentence;
      }
      flush();
    }
  }
  return chunks;
}

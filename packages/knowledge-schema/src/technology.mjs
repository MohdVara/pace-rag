import { ensure, safeUrl } from './validate.mjs';
export function validateTechnology(data) {
  ensure(data?.schemaVersion === 1 && data.publicOnly === true && /^[a-f0-9]{64}$/.test(data.contentHash), 'Invalid technology evidence');
  const ids = new Set();
  for (const record of data.records) {
    ensure(!ids.has(record.canonicalProjectId) && /^[a-z0-9-]+$/.test(record.canonicalProjectId), 'Invalid technology ID'); ids.add(record.canonicalProjectId);
    ensure(safeUrl(record.canonicalPortfolioAnchor, 'portfolio') && new URL(record.canonicalPortfolioAnchor).hostname === 'mohd.paramasvara.online', 'Invalid technology source URL');
    ensure(record.provenance?.[0]?.type === 'owner-confirmed' && /^[a-f0-9]{64}$/.test(record.contentHash), 'Missing owner provenance');
    ensure(Number.isFinite(Date.parse(record.reviewedAt)) && record.generations?.length > 0, 'Invalid technology review');
    for (const generation of record.generations) for (const group of generation.groups) ensure(typeof group.label === 'string' && group.technologies.length > 0 && group.technologies.every(t => typeof t === 'string' && t.length < 100), 'Invalid technology group');
  }
  return data;
}

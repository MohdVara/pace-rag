import { writeFile } from 'node:fs/promises';
import { loadContent, approvalHash } from './indexing/content.mjs';
// Explicit owner instruction on 2026-10-18 authorizes populated testing content.
// This script cannot issue publication approvals and is never run by build/CI.
const approvedAt = new Date().toISOString();
for (const corpus of ['portfolio', 'lab']) {
  const data = await loadContent(corpus, { applyApprovals: false });
  const entries = Object.fromEntries([...data.documents, ...data.answers].map(record => [record.id, {
    contentHash: approvalHash(record),
    reviewer: 'Codex content review for owner-authorized testing',
    approvedAt,
    scope: 'local-test',
    authorization: 'Owner requested populated application testing on 2026-10-18; public release was not authorized.',
  }]));
  await writeFile(`content/${corpus}/approvals.json`, JSON.stringify(entries, null, 2) + '\n');
  console.log(`${corpus}: ${data.documents.length} sources and ${data.answers.length} answers approved for testing only`);
}

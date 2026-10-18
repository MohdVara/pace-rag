import { DatabaseSync } from "node:sqlite";
import { BudgetLedger } from "../apps/rag-api/src/budget.mjs";
import { loadContent, chunksFor } from "../scripts/indexing/content.mjs";
export function ledger() {
  const db = new DatabaseSync(":memory:");
  const sql = {
    exec(query, ...params) {
      const statement = db.prepare(query);
      if (/^\s*SELECT/i.test(query)) return statement.all(...params);
      statement.run(...params);
      return [];
    },
  };
  return {
    db,
    ledger: new BudgetLedger(sql, (fn) => {
      db.exec("BEGIN IMMEDIATE");
      try {
        const result = fn();
        db.exec("COMMIT");
        return result;
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    }),
  };
}
export async function fixture(corpusId = "portfolio") {
  const data = await loadContent(corpusId);
  for (const record of [...data.documents, ...data.answers]) {
    record.status = "approved";
    record.reviewAfter = "2999-01-01T00:00:00Z";
    record.approval = {
      reviewer: "test-fixture-only",
      approvedAt: "2026-10-18T00:00:00Z",
      contentHash: "a".repeat(64),
    };
  }
  return {
    ...data,
    corpusVersion: "a".repeat(16),
    chunks: chunksFor(data, "a".repeat(16)),
  };
}
export const unitVector = (index = 0) => {
  const v = new Float32Array(384);
  v[index] = 1;
  return v;
};

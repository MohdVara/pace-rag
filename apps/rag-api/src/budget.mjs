import {
  LIMITS,
  ensure,
} from "../../../packages/knowledge-schema/src/validate.mjs";
export class AdmissionError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}
const reject = (code, message) => {
  throw new AdmissionError(code, message);
};
export class BudgetLedger {
  constructor(sql, transaction) {
    this.sql = sql;
    this.transaction = transaction;
    this.sql.exec(
      `CREATE TABLE IF NOT EXISTS reservations (id TEXT PRIMARY KEY, digest TEXT NOT NULL, app TEXT NOT NULL, visitor TEXT NOT NULL, network TEXT NOT NULL, day TEXT NOT NULL, created INTEGER NOT NULL, expires INTEGER NOT NULL, state TEXT NOT NULL, reserved INTEGER NOT NULL, accounted INTEGER NOT NULL)`,
    );
    this.sql.exec(
      "CREATE INDEX IF NOT EXISTS reservation_day ON reservations(day)",
    );
    this.sql.exec(
      "CREATE TABLE IF NOT EXISTS breaker (id INTEGER PRIMARY KEY, until_ms INTEGER NOT NULL, reason TEXT NOT NULL)",
    );
    this.sql.exec(
      "CREATE TABLE IF NOT EXISTS mint (id TEXT PRIMARY KEY, network TEXT NOT NULL, day TEXT NOT NULL, created INTEGER NOT NULL)",
    );
  }
  rows(query, ...params) {
    return Array.from(this.sql.exec(query, ...params));
  }
  maintain(now) {
    this.sql.exec(
      "UPDATE reservations SET state='released', accounted=0 WHERE state='reserved' AND expires<=?",
      now,
    );
    this.sql.exec(
      "UPDATE reservations SET state='uncertain' WHERE state='started' AND expires<=?",
      now,
    );
    this.sql.exec(
      "DELETE FROM reservations WHERE created<?",
      now - 48 * 3600000,
    );
    this.sql.exec("DELETE FROM mint WHERE created<?", now - 48 * 3600000);
  }
  admit(input, now = Date.now()) {
    return this.transaction(() => {
      this.maintain(now);
      const day = new Date(now).toISOString().slice(0, 10);
      ensure(
        typeof input.id === "string" &&
          input.id.length <= 200 &&
          typeof input.digest === "string" &&
          ["portfolio", "lab"].includes(input.app) &&
          input.visitor &&
          input.network,
        "Invalid reservation",
      );
      ensure(
        Number.isInteger(input.reserve) &&
          input.reserve > 0 &&
          input.reserve <= LIMITS.neurons * 1000000,
        "Invalid cost",
      );
      const prior = this.rows(
        "SELECT * FROM reservations WHERE id=?",
        input.id,
      )[0];
      if (prior) {
        if (prior.digest !== input.digest)
          reject(
            "INVALID_REQUEST",
            "Idempotency key reused with different content",
          );
        reject(
          "ALREADY_PROCESSED",
          "This request was already admitted. No additional inference was started.",
        );
      }
      if (this.rows("SELECT * FROM breaker WHERE until_ms>?", now).length)
        reject(
          "MODEL_UNAVAILABLE",
          "Generation is temporarily paused. Cached search remains available.",
        );
      const current = this.rows(
        "SELECT * FROM reservations WHERE day=? AND state!='released'",
        day,
      );
      const carry = this.rows(
        "SELECT * FROM reservations WHERE day!=? AND state IN ('started','uncertain')",
        day,
      );
      if (
        current.filter((r) => r.app === input.app).length >=
        LIMITS.daily[input.app]
      )
        reject("BUDGET_EXHAUSTED", "Application daily answer limit reached");
      if (
        current.filter(
          (r) => r.app === input.app && r.visitor === input.visitor,
        ).length >= LIMITS.visitor
      )
        reject("RATE_LIMITED", "Daily visitor allowance reached");
      if (
        current.filter((r) => r.network === input.network).length >= 10 ||
        current.some(
          (r) => r.network === input.network && r.created > now - 20000,
        )
      )
        reject(
          "RATE_LIMITED",
          "Please wait before requesting another AI answer",
        );
      const active = this.rows(
        "SELECT * FROM reservations WHERE state IN ('reserved','started') AND expires>?",
        now,
      );
      if (
        active.length >= LIMITS.concurrency ||
        active.some((r) => r.visitor === input.visitor)
      )
        reject("RATE_LIMITED", "Another AI request is active");
      if (
        [...current, ...carry].reduce((sum, r) => sum + r.accounted, 0) +
          input.reserve >
        LIMITS.neurons * 1000000
      )
        reject("BUDGET_EXHAUSTED", "Shared daily AI budget reached");
      this.sql.exec(
        "INSERT INTO reservations VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        input.id,
        input.digest,
        input.app,
        input.visitor,
        input.network,
        day,
        now,
        now + LIMITS.leaseMs,
        "reserved",
        input.reserve,
        input.reserve,
      );
      return {
        id: input.id,
        reserved: input.reserve,
        expires: now + LIMITS.leaseMs,
      };
    });
  }
  start(id, now = Date.now()) {
    return this.transaction(() => {
      this.maintain(now);
      const row = this.rows("SELECT * FROM reservations WHERE id=?", id)[0];
      if (!row || row.state !== "reserved") return { dispatch: false };
      this.sql.exec("UPDATE reservations SET state='started' WHERE id=?", id);
      return { dispatch: true };
    });
  }
  cancel(id) {
    return this.transaction(() => {
      this.sql.exec(
        "UPDATE reservations SET state='released',accounted=0 WHERE id=? AND state='reserved'",
        id,
      );
      return { ok: true };
    });
  }
  settle(id, actual = null, now = Date.now()) {
    return this.transaction(() => {
      const row = this.rows("SELECT * FROM reservations WHERE id=?", id)[0];
      if (!row || ["settled", "released"].includes(row.state))
        return { accounted: row?.accounted ?? 0 };
      if (!["started", "uncertain"].includes(row.state))
        reject("INVALID_REQUEST", "Reservation not started");
      if (actual !== null)
        ensure(Number.isSafeInteger(actual) && actual >= 0, "Invalid usage");
      const charge = actual ?? row.reserved;
      this.sql.exec(
        "UPDATE reservations SET state=?, accounted=? WHERE id=?",
        actual === null ? "uncertain" : "settled",
        charge,
        id,
      );
      if (charge > row.reserved)
        this.pause(
          new Date(now).setUTCHours(24, 0, 0, 0),
          "Accounting overrun",
        );
      return { accounted: charge };
    });
  }
  pause(until, reason) {
    this.sql.exec(
      "INSERT INTO breaker VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET until_ms=MAX(until_ms,excluded.until_ms), reason=excluded.reason",
      until,
      reason,
    );
  }
  mint(network, id, now = Date.now()) {
    return this.transaction(() => {
      this.maintain(now);
      const day = new Date(now).toISOString().slice(0, 10);
      const rows = this.rows("SELECT * FROM mint WHERE day=?", day);
      if (
        rows.length >= 1000 ||
        rows.filter((r) => r.network === network).length >= 6 ||
        rows.some((r) => r.network === network && r.created > now - 60000)
      )
        reject("RATE_LIMITED", "Verification session limit reached");
      this.sql.exec("INSERT INTO mint VALUES(?,?,?,?)", id, network, day, now);
      return { ok: true };
    });
  }
}
export function reserveCost(inputTokenUpperBound, completion = 300) {
  ensure(
    Number.isInteger(inputTokenUpperBound) &&
      inputTokenUpperBound > 0 &&
      inputTokenUpperBound <= 4608 &&
      completion === 300,
    "Unsupported inference envelope",
  );
  return (
    Math.ceil(
      ((inputTokenUpperBound * 5500) / 1000000 +
        (completion * 36400) / 1000000) *
        1.25,
    ) * 1000000
  );
}
export function reconcileUsage(usage,reserved,validated=false){
  if(!validated||!Number.isSafeInteger(usage?.prompt_tokens)||usage.prompt_tokens<0||!Number.isSafeInteger(usage?.completion_tokens)||usage.completion_tokens<0)return {actual:reserved,basis:'conservative-estimate'};
  const actual=usage.prompt_tokens*5500+usage.completion_tokens*36400;
  if(!Number.isSafeInteger(actual))return {actual:reserved,basis:'conservative-estimate'};
  return {actual,basis:'provider-token-usage'};
}

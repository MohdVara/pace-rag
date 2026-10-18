import test from "node:test";
import assert from "node:assert/strict";
import { ledger } from "./helpers.mjs";
import { reserveCost, reconcileUsage } from "../apps/rag-api/src/budget.mjs";
const now = Date.parse("2026-10-18T12:00:00Z");
test('usage reconciliation only refunds validated complete provider token accounting',()=>{
  const usage={prompt_tokens:100,completion_tokens:50};
  assert.equal(reconcileUsage(usage,46000000).actual,46000000);
  assert.deepEqual(reconcileUsage(usage,46000000,true),{actual:2370000,basis:'provider-token-usage'});
  assert.equal(reconcileUsage({prompt_tokens:100},46000000,true).actual,46000000);
});
const input = (id, more = {}) => ({
  id,
  digest: "digest",
  app: "portfolio",
  visitor: `v-${id}`,
  network: `n-${id}`,
  reserve: 46000000,
  ...more,
});
test("reservation precedes dispatch and can only start once", () => {
  const { ledger: l } = ledger();
  l.admit(input("a"), now);
  assert.equal(l.start("a", now).dispatch, true);
  assert.equal(l.start("a", now).dispatch, false);
});
test("idempotency rejects both replay and changed payload", () => {
  const { ledger: l } = ledger();
  l.admit(input("a"), now);
  assert.throws(
    () => l.admit(input("a"), now),
    (e) => e.code === "ALREADY_PROCESSED",
  );
  assert.throws(
    () => l.admit(input("a", { digest: "changed" }), now),
    (e) => e.code === "INVALID_REQUEST",
  );
});
test("two global active leases block concurrent third request", () => {
  const { ledger: l } = ledger();
  l.admit(input("a"), now);
  l.admit(input("b"), now);
  assert.throws(
    () => l.admit(input("c"), now),
    (e) => e.code === "RATE_LIMITED",
  );
});
test("visitor cannot run simultaneous requests across applications", () => {
  const { ledger: l } = ledger();
  l.admit(input("a", { visitor: "same" }), now);
  assert.throws(
    () => l.admit(input("b", { app: "lab", visitor: "same" }), now),
    (e) => e.code === "RATE_LIMITED",
  );
});
test("three started visitor attempts exhaust per-app day allowance", () => {
  const { ledger: l } = ledger();
  for (let i = 0; i < 3; i++) {
    const request = input(`a${i}`, { visitor: "same" });
    l.admit(request, now + i * 30000);
    l.start(request.id, now + i * 30000);
    l.settle(request.id, 46000000, now + i * 30000);
  }
  assert.throws(
    () => l.admit(input("z", { visitor: "same" }), now + 120000),
    (e) => e.code === "RATE_LIMITED",
  );
});
test("app count cannot exceed 30", () => {
  const { ledger: l } = ledger();
  for (let i = 0; i < 30; i++) {
    l.admit(input(String(i)), now);
    l.start(String(i), now);
    l.settle(String(i), 1000000, now);
  }
  assert.throws(
    () => l.admit(input("31"), now),
    (e) => e.code === "BUDGET_EXHAUSTED",
  );
});
test("shared budget bounds both apps atomically", () => {
  const { ledger: l } = ledger();
  for (let i = 0; i < 4; i++) {
    const r = input(String(i), {
      app: i % 2 ? "lab" : "portfolio",
      reserve: 500000000,
    });
    l.admit(r, now);
    l.start(r.id, now);
    l.settle(r.id, 500000000, now);
  }
  assert.throws(
    () => l.admit(input("extra"), now),
    (e) => e.code === "BUDGET_EXHAUSTED",
  );
});
test("expired unstarted reservation releases spending and concurrency", () => {
  const { ledger: l } = ledger();
  l.admit(input("a", { reserve: 2000000000 }), now);
  l.admit(input("b", { reserve: 2000000000 }), now + 120001);
  assert.equal(
    l.rows("SELECT state FROM reservations WHERE id=?", "a")[0].state,
    "released",
  );
});
test("started timeout retains budget after lease expiry", () => {
  const { ledger: l } = ledger();
  l.admit(input("a", { reserve: 2000000000 }), now);
  l.start("a", now);
  assert.throws(
    () => l.admit(input("b"), now + 120001),
    (e) => e.code === "BUDGET_EXHAUSTED",
  );
  l.transaction(() => l.maintain(now + 120001));
  assert.equal(
    l.rows("SELECT state FROM reservations WHERE id=?", "a")[0].state,
    "uncertain",
  );
});
test("in-flight charge carries across UTC midnight", () => {
  const { ledger: l } = ledger();
  const boundary = Date.parse("2026-10-18T23:59:30Z");
  l.admit(input("a", { reserve: 2000000000 }), boundary);
  l.start("a", boundary);
  assert.throws(
    () => l.admit(input("b"), boundary + 60000),
    (e) => e.code === "BUDGET_EXHAUSTED",
  );
});
test("settled counters use a new UTC day without reset races", () => {
  const { ledger: l } = ledger();
  l.admit(input("a", { reserve: 2000000000 }), now);
  l.start("a", now);
  l.settle("a", 2000000000, now);
  assert.ok(l.admit(input("b"), now + 86400000));
});
test("settlement is idempotent and overrun pauses new requests", () => {
  const { ledger: l } = ledger();
  l.admit(input("a"), now);
  l.start("a", now);
  l.settle("a", 50000000, now);
  assert.equal(l.settle("a", 1, now).accounted, 50000000);
  assert.throws(
    () => l.admit(input("b"), now),
    (e) => e.code === "MODEL_UNAVAILABLE",
  );
});
test("failed verification cancels only a never-started reservation", () => {
  const { ledger: l } = ledger();
  l.admit(input("a"), now);
  l.cancel("a");
  assert.equal(l.start("a", now).dispatch, false);
  l.admit(input("b"), now);
  l.start("b", now);
  l.cancel("b");
  assert.equal(
    l.rows("SELECT state FROM reservations WHERE id=?", "b")[0].state,
    "started",
  );
});
test("reservation estimate conservatively includes completion cost", () => {
  assert.equal(reserveCost(4608), 46000000);
  assert.throws(() => reserveCost(4609));
  assert.throws(() => reserveCost(1000, 301));
});

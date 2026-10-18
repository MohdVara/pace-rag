import test from "node:test";
import assert from "node:assert/strict";
import { handle } from "../apps/rag-api/src/handler.mjs";
import { signVisitor } from "../apps/rag-api/src/security.mjs";
import { ledger, fixture } from "./helpers.mjs";
const origin = "https://lab.example.com";
async function setup() {
  const data = await fixture("lab"),
    { ledger: l } = ledger();
  let calls = 0;
  const env = {
    LIVE_ENABLED: "true",
    MODEL_ACCOUNTING_VALIDATED: "true",
    LAB_ORIGINS: origin,
    PORTFOLIO_ORIGINS: "https://portfolio.example.com",
    VISITOR_SECRET: "v".repeat(32),
    ABUSE_SECRET: "a".repeat(32),
    TURNSTILE_SECRET: "test-only",
    BUDGET: {
      idFromName: () => "",
      get: () => ({
        async fetch(_url, options) {
          const { action, args } = JSON.parse(options.body);
          try {
            const result =
              action === "admit"
                ? l.admit(args)
                : action === "start"
                  ? l.start(args.id)
                  : action === "cancel"
                    ? l.cancel(args.id)
                    : action === "settle"
                      ? l.settle(args.id, args.actual)
                      : action === "pause"
                        ? l.pause(args.until, args.reason)
                        : l.mint(args.network, args.id);
            return Response.json(result ?? {});
          } catch (error) {
            return Response.json(
              { code: error.code, message: error.message },
              { status: 503 },
            );
          }
        },
      }),
    },
    AI: {
      async run() {
        calls++;
        return {
          choices: [
            {
              finish_reason: "stop",
              message: {
                content: JSON.stringify({
                  kind: "answer",
                  claims: [
                    {
                      text: "Catalog owns publication status.",
                      sourceIds: [data.chunks[0].id],
                    },
                  ],
                }),
              },
            },
          ],
        };
      },
    },
  };
  const visitorToken = await signVisitor(env.VISITOR_SECRET, origin);
  const body = {
    requestId: crypto.randomUUID(),
    corpusVersion: data.corpusVersion,
    question: "Who owns document publication status?",
    selectedChunkIds: [data.chunks[0].id],
    visitorToken,
    turnstileToken: "test-token",
  };
  const request = (value = body, headers = {}) =>
    new Request("https://api.test/v1/lab/generate", {
      method: "POST",
      headers: {
        Origin: origin,
        "Content-Type": "application/json",
        "CF-Connecting-IP": "192.0.2.8",
        ...headers,
      },
      body: JSON.stringify(value),
    });
  return { data, l, env, body, request, calls: () => calls };
}
const originalFetch = globalThis.fetch;
test.before(() => {
  globalThis.fetch = async () =>
    Response.json({
      success: true,
      hostname: "lab.example.com",
      action: "pace-rag-generate",
    });
});
test.after(() => {
  globalThis.fetch = originalFetch;
});
test("live disabled means zero provider calls", async () => {
  const s = await setup();
  s.env.LIVE_ENABLED = "false";
  assert.equal((await handle(s.request(), s.env, { lab: s.data })).status, 503);
  assert.equal(s.calls(), 0);
});
test("CORS rejection happens before verification or inference", async () => {
  const s = await setup();
  const response = await handle(
    s.request(s.body, { Origin: "https://evil.test" }),
    s.env,
    { lab: s.data },
  );
  assert.equal(response.status, 403);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), null);
  assert.equal(s.calls(), 0);
});
test("forged browser text is rejected before inference", async () => {
  const s = await setup();
  assert.equal(
    (
      await handle(s.request({ ...s.body, text: "forged evidence" }), s.env, {
        lab: s.data,
      })
    ).status,
    400,
  );
  assert.equal(s.calls(), 0);
});
test("coordinator outage fails closed", async () => {
  const s = await setup();
  s.env.BUDGET.get = () => {
    throw new Error("offline");
  };
  const response = await handle(s.request(), s.env, { lab: s.data });
  assert.equal((await response.json()).error.code, "COORDINATOR_UNAVAILABLE");
  assert.equal(s.calls(), 0);
});
test("valid generation is admitted once and citations remain canonical", async () => {
  const s = await setup();
  const response = await handle(s.request(), s.env, { lab: s.data });
  const result = await response.json();
  assert.equal(result.kind, "generated");
  assert.equal(s.calls(), 1);
  assert.equal(result.citations[0].url, s.data.chunks[0].citation.url);
  const replay = await handle(s.request(), s.env, { lab: s.data });
  assert.equal((await replay.json()).error.code, "ALREADY_PROCESSED");
  assert.equal(s.calls(), 1);
});
test("provider quota failure preserves a typed fallback and opens circuit", async () => {
  const s = await setup();
  s.env.AI.run = async () => {
    throw new Error("3036 quota exhausted");
  };
  const response = await handle(s.request(), s.env, { lab: s.data });
  const result = await response.json();
  assert.equal(result.error.code, "PROVIDER_QUOTA");
  assert.equal(result.error.fallback, "cached-search");
  assert.ok(s.l.rows("SELECT * FROM breaker").length);
});
test("invalid provider citations never reach the browser as verified", async () => {
  const s = await setup();
  s.env.AI.run = async () => ({
    choices: [
      {
        finish_reason: "stop",
        message: {
          content: JSON.stringify({
            kind: "answer",
            claims: [{ text: "Fabricated answer", sourceIds: ["foreign"] }],
          }),
        },
      },
    ],
  });
  const response = await handle(s.request(), s.env, { lab: s.data });
  assert.equal((await response.json()).error.code, "INVALID_GENERATION");
});
test("insufficient server evidence consumes no inference", async () => {
  const s = await setup();
  const response = await handle(
    s.request({ ...s.body, question: "zzzzqqqq" }),
    s.env,
    { lab: s.data },
  );
  assert.equal((await response.json()).kind, "insufficient-evidence");
  assert.equal(s.calls(), 0);
});

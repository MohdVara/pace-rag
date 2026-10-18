import approvedCorpora from "../generated/corpora.json" with { type: "json" };
import {
  validateGenerate,
  LIMITS,
} from "../../../packages/knowledge-schema/src/validate.mjs";
import { reserveCost, reconcileUsage } from "./budget.mjs";
import {
  digest,
  signVisitor,
  verifyVisitor,
  networkPrefix,
  readBoundedJson,
  resolveEvidence,
  makePrompt,
  validateGeneration,
} from "./security.mjs";
const MODEL = "@cf/zai-org/glm-4.7-flash";
async function coordinate(env, action, args) {
  try {
    const response = await env.BUDGET.get(
      env.BUDGET.idFromName("pace-rag-shared-v1"),
    ).fetch("https://budget.internal/", {
      method: "POST",
      body: JSON.stringify({ action, args }),
    });
    const body = await response.json();
    if (!response.ok)
      throw Object.assign(new Error(body.message), { code: body.code });
    return body;
  } catch (error) {
    throw Object.assign(
      new Error(
        error.code ? error.message : "AI admission service unavailable",
      ),
      { code: error.code || "COORDINATOR_UNAVAILABLE" },
    );
  }
}
async function verifyTurnstile(env, token, origin) {
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET,
        response: token,
      }),
      signal: AbortSignal.timeout(5000),
    },
  );
  const result = await response.json();
  if (
    !result.success ||
    result.hostname !== new URL(origin).hostname ||
    result.action !== "pace-rag-generate"
  )
    throw Object.assign(new Error("Verification required"), {
      code: "VERIFICATION_REQUIRED",
    });
}
function providerCode(error) {
  const text = [error?.code,error?.status,error?.message,String(error)].join(' ');
  if (/3036|quota|daily.*allocation/i.test(text)) return "PROVIDER_QUOTA";
  if (/3040|429/.test(text)) return "PROVIDER_CAPACITY";
  if (/3007|3008|timeout|abort/i.test(text)) return "TIMEOUT";
  return "MODEL_UNAVAILABLE";
}
export async function handle(request, env, corpora = approvedCorpora) {
  let responseRequestId = crypto.randomUUID();
  const origin = request.headers.get("Origin");
  const app = new URL(request.url).pathname.match(
    /^\/v1\/(portfolio|lab)\/(generate|session)$/,
  );
  const allowed = app
    ? String(
        env[app[1] === "portfolio" ? "PORTFOLIO_ORIGINS" : "LAB_ORIGINS"] || "",
      )
        .split(",")
        .map((x) => x.trim())
    : [];
  const cors =
    origin && allowed.includes(origin)
      ? {
          "Access-Control-Allow-Origin": origin,
          Vary: "Origin",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        }
      : { "Cache-Control": "no-store" };
  const reply = (body, status = 200) =>
    Response.json(body, { status, headers: cors });
  const unavailable = (code, message, status = 503) =>
    reply(
      {
        kind: "unavailable",
        requestId: responseRequestId,
        error: { code, message, fallback: "cached-search" },
      },
      status,
    );
  if (!app) return unavailable("INVALID_REQUEST", "Endpoint not found", 404);
  if (!origin || !allowed.includes(origin))
    return unavailable("ORIGIN_REJECTED", "Origin is not allowed", 403);
  if (request.method === "OPTIONS")
    return new Response(null, { status: 204, headers: cors });
  if (
    request.method !== "POST" ||
    !request.headers.get("Content-Type")?.startsWith("application/json")
  )
    return unavailable("INVALID_REQUEST", "POST JSON required", 400);
  // Two separate switches: public enablement and observed provider accounting behavior.
  if (env.LIVE_ENABLED !== "true" || env.MODEL_ACCOUNTING_VALIDATED !== "true")
    return unavailable(
      "MODEL_UNAVAILABLE",
      "Live AI is disabled. Cached knowledge search remains available.",
    );
  let reservation,
    started = false;
  try {
    const body = await readBoundedJson(request);
    const day = new Date().toISOString().slice(0, 10);
    const network = await digest(
      env.ABUSE_SECRET,
      `${day}:${networkPrefix(request.headers.get("CF-Connecting-IP"))}`,
    );
    if (app[2] === "session") {
      if (
        Object.keys(body).some((key) => key !== "turnstileToken") ||
        typeof body.turnstileToken !== "string" ||
        body.turnstileToken.length > 2048
      )
        throw new Error("Invalid session request");
      await verifyTurnstile(env, body.turnstileToken, origin);
      await coordinate(env, "mint", { network, id: crypto.randomUUID() });
      return reply({
        visitorToken: await signVisitor(env.VISITOR_SECRET, origin),
      });
    }
    const input = validateGenerate(body),
      visitor = await verifyVisitor(
        env.VISITOR_SECRET,
        input.visitorToken,
        origin,
      );
    responseRequestId = input.requestId;
    if (!visitor)
      return unavailable(
        "VERIFICATION_REQUIRED",
        "Verification session expired",
        403,
      );
    const chunks = resolveEvidence(corpora[app[1]], input);
    const context = makePrompt(input.question, chunks);
    if (!context.chunks.length)
      return reply({
        kind: "insufficient-evidence",
        requestId: input.requestId,
        message:
          "The approved sources do not provide enough relevant evidence.",
        citations: [],
      });
    const visitorKey = await digest(env.ABUSE_SECRET, `${day}:${visitor}`);
    const id = await digest(
      env.ABUSE_SECRET,
      `${app[1]}:${visitorKey}:${input.requestId}`,
    );
    const requestDigest = await digest(
      env.ABUSE_SECRET,
      JSON.stringify({
        question: input.question.trim(),
        version: input.corpusVersion,
        chunks: input.selectedChunkIds,
      }),
    );
    const reserve = reserveCost(
      new TextEncoder().encode(context.prompt).length + 512,
    );
    reservation = await coordinate(env, "admit", {
      id,
      digest: requestDigest,
      app: app[1],
      visitor: visitorKey,
      network,
      reserve,
    });
    // Admission deduplicates before consuming another single-use verification token.
    try {
      await verifyTurnstile(env, input.turnstileToken, origin);
    } catch (error) {
      await coordinate(env, "cancel", { id });
      reservation = undefined;
      throw error;
    }
    const admission = await coordinate(env, "start", { id });
    if (!admission.dispatch)
      return unavailable(
        "ALREADY_PROCESSED",
        "This request was already started",
        409,
      );
    started = true;
    let provider;
    try {
      // The completion cap must cover ALL billable reasoning/completion tokens; enablement requires the provider smoke test.
      let timer;
      try {
        provider = await Promise.race([
          env.AI.run(MODEL, {
            messages: context.messages,
            stream: false,
            max_completion_tokens: 300,
            temperature: 0,
            chat_template_kwargs: { enable_thinking: false },
            response_format: { type: "json_object" },
          }),
          new Promise((_, reject) => {
            timer = setTimeout(() => reject(new Error("timeout")), 25000);
          }),
        ]);
      } finally {
        clearTimeout(timer);
      }
    } catch (error) {
      const code = providerCode(error);
      if (code === "PROVIDER_QUOTA" || code === "PROVIDER_CAPACITY")
        await coordinate(env, "pause", {
          until:
            code === "PROVIDER_QUOTA"
              ? new Date().setUTCHours(24, 0, 0, 0)
              : Date.now() + 60000,
          reason: code,
        });
      throw Object.assign(
        new Error(
          "AI is temporarily unavailable. Cached search remains available.",
        ),
        { code },
      );
    }
    const choice = provider?.choices?.[0];
    if (
      choice?.finish_reason !== "stop" ||
      typeof choice.message?.content !== "string" ||
      choice.message.content.length > 6000
    )
      throw Object.assign(new Error("Generated output could not be verified"), {
        code: "INVALID_GENERATION",
      });
    let result;
    try {
      result = validateGeneration(
        JSON.parse(choice.message.content),
        context.chunks,
      );
    } catch {
      throw Object.assign(new Error("Generated output could not be verified"), {
        code: "INVALID_GENERATION",
      });
    }
    // Conservative accounting until provider usage semantics are independently validated. Never refund on unknown usage.
    const accounting=reconcileUsage(provider.usage,reserve,env.USAGE_RECONCILIATION_VALIDATED==='true');
    const settled = await coordinate(env, "settle", { id, actual: accounting.actual });
    reservation = undefined;
    if (result.kind === "insufficient-evidence")
      return reply({
        kind: "insufficient-evidence",
        requestId: input.requestId,
        message: "The approved sources do not establish an answer.",
        citations: [],
      });
    return reply({
      ...result,
      requestId: input.requestId,
      corpusId: app[1],
      corpusVersion: input.corpusVersion,
      modelId: MODEL,
      usage: {
        reservedNeurons: reserve / 1000000,
        accountedNeurons: settled.accounted / 1000000,
        basis: accounting.basis,
      },
    });
  } catch (error) {
    if (reservation && started)
      try {
        await coordinate(env, "settle", { id: reservation.id, actual: null });
      } catch {}
    const code =
      error.code ||
      (error.message === "VERSION_STALE" ? "VERSION_STALE" : "INVALID_REQUEST");
    return unavailable(
      code,
      code === "INVALID_REQUEST"
        ? "Request rejected. Use the approved knowledge search."
        : error.message,
      ["INVALID_REQUEST", "VERSION_STALE"].includes(code)
        ? 400
        : code === "RATE_LIMITED" || code === "BUDGET_EXHAUSTED"
          ? 429
          : 503,
    );
  }
}

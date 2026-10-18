import { readFile, writeFile, mkdir } from "node:fs/promises";
// Uses the SAME guarded API. Never accepts a direct provider key or bypasses admission.
if (!process.argv.includes("--allow-live"))
  throw new Error(
    "Explicit --allow-live is required; real inference can consume quota.",
  );
const max = Number(
  process.argv.find((arg) => arg.startsWith("--max-calls="))?.split("=")[1] ||
    1,
);
if (!Number.isInteger(max) || max < 1 || max > 3)
  throw new Error("Smoke tests permit 1–3 calls maximum");
const { PACE_RAG_API_URL, PACE_RAG_ORIGIN, PACE_RAG_SMOKE_REQUESTS } =
  process.env;
if (!PACE_RAG_API_URL || !PACE_RAG_ORIGIN || !PACE_RAG_SMOKE_REQUESTS)
  throw new Error(
    "Set API URL, allowed origin, and a local JSON fixture path containing fresh verification/session tokens.",
  );
const url = new URL(PACE_RAG_API_URL);
if (
  url.protocol !== "https:" &&
  !["127.0.0.1", "localhost"].includes(url.hostname)
)
  throw new Error("Secure API required");
const requests = JSON.parse(await readFile(PACE_RAG_SMOKE_REQUESTS, "utf8"));
if (!Array.isArray(requests) || requests.length > max)
  throw new Error("Request fixture exceeds explicit call limit");
const results = [];
for (const body of requests) {
  const start = performance.now();
  const response = await fetch(url, {
    method: "POST",
    headers: { Origin: PACE_RAG_ORIGIN, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });
  const value = await response.json();
  results.push({
    status: response.status,
    kind: value.kind,
    errorCode: value.error?.code,
    usage: value.usage,
    elapsedMs: performance.now() - start,
  });
  if (!response.ok) break;
}
await mkdir("output", { recursive: true });
await writeFile(
  "output/provider-smoke-summary.json",
  JSON.stringify(results, null, 2),
);
console.log(
  "Only status/usage summaries were retained. Review actual output interactively; no raw payloads were written.",
);

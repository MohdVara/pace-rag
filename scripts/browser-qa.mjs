import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const lab = process.env.PACE_RAG_LAB_URL || "http://127.0.0.1:5180/pace-rag/";
const portfolio = process.env.PACE_RAG_PORTFOLIO_URL;
const output = "output/playwright/pace-rag";
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const results = [];
const inferenceRequests = [];
const errors = [];
async function context(options = {}) {
  const ctx = await browser.newContext(options);
  ctx.on("request", (request) => {
    if (
      /\/v1\/(portfolio|lab)\/(generate|session)|workers-ai|\/ai\/run\//.test(
        request.url(),
      )
    )
      inferenceRequests.push(request.url());
  });
  ctx.on("page", (page) =>
    page.on("pageerror", (error) => errors.push(error.message)),
  );
  return ctx;
}
async function semantic(page) {
  await page.waitForFunction(
    () =>
      document
        .querySelector(".pace-status")
        ?.textContent?.startsWith("Semantic search ready"),
    { timeout: 45000 },
  );
}
async function search(page, text) {
  await page.getByLabel("Your question", { exact: true }).fill(text);
  await page
    .getByRole("button", { name: "Search knowledge", exact: true })
    .click();
  await page.getByRole("button", { name: "Search knowledge", exact: true }).waitFor();
  await page.waitForFunction(() => !document.querySelector(".pace-actions button")?.disabled);
  await page.locator(".pace-answer").waitFor();
}
async function run(name, fn) {
  const start = performance.now();
  try {
    await fn();
    results.push({ name, passed: true, elapsedMs: performance.now() - start });
  } catch (error) {
    results.push({ name, passed: false, message: error.message });
  }
}
try {
  await run("Opening, cached starters and keyword queries do not load the model", async () => {
    const ctx = await context();
    try {
      const page = await ctx.newPage();
      const modelRequests = [];
      page.on('request', request => {
        if (/\/models\/|\/runtime\/|embedding-worker-/.test(request.url())) modelRequests.push(request.url());
      });
      await page.goto(lab);
      await page.waitForFunction(() => document.querySelector('.pace-status')?.textContent?.startsWith('Knowledge ready'));
      await page.locator('.pace-starters button').first().click();
      await page.locator('.pace-answer').waitFor();
      await page.getByRole('checkbox', { name: /Use semantic search/ }).uncheck();
      await search(page, 'browser embeddings fail');
      await search(page, 'What happens if browser embeddings fail?');
      assert.match(await page.locator('.pace-answer').innerText(), /Test-approved cached answer/);
      assert.deepEqual(modelRequests, []);
      assert.equal(page.workers().length, 0);
      await page.getByRole('checkbox', { name: /Use semantic search/ }).check();
      assert.deepEqual(modelRequests, [], 'Enabling alone must not load the model');
      await search(page, 'What happens when browser embeddings cannot load?');
      await semantic(page);
      assert.ok(modelRequests.some(url => url.includes('/models/')));
      assert.equal(page.workers().length, 1);
    } finally { await ctx.close(); }
  });
  await run('Mismatched worker specification fails back to lexical search', async () => {
    const ctx = await context();
    try {
      await ctx.route('**/assets/embedding-worker-*.js', route => route.fulfill({contentType:'text/javascript',body:"self.onmessage=e=>self.postMessage({id:e.data.id,type:'result',embeddingSpecKey:'incompatible',vector:Array.from({length:384},(_,i)=>i===0?1:0)});"}));
      const page = await ctx.newPage(); await page.goto(lab);
      await search(page,'browser embeddings fail');
      await page.waitForFunction(() => document.querySelector('.pace-status')?.textContent?.includes('Lexical search'));
      assert.ok(await page.locator('.pace-passages article').count());
    } finally { await ctx.close(); }
  });
  await run("Corpus switch cancels an initializing worker without loading another", async () => {
    const ctx = await context();
    try {
      // Deliberately inert worker: lifecycle test, not model or provider verification.
      await ctx.route('**/assets/embedding-worker-*.js', route => route.fulfill({ contentType: 'text/javascript', body: 'self.onmessage=()=>{};' }));
      const page = await ctx.newPage();
      await page.goto(lab);
      await page.waitForFunction(() => document.querySelector('.pace-status')?.textContent?.startsWith('Knowledge ready'));
      await page.getByLabel('Your question', { exact: true }).fill('browser embeddings fail');
      const started = page.waitForEvent('worker');
      await page.getByRole('button', { name: 'Search knowledge', exact: true }).click();
      await started;
      assert.equal(page.workers().length, 1);
      await page.getByRole('button', { name: 'Portfolio review', exact: true }).click();
      await page.waitForFunction(() => document.querySelector('.pace-status')?.textContent?.startsWith('Knowledge ready'));
      assert.equal(page.workers().length, 0);
      assert.equal(await page.locator('.pace-answer').count(), 0);
    } finally { await ctx.close(); }
  });
  await run(
    "Lab semantic recommendations and explicit test answer selection",
    async () => {
      const ctx = await context({ viewport: { width: 1440, height: 900 } });
      try {
        const page = await ctx.newPage();
        await page.goto(lab);
        await search(page, "What happens when browser embeddings cannot load?");
        await semantic(page);
        await search(page, "What happens when browser embeddings cannot load?");
        assert.match(await page.locator(".pace-answer .pace-kicker").innerText(), /Insufficient evidence/);
        await page
          .getByRole("button", {
            name: /^What happens if browser embeddings fail/,
          })
          .click();
        assert.match(
          await page.locator(".pace-answer").innerText(),
          /Test-approved cached answer/,
        );
        assert.match(await page.locator(".pace-answer").innerText(), /lexical/);
        await page.screenshot({
          path: `${output}/lab-search.png`,
          fullPage: true,
        });
        results.push({
          name: "Embedding timings (local Chromium; not physical mobile)",
          measurements: await page.evaluate(() =>
            performance
              .getEntriesByName("pace-rag:embedding")
              .map((entry) => entry.duration),
          ),
        });
      } finally {
        await ctx.close();
      }
    },
  );
  await run(
    "Corpus switch and critical RAG near-miss remains suggest-only",
    async () => {
      const ctx = await context();
      try {
        const page = await ctx.newPage();
        await page.goto(lab);
        await page
          .getByRole("button", { name: "Portfolio review", exact: true })
          .click();
        await search(
          page,
          "Has this engineer deployed RAG at enterprise production scale?",
        );
        assert.match(await page.locator(".pace-answer .pace-kicker").innerText(), /Insufficient evidence/);
        const links = await page
          .locator(".pace-passages a")
          .evaluateAll((nodes) =>
            nodes.map((node) => node.getAttribute("href")),
          );
        assert.ok(
          links.length &&
            links.every((link) =>
              link.startsWith("https://mohd.paramasvara.online/"),
            ),
        );
        assert.equal(await page.locator(".pace-related").count(), 3);
      } finally {
        await ctx.close();
      }
    },
  );
  await run("Model worker failure preserves lexical search", async () => {
    const ctx = await context();
    try {
      let workerAttempts = 0;
      await ctx.route("**/assets/embedding-worker-*.js", (route) => { workerAttempts++; return route.abort(); });
      const page = await ctx.newPage();
      await page.goto(lab);
      await search(page, "browser embeddings fail");
      await page.waitForFunction(() => document.querySelector('.pace-status')?.textContent?.includes('Lexical search'));
      assert.match(
        await page.locator(".pace-actions").innerText(),
        /Keyword search/,
      );
      assert.ok(await page.locator(".pace-passages article").count());
      await search(page, "provider quota exhausted");
      assert.equal(workerAttempts, 1, "Failed model must not retry without explicit opt-in");
    } finally {
      await ctx.close();
    }
  });
  await run(
    "Vector asset failure preserves static starters and lexical search",
    async () => {
      const ctx = await context();
      try {
        await ctx.route("**/*.f32", (route) => route.abort());
        const page = await ctx.newPage();
        await page.goto(lab);
        await page.waitForFunction(() =>
          document
            .querySelector(".pace-status")
            ?.textContent?.includes("lexical search"),
        );
        await search(page, "provider quota exhausted");
        assert.ok(await page.locator(".pace-passages article").count());
      } finally {
        await ctx.close();
      }
    },
  );
  await run(
    "Prerendered knowledge browser and source work with JavaScript disabled",
    async () => {
      const ctx = await context({ javaScriptEnabled: false });
      try {
        const page = await ctx.newPage();
        await page.goto(new URL("knowledge/lab/index.html", lab).href);
        assert.match(await page.locator("h1").innerText(), /knowledge library/);
        await page
          .getByRole("link", { name: "Atlas architecture", exact: true })
          .click();
        assert.match(
          await page.locator("main").innerText(),
          /Synthetic example/,
        );
      } finally {
        await ctx.close();
      }
    },
  );
  await run("Loaded semantic search remains available offline", async () => {
    const ctx = await context();
    try {
      const page = await ctx.newPage();
      await page.goto(lab);
      await search(page, "browser embeddings fail");
      await semantic(page);
      await ctx.setOffline(true);
      await search(page, "What happens when browser embeddings cannot load?");
      assert.ok(await page.locator(".pace-related").count());
      assert.ok(await page.locator(".pace-passages article").count());
    } finally {
      await ctx.close();
    }
  });
  await run("Lab 320px large-text reflow", async () => {
    const ctx = await context({ viewport: { width: 320, height: 568 } });
    try {
      const page = await ctx.newPage();
      await page.goto(lab);
      await page.locator(".pace-starters").waitFor();
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "24px";
      });
      const fits = await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      );
      assert.ok(fits, "Horizontal overflow");
      await page.screenshot({
        path: `${output}/lab-mobile-large.png`,
        fullPage: true,
      });
    } finally {
      await ctx.close();
    }
  });
  if (portfolio)
    await run(
      "Portfolio lazy loading, Largest text, close cleanup and focus return",
      async () => {
        const ctx = await context({ viewport: { width: 320, height: 568 } });
        try {
          const page = await ctx.newPage();
          const requests = [];
          page.on("request", (request) => requests.push(request.url()));
          await page.goto(portfolio);
          await page.waitForLoadState("networkidle");
          assert.ok(
            !requests.some((url) => /\/pace-rag\/|PaceAssistant-/.test(url)),
            "Assistant loaded before activation",
          );
          await page
            .getByRole("button", {
              name: "Ask about my engineering work",
              exact: true,
            })
            .click();
          await page.locator(".pace-starters").waitFor();
          await page.getByRole("group").filter({ hasText: "Display" }).count();
          await page.locator(".display-settings > summary").click();
          await page
            .getByLabel("Text size", { exact: true })
            .selectOption("largest");
          await page
            .getByLabel("Color theme", { exact: true })
            .selectOption("light");
          await page.keyboard.press("Escape");
          await search(page, "What did you work on at PolicyStreet?");
          assert.ok(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          );
          await page
            .locator(".pace-assistant")
            .screenshot({ path: `${output}/portfolio-largest-light.png` });
          await page
            .getByRole("button", { name: "Close assistant", exact: true })
            .click();
          await page.waitForFunction(() =>
            document.activeElement?.textContent?.includes(
              "Ask about my engineering work",
            ),
          );
          assert.equal(page.workers().length, 0);
          assert.equal(await page.locator("h1").count(), 1);
        } finally {
          await ctx.close();
        }
      },
    );
  assert.equal(inferenceRequests.length, 0, "Unexpected inference request");
  assert.deepEqual(errors, [], "Unhandled page errors");
} finally {
  await browser.close();
  const report = {
    measuredAt: new Date().toISOString(),
    results,
    inferenceRequests,
    errors,
    scope:
      "Pinned local Chromium. Physical devices, actual screen readers and other browser engines are not certified by this run.",
  };
  await writeFile(`${output}/results.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
if (results.some((result) => result.passed === false)) process.exitCode = 1;

import { chromium } from "playwright";
import { createServer } from "vite";
import { EMBEDDING, validateVector } from "../../packages/knowledge-schema/src/validate.mjs";
export async function embedBatch(texts) {
  const server = await createServer({
    configFile: "vite.config.ts",
    server: { host: "127.0.0.1", port: 5181, strictPort: true, hmr: false },
  });
  await server.listen();
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto("http://127.0.0.1:5181/pace-rag/indexing.html");
    const vectors = await page.evaluate(async ({texts, embeddingSpecKey}) => {
      const asset = await (await fetch("/pace-rag/worker.json")).json();
      const worker = new Worker(`/pace-rag/${asset.path}`, { type: "module" });
      const outputs = [];
      try {
        for (let i = 0; i < texts.length; i++) {
          const vector = await new Promise((resolve, reject) => {
            const id = String(i);
            const timer = setTimeout(
              () => reject(new Error("Embedding timed out")),
              120000,
            );
            worker.onmessage = (event) => {
              if (event.data.id !== id) return;
              if (event.data.type === "result") {
                clearTimeout(timer);
                if(event.data.embeddingSpecKey !== embeddingSpecKey) { reject(new Error('Embedding worker version mismatch')); return; }
                resolve(event.data.vector);
              }
              if (event.data.type === "error") {
                clearTimeout(timer);
                reject(new Error(event.data.message));
              }
            };
            worker.postMessage({
              id,
              type: "embed",
              text: texts[i],
              assetBase: "/pace-rag/",
              embeddingSpecKey,
            });
          });
          outputs.push(vector);
        }
      } finally {
        worker.terminate();
      }
      return outputs;
    }, {texts, embeddingSpecKey: JSON.stringify(EMBEDDING)});
    const bytes = Buffer.alloc(vectors.length * 384 * 4);
    vectors.forEach((vector, row) => {
      validateVector(vector);
      vector.forEach((value, col) =>
        bytes.writeFloatLE(value, (row * 384 + col) * 4),
      );
    });
    return bytes;
  } finally {
    await browser.close();
    await server.close();
  }
}

import { readdir, cp, writeFile, readFile, mkdir, rm } from "node:fs/promises";
import { hash } from "./indexing/content.mjs";
const assets = await readdir("output/embedding-worker/assets");
const filename = assets.find((name) => /^embedding-worker-.*\.js$/.test(name));
if (!filename) throw new Error("Missing worker build");
await rm("apps/rag-lab/public/assets", { recursive: true, force: true });
await mkdir("apps/rag-lab/public/assets", { recursive: true });
await cp(
  `output/embedding-worker/assets/${filename}`,
  `apps/rag-lab/public/assets/${filename}`,
);
const bytes = await readFile(`output/embedding-worker/assets/${filename}`);
await writeFile(
  "apps/rag-lab/public/worker.json",
  JSON.stringify({
    path: `assets/${filename}`,
    sha256: hash(bytes),
    bytes: bytes.length,
  }),
);

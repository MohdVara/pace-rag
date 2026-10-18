import { cp, mkdir, readFile, writeFile, readdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { hash } from "./indexing/content.mjs";
const target = resolve("output/portfolio-integration");
await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp("packages/portfolio-assistant/dist", resolve(target, "package"), {
  recursive: true,
});
for (const folder of ["knowledge/portfolio", "licenses"])
  await cp(
    resolve("dist/lab", folder),
    resolve(target, "public/pace-rag", folder),
    { recursive: true },
  );
const modelLock=JSON.parse(await readFile('dist/lab/models/assets.lock.json','utf8'));
for(const asset of modelLock.entries){const destination=resolve(target,'public/pace-rag',asset.file);await mkdir(resolve(destination,'..'),{recursive:true});await cp(resolve('dist/lab',asset.file),destination);}
await cp('dist/lab/models/assets.lock.json',resolve(target,'public/pace-rag/models/assets.lock.json'));
const worker = JSON.parse(await readFile("dist/lab/worker.json", "utf8"));
await mkdir(resolve(target, "public/pace-rag/assets"), { recursive: true });
await cp(
  resolve("dist/lab", worker.path),
  resolve(target, "public/pace-rag", worker.path),
);
await cp(
  "dist/lab/worker.json",
  resolve(target, "public/pace-rag/worker.json"),
);
const manifest = [];
async function scan(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const filename = resolve(dir, item.name);
    if (item.isDirectory()) await scan(filename);
    else {
      const bytes = await readFile(filename);
      manifest.push({
        file: filename.slice(target.length + 1),
        sha256: hash(bytes),
        bytes: bytes.length,
      });
    }
  }
}
await scan(target);
await writeFile(
  resolve(target, "checksums.json"),
  JSON.stringify(manifest, null, 2),
);
console.log(
  "Local integration artifact prepared at output/portfolio-integration; drafts are NOT approved for deployment.",
);
// Portable local package: React code, source declarations and matching public assets.
await rm("packages/portfolio-assistant/public", {
  recursive: true,
  force: true,
});
await mkdir("packages/portfolio-assistant/public", { recursive: true });
await cp(
  resolve(target, "public/pace-rag"),
  "packages/portfolio-assistant/public",
  { recursive: true },
);
await mkdir("packages/portfolio-assistant/public/licenses", {
  recursive: true,
});

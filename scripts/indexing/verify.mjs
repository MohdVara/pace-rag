import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { hash } from "./content.mjs";
import {
  validateVector,
  EMBEDDING,
} from "../../packages/knowledge-schema/src/validate.mjs";
for (const corpus of ["portfolio", "lab"]) {
  const root = resolve("apps/rag-lab/public/knowledge", corpus),
    pointer = JSON.parse(await readFile(resolve(root, "current.json"), "utf8")),
    folder = resolve(root, pointer.corpusVersion),
    manifest = JSON.parse(
      await readFile(resolve(folder, "manifest.json"), "utf8"),
    );
  if (JSON.stringify(manifest.embedding) !== JSON.stringify(EMBEDDING))
    throw new Error("Embedding spec mismatch");
  for (const [name, asset] of Object.entries(manifest.assets)) {
    const bytes = await readFile(resolve(folder, asset.path));
    if (bytes.length !== asset.bytes || hash(bytes) !== asset.sha256)
      throw new Error(`Integrity mismatch ${name}`);
    if (name.endsWith("Vectors")) {
      if (bytes.length % 1536) throw new Error("Invalid vector bytes");
      for (let start = 0; start < bytes.length; start += 1536) {
        const vector = Array.from({ length: 384 }, (_, i) =>
          bytes.readFloatLE(start + i * 4),
        );
        validateVector(vector);
      }
    }
  }
  console.log(
    `${corpus}: all artifacts verified; semantic=${manifest.semanticReady}`,
  );
}

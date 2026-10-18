import { mkdir, readFile, writeFile, copyFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { EMBEDDING } from "../packages/knowledge-schema/src/validate.mjs";
import { hash } from "./indexing/content.mjs";
const base = resolve("apps/rag-lab/public");
const entries = [];
const runtimeVersion = JSON.parse(await readFile('node_modules/onnxruntime-web/package.json','utf8')).version;
if (runtimeVersion !== EMBEDDING.onnxRuntimeVersion) throw new Error('Pinned ONNX Runtime version mismatch');
let previous;
try { previous = JSON.parse(await readFile(resolve(base,'models/assets.lock.json'),'utf8')); } catch {}
for (const file of [
  "config.json",
  "tokenizer.json",
  "tokenizer_config.json",
  "special_tokens_map.json",
  "vocab.txt",
  "onnx/model_quantized.onnx",
]) {
  const url = `https://huggingface.co/${EMBEDDING.modelId}/resolve/${EMBEDDING.revision}/${file}`;
  const modelPath = `models/${EMBEDDING.id}/${EMBEDDING.revision}/${EMBEDDING.modelId}/${file}`;
  const output = resolve(base, modelPath);
  const previousFile = previous?.entries?.find(entry => entry.upstream === url);
  await mkdir(resolve(output, ".."), { recursive: true });
  let bytes;
  try {
    bytes = await readFile(output);
  } catch {
    if (previousFile) {
      const priorPath = resolve(base,previousFile.file);
      if (!priorPath.startsWith(resolve(base,'models') + '/')) throw new Error('Invalid cached asset path');
      bytes = await readFile(priorPath);
    } else {
    console.log(`Downloading pinned ${file}`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
    bytes = Buffer.from(await response.arrayBuffer());
    }
  }
  if (bytes.length >= 25 * 1024 * 1024)
    throw new Error("Model asset exceeds Pages limit");
  if (file.endsWith(".onnx") && hash(bytes) !== EMBEDDING.artifactSha256)
    throw new Error("Model checksum mismatch");
  if (previousFile && previousFile.sha256 !== hash(bytes)) throw new Error(`Cached model/tokenizer integrity mismatch: ${file}`);
  await writeFile(output, bytes);
  entries.push({
    file: modelPath,
    bytes: bytes.length,
    sha256: hash(bytes),
    upstream: url,
  });
}
await mkdir(resolve(base, "runtime", EMBEDDING.id, EMBEDDING.onnxRuntimeVersion), { recursive: true });
for (const file of [
  "ort-wasm-simd-threaded.wasm",
  "ort-wasm-simd-threaded.mjs",
  "ort-wasm-simd-threaded.jsep.wasm",
  "ort-wasm-simd-threaded.jsep.mjs",
]) {
  const input = resolve("node_modules/onnxruntime-web/dist", file),
    output = resolve(base, "runtime", EMBEDDING.id, EMBEDDING.onnxRuntimeVersion, file);
  if ((await stat(input)).size >= 25 * 1024 * 1024)
    throw new Error("Runtime asset exceeds Pages limit");
  await copyFile(input, output);
  const bytes = await readFile(input);
  entries.push({
    file: `runtime/${EMBEDDING.id}/${EMBEDDING.onnxRuntimeVersion}/${file}`,
    bytes: bytes.length,
    sha256: hash(bytes),
  });
}
await writeFile(
  resolve(base, "models", "assets.lock.json"),
  JSON.stringify(
    {
      embedding: EMBEDDING,
      onnxRuntime: JSON.parse(
        await readFile("node_modules/onnxruntime-web/package.json", "utf8"),
      ).version,
      entries,
    },
    null,
    2,
  ),
);
await mkdir(resolve(base, "licenses"), { recursive: true });
await copyFile(
  "node_modules/@huggingface/transformers/LICENSE",
  resolve(base, "licenses/Apache-2.0.txt"),
);
const commit = (
  await readFile("node_modules/onnxruntime-web/__commit.txt", "utf8")
).trim();
let licenseText;
try { licenseText = await readFile(resolve(base,'licenses/onnxruntime-MIT.txt'),'utf8'); } catch {}
if (!licenseText) {
const license = await fetch(
  `https://raw.githubusercontent.com/microsoft/onnxruntime/${commit}/LICENSE`,
);
if (!license.ok) throw new Error("ONNX Runtime license unavailable");
licenseText = await license.text();
}
await writeFile(
  resolve(base, "licenses/onnxruntime-MIT.txt"),
  licenseText,
);
await writeFile(
  resolve(base, "licenses/attribution.txt"),
  `Transformers.js 3.8.1: Hugging Face, Apache-2.0.\nMiniLM ONNX conversion: Xenova/all-MiniLM-L6-v2, Apache-2.0; upstream sentence-transformers/all-MiniLM-L6-v2. Revision ${EMBEDDING.revision}.\nONNX Runtime Web: Microsoft, MIT. Commit ${commit}.\n`,
);
console.log(
  `Prepared ${entries.length} local model/runtime assets; no Workers AI calls.`,
);

import { pipeline, env, AutoTokenizer } from "@huggingface/transformers";
import {
  EMBEDDING,
  normalizeText,
  validateVector,
} from "../../knowledge-schema/src/validate.mjs";
let extractor: Promise<any> | undefined;
let tokenizer: Promise<any> | undefined;
let base: string | undefined;
let busy = false;
self.onmessage = async (event: MessageEvent) => {
  const { id, type, text, assetBase, embeddingSpecKey } = event.data;
  if (type !== "embed") return;
  if (busy) {
    self.postMessage({
      id,
      type: "error",
      message: "Embedding already active",
    });
    return;
  }
  busy = true;
  try {
    if (embeddingSpecKey !== JSON.stringify(EMBEDDING)) throw new Error('Embedding specification mismatch');
    if (typeof text !== "string" || text.length > 3000)
      throw new Error("Embedding input too long");
    const root = new URL(assetBase, self.location.origin);
    if (root.origin !== self.location.origin)
      throw new Error("Foreign model asset origin");
    if (base && base !== root.href) throw new Error("Model base cannot change");
    base = root.href;
    env.allowLocalModels = true;
    env.allowRemoteModels = false;
    env.localModelPath = new URL(`models/${EMBEDDING.id}/${EMBEDDING.revision}/`, root).href;
    env.backends.onnx.wasm!.wasmPaths = new URL(
      `runtime/${EMBEDDING.id}/${EMBEDDING.onnxRuntimeVersion}/`,
      root,
    ).href;
    env.backends.onnx.wasm!.numThreads = 1;
    tokenizer ??= AutoTokenizer.from_pretrained(EMBEDDING.modelId, {
      local_files_only: true,
    });
    const tokens = await (
      await tokenizer
    )(normalizeText(text), { truncation: false });
    if (tokens.input_ids.data.length > 256)
      throw new Error("Input exceeds the pinned 256-token embedding limit");
    extractor ??= pipeline("feature-extraction", EMBEDDING.modelId, {
      dtype: "q8",
      device: "wasm",
      local_files_only: true,
      progress_callback: (progress: any) =>
        self.postMessage({
          id,
          type: "progress",
          progress: progress.progress ?? 0,
          status: progress.status,
        }),
    });
    const output = await (
      await extractor
    )(normalizeText(text), {
      pooling: "mean",
      normalize: true,
      truncation: true,
      max_length: 256,
    });
    const vector = Array.from(output.data) as number[];
    validateVector(vector);
    self.postMessage({ id, type: "result", vector, embeddingSpecKey: JSON.stringify(EMBEDDING) });
  } catch (error) {
    extractor = undefined;
    self.postMessage({
      id,
      type: "error",
      message: error instanceof Error ? error.message : "Embedding failed",
    });
  } finally {
    busy = false;
  }
};

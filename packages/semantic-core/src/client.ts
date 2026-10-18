import {EMBEDDING, validateVector} from '../../knowledge-schema/src/validate.mjs';
export class EmbeddingClient {
  private worker?: Worker;
  private pending?: {
    reject: (error: Error) => void;
    timer: ReturnType<typeof setTimeout>;
  };
  constructor(
    private assetBase: string,
    private progress: (message: string) => void,
    private workerPath: string,
  ) {}
  embed(text: string): Promise<Float32Array> {
    const started = performance.now();
    if (this.pending) return Promise.reject(new Error("One query at a time"));
    this.worker ??= new Worker(
      new URL(this.workerPath, new URL(this.assetBase, location.origin)),
      { type: "module" },
    );
    const worker = this.worker;
    const id = crypto.randomUUID();
    return new Promise((resolve, reject) => {
      const fail = (error: Error) => {
        this.dispose();
        reject(error);
      };
      const timer = setTimeout(
        () =>
          fail(
            new Error(
              "Model initialization timed out. Lexical search remains available.",
            ),
          ),
        30000,
      );
      this.pending = { reject, timer };
      worker.onerror = () => fail(new Error("Embedding worker unavailable"));
      worker.onmessage = (event) => {
        if (event.data.id !== id) return;
        if (event.data.type === "progress")
          this.progress(
            `Loading local semantic model${event.data.progress ? `: ${Math.round(event.data.progress)}%` : ""}…`,
          );
        if (event.data.type === "error") fail(new Error(event.data.message));
        if (event.data.type === "result") {
          if (event.data.embeddingSpecKey !== JSON.stringify(EMBEDDING)) { fail(new Error('Embedding worker version mismatch')); return; }
          try { validateVector(event.data.vector); } catch { fail(new Error('Invalid embedding result')); return; }
          clearTimeout(timer);
          this.pending = undefined;
          performance.measure("pace-rag:embedding", {
            start: started,
            end: performance.now(),
          });
          resolve(new Float32Array(event.data.vector));
        }
      };
      worker.postMessage({
        id,
        type: "embed",
        text,
        assetBase: this.assetBase,
        embeddingSpecKey: JSON.stringify(EMBEDDING),
      });
    });
  }
  dispose() {
    if (this.pending) {
      clearTimeout(this.pending.timer);
      this.pending.reject(new Error("Semantic search cancelled"));
      this.pending = undefined;
    }
    this.worker?.terminate();
    this.worker = undefined;
  }
}

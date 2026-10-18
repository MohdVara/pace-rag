import { defineConfig } from "vite";
export default defineConfig({
  base: "/pace-rag/",
  publicDir: false,
  build: {
    outDir: "output/embedding-worker",
    emptyOutDir: true,
    rollupOptions: {
      input: "packages/semantic-core/src/embedding.worker.ts",
      output: { entryFileNames: "assets/embedding-worker-[hash].js" },
    },
  },
});

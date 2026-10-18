import { defineConfig } from "vite";
export default defineConfig({
  root: "apps/rag-lab",
  base: "/pace-rag/",
  publicDir: "public",
  build: { outDir: "../../dist/lab", emptyOutDir: true },
  worker: { format: "es" },
  server: { fs: { allow: ["../.."] } },
});

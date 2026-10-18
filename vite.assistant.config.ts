import { defineConfig } from "vite";
export default defineConfig({
  base: "/pace-rag/",
  publicDir: false,
  build: {
    outDir: "packages/portfolio-assistant/dist",
    emptyOutDir: true,
    lib: {
      entry: "packages/portfolio-assistant/src/Assistant.tsx",
      formats: ["es"],
      fileName: "assistant",
    },
    rollupOptions: { external: ["react", "react/jsx-runtime"] },
    cssCodeSplit: false,
  },
  worker: { format: "es" },
});

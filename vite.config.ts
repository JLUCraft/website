import { defineConfig } from "vite";
import { resolve } from "node:path";

/** 三个入口：首页、使用文档、JLMUA 落地页（暂时寄生在 /jlmua）。 */
export default defineConfig({
  root: "web",
  base: "/",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "web/index.html"),
        docs: resolve(import.meta.dirname, "web/docs/index.html"),
        jlmua: resolve(import.meta.dirname, "web/jlmua/index.html"),
      },
    },
  },
});

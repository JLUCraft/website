import { defineConfig } from "vite";
import { resolve } from "node:path";

import { applyMeta } from "./web/page-meta";

/** 三个入口：首页、使用文档、JLMUA 落地页（暂时寄生在 /jlmua）。 */
export default defineConfig({
  root: "web",
  base: "/",
  plugins: [
    {
      // 入口 HTML 只写占位符，标题/描述/canonical 由 locale 注入，避免两套文案。
      name: "jlucraft-page-meta",
      transformIndexHtml(html: string) {
        return applyMeta(html);
      },
    },
  ],
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

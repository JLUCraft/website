/**
 * 页面结构约定：三个静态入口、地址唯一来源、文档锚点不悬空、
 * 入口 HTML 里不写字面文案（标题/描述/canonical 由 web/page-meta.ts 注入）。
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { applyMeta, metaFor } from "../web/page-meta";
import { PAGES, SITE } from "../web/site";

const WEB = join(import.meta.dirname, "..", "web");

const ENTRIES: { page: keyof typeof PAGES; file: string }[] = [
  { page: "home", file: "index.html" },
  { page: "docs", file: "docs/index.html" },
  { page: "jlmua", file: "jlmua/index.html" },
];

function read(path: string): string {
  return readFileSync(join(WEB, path), "utf8");
}

test("三个入口与 PAGES 一一对应，且都声明了页面标识", () => {
  assert.deepEqual(Object.keys(PAGES).sort(), ["docs", "home", "jlmua"]);
  for (const entry of ENTRIES) {
    const html = read(entry.file);
    assert.match(html, new RegExp(`data-page="${entry.page}"`), `${entry.file} 缺少 data-page`);
    assert.match(html, /<html lang="zh-CN">/);
  }
});

test("入口 HTML 只放占位符，不写人类文案", () => {
  for (const entry of ENTRIES) {
    const html = read(entry.file);
    for (const token of ["%PAGE_TITLE%", "%PAGE_DESCRIPTION%", "%PAGE_CANONICAL%"]) {
      assert.ok(html.includes(token), `${entry.file} 缺少占位符 ${token}`);
    }
    assert.equal(
      /[\u4e00-\u9fff]/.test(html),
      false,
      `${entry.file} 里还有中文字面量，文案应写在 locales/zh-CN.ts`,
    );
    assert.equal(/https?:\/\//.test(html), false, `${entry.file} 里还有硬编码地址`);
  }
});

test("注入后的标题、描述、canonical 与页面元数据一致", () => {
  for (const entry of ENTRIES) {
    const meta = metaFor(entry.page);
    const html = applyMeta(read(entry.file));
    assert.ok(html.includes(`<title>${meta.title}</title>`), `${entry.file} 标题未注入`);
    assert.ok(html.includes(meta.description), `${entry.file} 描述未注入`);
    assert.ok(html.includes(`href="${meta.canonical}"`), `${entry.file} canonical 未注入`);
    assert.equal(
      meta.canonical,
      `${SITE.origin}${PAGES[entry.page]}`,
      `${entry.page} 的 canonical 应由 PAGES 推出`,
    );
  }
});

test("外部地址全部是 https，且来自 site.ts 单一清单", () => {
  const collect = (value: unknown, path = "SITE"): [string, string][] => {
    if (typeof value === "string") return [[path, value]];
    if (value && typeof value === "object") {
      return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
        collect(child, `${path}.${key}`),
      );
    }
    return [];
  };

  for (const [path, url] of collect(SITE)) {
    assert.match(url, /^https:\/\//, `${path} 必须是 https：${url}`);
  }
});

test("页面源码里不出现硬编码的绝对地址", () => {
  const sources = ["pages/home.tsx", "pages/docs.tsx", "pages/jlmua.tsx", "components/shell.tsx"];
  for (const name of sources) {
    const source = readFileSync(join(WEB, name), "utf8");
    const urls = source.match(/https?:\/\/[^\s"'`)]+/g) ?? [];
    assert.deepEqual(urls, [], `${name} 直接写了地址：${urls.join(", ")}`);
  }
});

test("文档页目录里的每个锚点都有对应的小节", () => {
  const source = read("pages/docs.tsx");
  const tocIds = [...source.matchAll(/\{ id: "([a-z-]+)", title:/g)].map((m) => m[1]);
  assert.ok(tocIds.length >= 5, `目录条目太少：${tocIds.join(", ")}`);
  for (const id of tocIds) {
    assert.ok(source.includes(`id="${id}"`), `目录里的 ${id} 没有对应小节`);
  }
});

test("JLMUA 页面标注了寄生状态与迁出计划", () => {
  const source = read("pages/jlmua.tsx");
  assert.ok(source.includes('t("筹备中")'), "缺少筹备中标记");
  assert.ok(
    source.includes('t("这一页暂时寄生在 www.jlucraft.com 之下，独立站点就绪后会迁出。")'),
  );
});

test("落地页不再声称运维文档在仓库里（实际只在本地 docs/）", () => {
  const locale = read("locales/zh-CN.ts");
  assert.ok(
    !locale.includes("部署与运维说明在各仓库内"),
    "这句话不准确：部署指南在本地 docs/，没有公开在仓库里",
  );
  assert.ok(locale.includes("部署与运维文档由各校负责人持有"));
});

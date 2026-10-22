/**
 * 页面结构约定：三个静态入口、地址唯一来源、规范链接一致、文档锚点不悬空。
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { PAGES, SITE } from "../web/site";

const WEB = join(import.meta.dirname, "..", "web");

const ENTRIES: { page: string; file: string; canonical: string }[] = [
  { page: "home", file: "index.html", canonical: `${SITE.origin}/` },
  { page: "docs", file: "docs/index.html", canonical: `${SITE.origin}/docs/` },
  { page: "jlmua", file: "jlmua/index.html", canonical: `${SITE.origin}/jlmua/` },
];

function read(path: string): string {
  return readFileSync(join(WEB, path), "utf8");
}

test("三个入口与 PAGES 一一对应，且文件都存在", () => {
  assert.deepEqual(Object.keys(PAGES).sort(), ["docs", "home", "jlmua"]);
  for (const entry of ENTRIES) {
    const html = read(entry.file);
    assert.match(html, new RegExp(`data-page="${entry.page}"`), `${entry.file} 缺少 data-page`);
    assert.match(html, /<html lang="zh-CN">/);
    assert.match(html, /<title>[^<]+<\/title>/);
    assert.ok(
      /name="description"\s+content="/.test(html),
      `${entry.file} 缺少 description`,
    );
  }
});

test("每个入口的 canonical 与本页路径一致", () => {
  for (const entry of ENTRIES) {
    assert.ok(
      read(entry.file).includes(`href="${entry.canonical}"`),
      `${entry.file} 的 canonical 应为 ${entry.canonical}`,
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
  for (const dir of ["pages", "components"]) {
    for (const name of ["home.tsx", "docs.tsx", "jlmua.tsx", "shell.tsx"]) {
      const path = join(WEB, dir, name);
      if (!existsSync(path)) continue;
      const source = readFileSync(path, "utf8");
      const urls = source.match(/https?:\/\/[^\s"'`)]+/g) ?? [];
      assert.deepEqual(urls, [], `${dir}/${name} 直接写了地址：${urls.join(", ")}`);
    }
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
  assert.ok(source.includes("t(\"筹备中\")"), "缺少筹备中标记");
  assert.ok(source.includes("t(\"这一页暂时寄生在 www.jlucraft.com 之下，独立站点就绪后会迁出。\")"));
});

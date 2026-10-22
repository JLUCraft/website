/**
 * 样式约定：颜色与尺寸只来自生成的 tokens.css；brand.css 只做变量映射，
 * 不写字面色值、不重复声明令牌。
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const THEME = join(import.meta.dirname, "..", ".vitepress", "theme");
const TOKENS = readFileSync(join(THEME, "tokens.css"), "utf8");
const BRAND = readFileSync(join(THEME, "brand.css"), "utf8");

/** 只认行首的声明，避免把 .VPButton 之类的类名当成令牌。 */
function declared(css: string): Set<string> {
  return new Set([...css.matchAll(/^\s*--([a-z0-9-]+)\s*:/gm)].map((m) => m[1]));
}

test("tokens.css 是生成文件，且同时支持媒体查询与 .dark 两种深色切换", () => {
  assert.ok(TOKENS.includes("生成文件，请勿手改"));
  assert.ok(TOKENS.includes("brand-palette"));
  assert.ok(TOKENS.includes("@media (prefers-color-scheme: dark)"));
  assert.ok(TOKENS.includes(".dark {"), "VitePress 用 class 切深色，必须有 .dark 块");
  for (const token of ["brand-500", "brand-base", "bg", "ink", "primary", "on-primary"]) {
    assert.ok(TOKENS.includes(`--${token}:`), `缺少 --${token}`);
  }
});

test("brand.css 只做映射：零字面色值", () => {
  const literals = [
    ...BRAND.matchAll(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/g),
  ].map((m) => m[0]);
  assert.deepEqual(literals, [], `brand.css 出现字面颜色：${literals.join(", ")}`);
});

test("brand.css 不重复声明品牌令牌", () => {
  const generated = declared(TOKENS);
  const duplicated = [...declared(BRAND)].filter(
    (name) => generated.has(name) && !name.startsWith("vp-"),
  );
  assert.deepEqual(duplicated, [], `这些令牌应由 tokens.css 提供：${duplicated.join(", ")}`);
});

test("brand.css 引用的每个令牌都有定义（生成令牌或本文件的局部变量）", () => {
  const defined = new Set([...declared(TOKENS), ...declared(BRAND)]);
  const used = new Set([...BRAND.matchAll(/var\(--([a-z0-9-]+)\)/g)].map((m) => m[1]));
  const missing = [...used].filter((name) => !defined.has(name));
  assert.deepEqual(missing, [], `未定义的令牌：${missing.join(", ")}`);
});

test("深色模式不写两套：brand.css 里不出现分模式的颜色覆盖", () => {
  assert.equal(
    /\.dark\s*\{[^}]*#[0-9a-f]/i.test(BRAND),
    false,
    "深色值应来自 tokens.css 的 .dark 块，而不是在这里重复",
  );
});

test("关键的 VitePress 变量都接到了品牌令牌", () => {
  for (const name of [
    "--vp-c-brand-1",
    "--vp-c-bg",
    "--vp-c-text-1",
    "--vp-button-brand-bg",
    "--vp-button-brand-text",
    "--vp-font-family-base",
  ]) {
    assert.match(
      BRAND,
      new RegExp(`${name}:\\s*var\\(--`),
      `${name} 应映射到品牌令牌`,
    );
  }
});

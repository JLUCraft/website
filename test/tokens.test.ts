/**
 * 令牌约定：颜色与尺寸只来自生成的 tokens.css；style.css 只写布局与映射，
 * 不重复声明令牌、不出现字面色值，也不留断链的 var()。
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const WEB = join(import.meta.dirname, "..", "web");
const TOKENS = readFileSync(join(WEB, "tokens.css"), "utf8");
const STYLE = readFileSync(join(WEB, "style.css"), "utf8");

/** 只认行首的声明，避免把 .button--primary:hover 这类 BEM 类名当成令牌。 */
function declared(css: string): Set<string> {
  return new Set([...css.matchAll(/^\s*--([a-z0-9-]+)\s*:/gm)].map((m) => m[1]));
}

test("tokens.css 是生成文件，且带深浅两套模式与品牌色阶", () => {
  assert.ok(TOKENS.includes("生成文件，请勿手改"));
  assert.ok(TOKENS.includes("brand-palette"));
  assert.ok(TOKENS.includes("@media (prefers-color-scheme: dark)"));
  for (const token of ["brand-50", "brand-500", "brand-950", "brand-base"]) {
    assert.ok(TOKENS.includes(`--${token}:`), `缺少 --${token}`);
  }
});

test("站点用到的每个令牌都由 tokens.css 提供", () => {
  const generated = declared(TOKENS);
  const local = declared(STYLE);
  const duplicated = [...local].filter((name) => generated.has(name));
  assert.deepEqual(duplicated, [], `不得重复声明生成令牌：${duplicated.join(", ")}`);
  assert.equal(local.size, 0, `style.css 不应声明任何自定义属性：${[...local].join(", ")}`);
});

test("style.css 不出现字面色值", () => {
  const literals = [...STYLE.matchAll(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g)].map((m) => m[0]);
  assert.deepEqual(literals, []);
});

test("样式里引用的每个令牌都有定义", () => {
  const defined = declared(TOKENS);
  const used = new Set([...STYLE.matchAll(/var\(--([a-z0-9-]+)\)/g)].map((m) => m[1]));
  const missing = [...used].filter((name) => !defined.has(name));
  assert.deepEqual(missing, [], `未定义的令牌：${missing.join(", ")}`);
});

test("可交互元素的触摸目标不小于令牌里的最小尺寸", () => {
  assert.ok(TOKENS.includes("--touch-target: 44px"));
  // 按钮、导航、页脚链接都显式使用 min-height: var(--touch-target)
  const uses = [...STYLE.matchAll(/min-height:\s*var\(--touch-target\)/g)].length;
  assert.ok(uses >= 5, `至少 5 处控件声明了触摸目标，实际 ${uses} 处`);
});

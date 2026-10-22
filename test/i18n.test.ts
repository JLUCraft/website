/**
 * 国际化约定：所有界面文案进 locales/zh-CN.ts，页面里只出现 t('…')/tf('…')，
 * JSX 里不出现裸中文字面量；反过来，语言文件里也不留没人用的键。
 */

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import messages from "../web/locales/zh-CN";

const WEB = join(import.meta.dirname, "..", "web");

function sources(): { name: string; code: string }[] {
  return readdirSync(WEB, { recursive: true, encoding: "utf8" })
    .filter((name) => name.endsWith(".tsx") || name.endsWith(".ts"))
    .filter((name) => !name.startsWith("locales/"))
    .map((name) => ({ name, code: readFileSync(join(WEB, name), "utf8") }));
}

function stripComments(code: string): string {
  return code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}

const KEYS = Object.keys(messages);
const ALL = sources();

test("语言文件里没有空值，键与值都是非空字符串", () => {
  for (const key of KEYS) {
    assert.ok(key.trim().length > 0, "存在空键");
    const value = (messages as Record<string, string>)[key];
    assert.equal(typeof value, "string");
    assert.ok(value.trim().length > 0, `${key} 的译文为空`);
  }
});

test("页面里用到的每个键都在语言文件里", () => {
  const used = new Set<string>();
  for (const { code } of ALL) {
    for (const match of stripComments(code).matchAll(/\btf?\(\s*(["'])((?:\\.|(?!\1).)*)\1/g)) {
      used.add(match[2].replace(/\\(["'\\])/g, "$1"));
    }
  }
  assert.ok(used.size > 40, `只找到 ${used.size} 个键，扫描逻辑可能失效`);
  const missing = [...used].filter((key) => !KEYS.includes(key));
  assert.deepEqual(missing, [], `语言文件缺少这些键：${missing.join(" / ")}`);
});

test("语言文件里的每个键都在源码里出现过（没有僵尸文案）", () => {
  const corpus = ALL.map((entry) => stripComments(entry.code)).join("\n");
  const unused = KEYS.filter((key) => !corpus.includes(key));
  assert.deepEqual(unused, [], `这些键没人引用：${unused.join(" / ")}`);
});

test("JSX 里没有裸中文：文案必须走 t()", () => {
  const offenders: string[] = [];
  for (const { name, code } of ALL) {
    if (!name.endsWith(".tsx")) continue;
    const body = stripComments(code);
    for (const match of body.matchAll(/>([^<>{}]*[\u4e00-\u9fff][^<>{}]*)</g)) {
      offenders.push(`${name}: ${match[1].trim()}`);
    }
  }
  assert.deepEqual(offenders, [], `未走 i18n 的文案：\n${offenders.join("\n")}`);
});

test("aria-label 等无障碍文本同样来自语言文件", () => {
  for (const { name, code } of ALL) {
    if (!name.endsWith(".tsx")) continue;
    for (const match of code.matchAll(/aria-label="([^"]*)"/g)) {
      assert.match(
        match[1],
        /^\{t\("/,
        `${name} 的 aria-label 写成了字面量：${match[1]}`,
      );
    }
  }
});

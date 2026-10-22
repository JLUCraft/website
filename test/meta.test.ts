/**
 * 页面元数据（title / description / canonical）的唯一来源校验。
 *
 * 这些是爬虫和分享卡片直接读的东西：既不能与页面文案脱节，也不能在 HTML 里
 * 各写一份。构建期的注入逻辑在这里被直接调用，所以不依赖 dist/。
 */

import assert from "node:assert/strict";
import test from "node:test";

import messages from "../web/locales/zh-CN";
import { applyMeta, metaFor, pageOf } from "../web/page-meta";

const PAGES = ["home", "docs", "jlmua"] as const;
const VALUES = Object.values(messages) as string[];

test("每个页面都有非空的标题与描述，且文案来自语言文件", () => {
  for (const page of PAGES) {
    const meta = metaFor(page);
    assert.ok(meta.title.trim().length > 0, `${page} 标题为空`);
    assert.ok(meta.description.trim().length > 0, `${page} 描述为空`);
    assert.ok(
      VALUES.includes(meta.title),
      `${page} 的标题不是语言文件里的值：${meta.title}`,
    );
    assert.ok(
      VALUES.includes(meta.description),
      `${page} 的描述不是语言文件里的值：${meta.description}`,
    );
  }
});

test("标题互不相同，且都带站点名", () => {
  const titles = PAGES.map((page) => metaFor(page).title);
  assert.equal(new Set(titles).size, titles.length, "页面标题重复会伤害搜索与分享");
  for (const title of titles) {
    assert.match(title, /JLUCraft/);
  }
});

test("描述长度适合搜索摘要（40–120 字符）", () => {
  for (const page of PAGES) {
    const { description } = metaFor(page);
    assert.ok(
      description.length >= 20 && description.length <= 120,
      `${page} 的描述长度 ${description.length} 不适合做搜索摘要`,
    );
  }
});

test("注入会替换全部占位符；未知页面或残留占位符直接失败", () => {
  const html = `<body data-page="docs"><title>%PAGE_TITLE%</title><meta content="%PAGE_DESCRIPTION%"><link href="%PAGE_CANONICAL%">`;
  const injected = applyMeta(html);
  assert.equal(injected.includes("%PAGE_"), false);
  assert.ok(injected.includes(metaFor("docs").title));

  assert.throws(() => applyMeta(`<body data-page="nope"></body>`), /缺少有效的 data-page/);
  assert.throws(() => applyMeta(`<title>%PAGE_SOMETHING%</title>`), /缺少有效的 data-page/);
  assert.throws(() => pageOf("<body></body>"), /缺少有效的 data-page/);
});

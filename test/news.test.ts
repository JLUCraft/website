/**
 * 动态与订阅源：正文在 content/news/*.md，列表与 RSS 都由它派生。
 * 这里锁住「排序、字段、RSS 结构与转义」这几处容易静默出错的地方。
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { readNews, toRss } from "../.vitepress/news";
import { SITE } from "../.vitepress/site";

const ROOT = join(import.meta.dirname, "..");
const CONTENT = join(ROOT, "content");
const CONFIG = readFileSync(join(ROOT, ".vitepress", "config.ts"), "utf8");

test("动态按日期倒序，且每篇都有标题、描述与 .html 地址", () => {
  const posts = readNews(CONTENT);
  assert.ok(posts.length >= 2, `动态太少：${posts.length}`);
  for (const post of posts) {
    assert.ok(post.title, `${post.slug} 缺少标题`);
    assert.ok(post.description.length >= 20, `${post.slug} 描述太短`);
    assert.match(post.url, /^\/news\/[a-z0-9-]+\.html$/);
    assert.match(post.date, /^\d{4}-\d{2}-\d{2}$/);
  }
  const dates = posts.map((p) => p.date);
  assert.deepEqual(dates, [...dates].sort((a, b) => (a < b ? 1 : -1)), "应严格倒序");
});

test("RSS 是合法结构的 2.0，且覆盖全部动态", () => {
  const posts = readNews(CONTENT);
  const xml = toRss(posts, { origin: SITE.origin, title: "JLUCraft 动态" });
  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.match(xml, /<rss version="2\.0"/);
  assert.match(xml, /<atom:link href="https:\/\/www\.jlucraft\.com\/feed\.xml"/);
  const items = xml.match(/<item>/g) ?? [];
  assert.equal(items.length, posts.length, "item 数与动态数不一致");
  for (const post of posts) {
    assert.ok(xml.includes(`${SITE.origin}${post.url}`), `feed 缺少 ${post.url}`);
    assert.ok(xml.includes(`<title>${post.title}</title>`), `feed 缺少标题 ${post.title}`);
  }
  // pubDate 必须是 RFC 822（RSS 2.0 要求）
  assert.match(xml, /<pubDate>[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT<\/pubDate>/);
});

test("RSS 对标题/描述里的 XML 特殊字符做转义", () => {
  const xml = toRss(
    [{ slug: "x", url: "/news/x.html", title: "A & B <tag>", description: '"q"', date: "2026-01-01" }],
    { origin: SITE.origin, title: "T" },
  );
  assert.ok(xml.includes("A &amp; B &lt;tag&gt;"));
  assert.ok(!/[^&]& /.test(xml), "裸 & 未转义");
});

test("配置挂上了 feed.xml 生成、RSS alternate 与徽标图标", () => {
  assert.match(CONFIG, /buildEnd\(/);
  assert.match(CONFIG, /"feed\.xml"/);
  assert.match(CONFIG, /rel:\s*"alternate"[^\n]*application\/rss\+xml/);
  assert.match(CONFIG, /favicon-32\.png/);
  assert.match(CONFIG, /apple-touch-icon/);
});

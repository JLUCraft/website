/**
 * 动态（news）的读取与订阅源生成。
 *
 * 正文仍写在 content/news/*.md；这里只做两件构建期的事：
 * - 读出标题/描述/日期，供列表页与 RSS 复用；
 * - 生成 feed.xml（RSS 2.0），供站外订阅。
 * 站点文案没有第二处来源，日期只认 frontmatter 的 `date`。
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export interface NewsPost {
  /** 文件 slug（去掉 .md），用于稳定排序与 guid。 */
  slug: string;
  /** 站内可访问路径，与 cleanUrls:false 的 `.html` 规则一致。 */
  url: string;
  title: string;
  description: string;
  /** ISO 日期（YYYY-MM-DD）。 */
  date: string;
  tag?: string;
}

const FRONTMATTER = /^---\n([\s\S]*?)\n---/;

function parseFrontmatter(source: string): Record<string, string> {
  const match = FRONTMATTER.exec(source);
  if (!match) return {};
  const fields: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const field = /^([a-zA-Z]+):\s*(.*)$/.exec(line);
    if (field) fields[field[1]] = field[2].replace(/^["']|["']$/g, "").trim();
  }
  return fields;
}

/** 读取 content/news 下除 index.md 外的全部文章，按日期倒序。 */
export function readNews(contentDir: string): NewsPost[] {
  const dir = join(contentDir, "news");
  let files: string[];
  try {
    files = readdirSync(dir).filter((name) => name.endsWith(".md") && name !== "index.md");
  } catch {
    return [];
  }

  const posts = files.map((name) => {
    const slug = name.replace(/\.md$/, "");
    const fields = parseFrontmatter(readFileSync(join(dir, name), "utf8"));
    return {
      slug,
      url: `/news/${slug}.html`,
      title: fields.title ?? slug,
      description: fields.description ?? "",
      date: fields.date ?? "1970-01-01",
      ...(fields.tag ? { tag: fields.tag } : {}),
    } satisfies NewsPost;
  });

  return posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RSS 的 pubDate 必须是 RFC 822；用 UTC 零点，避免时区导致日界漂移。 */
function rfc822(date: string): string {
  const value = new Date(`${date}T00:00:00Z`);
  return value.toUTCString();
}

export function toRss(posts: NewsPost[], site: { origin: string; title: string }): string {
  const items = posts
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${site.origin}${post.url}</link>
      <guid isPermaLink="true">${site.origin}${post.url}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${rfc822(post.date)}</pubDate>
    </item>`
    )
    .join("\n");

  const lastBuild = posts.length > 0 ? rfc822(posts[0].date) : rfc822("1970-01-01");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.title)}</title>
    <link>${site.origin}/news/</link>
    <description>${escapeXml(site.title)}的最新动态</description>
    <language>zh-CN</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${site.origin}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}

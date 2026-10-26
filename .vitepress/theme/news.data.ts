import { createContentLoader } from "vitepress";

export interface NewsPost {
  url: string;
  title: string;
  description: string;
  /** ISO 日期（YYYY-MM-DD）。frontmatter 里可能被解析成 Date，这里统一成字符串。 */
  date: string;
  tag?: string;
}

declare const data: NewsPost[];
export { data };

function isoDate(value: unknown): string {
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime())
    ? "1970-01-01"
    : date.toISOString().slice(0, 10);
}

export default createContentLoader("news/*.md", {
  transform(raw): NewsPost[] {
    return raw
      .filter((page) => page.url !== "/news/")
      .map((page) => ({
        url: page.url,
        title: page.frontmatter.title,
        description: page.frontmatter.description,
        date: isoDate(page.frontmatter.date),
        ...(page.frontmatter.tag ? { tag: page.frontmatter.tag } : {}),
      }))
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  },
});

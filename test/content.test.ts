/**
 * 内容约定：Markdown 是唯一的正文来源。
 *
 * 检查的是"写的内容上线后会坏"的几类问题：内部链接指向不存在的页面、外链跑到
 * 未审计的域名、页面缺标题/描述、侧边栏链接悬空。
 */

import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import test from "node:test";

import { ALLOWED_EXTERNAL_HOSTS, SITE } from "../.vitepress/site";

const ROOT = join(import.meta.dirname, "..");
const CONTENT = join(ROOT, "content");

function markdownFiles(): string[] {
  return readdirSync(CONTENT, { recursive: true, encoding: "utf8" })
    .filter((name) => name.endsWith(".md"))
    .sort();
}

function read(file: string): string {
  return readFileSync(join(CONTENT, file), "utf8");
}

function frontmatter(source: string): Record<string, string> {
  const match = /^---\n([\s\S]*?)\n---/.exec(source);
  if (!match) return {};
  const fields: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const field = /^([a-z][a-zA-Z]*):\s*(.*)$/.exec(line);
    if (field) fields[field[1]] = field[2].replace(/^["']|["']$/g, "");
  }
  return fields;
}

/** 把站内链接解析成 content/ 下的真实文件。 */
function resolveInternal(link: string): string | null {
  const path = link.split("#")[0].split("?")[0];
  if (!path.startsWith("/")) return null;
  const rel = path.replace(/^\//, "");
  const candidates = rel === "" || rel.endsWith("/")
    ? [`${rel}index.md`]
    : [`${rel}.md`, `${rel}/index.md`, rel];
  return candidates.find((candidate) => existsSync(join(CONTENT, candidate))) ?? null;
}

const FILES = markdownFiles();

test("必需的页面都在", () => {
  for (const page of [
    "index.md",
    "about/index.md",
    "links/index.md",
    "docs/index.md",
    "docs/register.md",
    "docs/launcher.md",
    "docs/server.md",
    "docs/servers.md",
    "docs/skins.md",
    "docs/faq.md",
    "tech/index.md",
    "tech/identity.md",
    "tech/protocol.md",
    "tech/nodes.md",
    "tech/network.md",
    "tech/skin-station.md",
    "tech/clients.md",
    "tech/league.md",
    "tech/office.md",
    "tech/deploy.md",
    "tech/branding.md",
    "jlmua/index.md",
  ]) {
    assert.ok(FILES.includes(page), `缺少 ${page}`);
  }
});

test("每个页面都有标题与描述（搜索与分享卡片直接读它们）", () => {
  for (const file of FILES) {
    const fields = frontmatter(read(file));
    assert.ok(fields.title, `${file} 缺少 frontmatter title`);
    assert.ok(fields.description, `${file} 缺少 frontmatter description`);
    assert.ok(
      fields.description.length >= 20 && fields.description.length <= 120,
      `${file} 的描述长度 ${fields.description.length} 不适合做搜索摘要`,
    );
  }
});

test("站内链接都指向真实页面", () => {
  for (const file of FILES) {
    const source = read(file);
    const links = [...source.matchAll(/\]\((\/[^)\s]*)\)/g)].map((m) => m[1]);
    for (const link of links) {
      assert.ok(
        resolveInternal(link),
        `${file} 里的站内链接 ${link} 没有对应页面`,
      );
    }
  }
});

test("外链只能是 https，且域名在审计清单里", () => {
  for (const file of FILES) {
    // 代码示例里的 <占位地址> 不是链接，跳过
    const urls = (read(file).match(/https?:\/\/[^\s)"'>\]]+/g) ?? []).filter(
      (url) => !url.includes("<"),
    );
    for (const url of urls) {
      assert.match(url, /^https:\/\//, `${file} 里有非 https 地址：${url}`);
      const host = new URL(url).host;
      assert.ok(
        (ALLOWED_EXTERNAL_HOSTS as readonly string[]).includes(host),
        `${file} 引用了未登记的域名：${host}`,
      );
    }
  }
});

test("站内链接一律用相对路径，不写本站的绝对地址", () => {
  const origin = new URL(SITE.origin).host;
  for (const file of FILES) {
    const absolute = [...read(file).matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)]
      .map((match) => match[1])
      .filter((url) => new URL(url).host === origin);
    assert.deepEqual(
      absolute,
      [],
      `${file} 里用绝对地址链接本站：${absolute.join(", ")}，请改成 /docs/ 这类相对路径`,
    );
  }
});

test("首页与 JLMUA 的关键链接指向正确目标", () => {
  const home = read("index.md");
  assert.ok(home.includes(SITE.skin), "首页缺少皮肤站入口");
  assert.ok(home.includes(SITE.launcher), "首页缺少启动器下载入口");
  assert.ok(home.includes("layout: page"), "首页使用自定义版式，不走主题的 home 布局");
  assert.ok(home.includes("pageClass: lp-page"), "首页需要 lp-page 页面类来挂自定义版式");
  assert.ok(home.includes("::: lp hero"), "首页主视觉应使用自己的容器，而不是主题 hero");

  const jlmua = read("jlmua/index.md");
  assert.ok(jlmua.includes("吉林省 MC 高校联盟"));
  assert.ok(jlmua.includes("全国 MC 高校联盟"));
  assert.ok(jlmua.includes(SITE.mua.docs), "JLMUA 页缺少 MUA 开发文档链接");
});

test("侧边栏里的链接都能打开，导航用 PAGES 单一来源", () => {
  const config = readFileSync(join(ROOT, ".vitepress", "config.ts"), "utf8");
  const links = [...config.matchAll(/link:\s*"(\/[^"]*)"/g)].map((m) => m[1]);
  assert.ok(links.length >= 7, `只找到 ${links.length} 个侧边栏链接`);
  for (const link of links) {
    assert.ok(resolveInternal(link), `侧边栏里的 ${link} 没有对应页面`);
  }
  // 顶部导航三个入口必须来自 PAGES，避免路径写死在两处
  assert.match(config, /link:\s*PAGES\.home/);
  assert.match(config, /link:\s*PAGES\.docs/);
  assert.match(config, /link:\s*PAGES\.jlmua/);
});

test("落地页用到的每个 lp-* 类都有样式（防手滑写错容器名）", () => {
  const home = read("index.md");
  const brand = readFileSync(join(ROOT, ".vitepress", "theme", "brand.css"), "utf8");

  const containerClasses = new Set<string>();
  for (const line of home.split("\n")) {
    const match = /^:{3,4}\s+lp\s+(.+)$/.exec(line.trim());
    if (!match) continue;
    for (const word of match[1].trim().split(/\s+/)) containerClasses.add(`lp-${word}`);
  }
  assert.ok(containerClasses.size >= 4, `容器类太少：${[...containerClasses].join(", ")}`);

  const attrClasses = new Set(
    [...home.matchAll(/\{ \.(lp-[a-z-]+)/g)].map((match) => match[1]),
  );
  assert.ok(attrClasses.size >= 3, `属性类太少：${[...attrClasses].join(", ")}`);

  for (const name of [...containerClasses, ...attrClasses]) {
    assert.ok(brand.includes(`.${name}`), `${name} 没有对应样式`);
  }
});

test("导航包含皮肤站入口（外链直接指向门户）", () => {
  const config = readFileSync(join(ROOT, ".vitepress", "config.ts"), "utf8");
  assert.ok(config.includes("SITE.skin"), "导航里应包含皮肤站入口");
});

test("文档页都在 sidebar 覆盖范围内", () => {
  const config = readFileSync(join(ROOT, ".vitepress", "config.ts"), "utf8");
  for (const file of FILES) {
    if (!file.startsWith("docs/") && !file.startsWith("tech/")) continue;
    const link = `/${file.replace(/index\.md$/, "").replace(/\.md$/, "")}`;
    assert.ok(
      config.includes(`"${link}"`),
      `${relative(CONTENT, join(CONTENT, file))} 没有出现在侧边栏（期望 ${link}）`,
    );
  }
});

/** 文案直接说事实与做法：不用防御式措辞，也不描述文档本身。 */
const BANNED_PHRASES = [
  "本文",
  "本节",
  "本页",
  "这份文档",
  "这份页面",
  "下面介绍",
  "如上所述",
  "以官方",
  "为准",
  "负责人",
  "管理员公布",
  "未验证",
  "仅供参考",
  "如有疑问",
  "若有疑问",
  "请注意",
  "请勿",
  "不要使用",
  "来路不明",
  "建议",
  "或许",
  "大致",
  "视情况",
  "尽量",
];

test("文案没有防御式措辞与元表述", () => {
  const offenders: string[] = [];
  for (const file of FILES) {
    const source = read(file);
    for (const phrase of BANNED_PHRASES) {
      if (source.includes(phrase)) offenders.push(`${file}: ${phrase}`);
    }
  }
  assert.deepEqual(offenders, [], `这些地方要改成直接陈述：\n${offenders.join("\n")}`);
});

test("三个名词各就各位", () => {
  const home = read("index.md");
  assert.ok(home.includes("吉林大学 Minecraft 同好会"));
  assert.ok(!home.includes("吉林省高校 Minecraft 联合体"), "同好会不是省级联盟");

  const jlmua = read("jlmua/index.md");
  assert.ok(jlmua.includes("吉林省 MC 高校联盟"));
  assert.ok(jlmua.includes("全国 MUA") || jlmua.includes("全国 MC 高校联盟"));

  const tech = read("tech/index.md");
  assert.ok(tech.includes("| 同好会 | JLUCraft，吉林大学 Minecraft 同好会 |"));
  assert.ok(tech.includes("| JLMUA | 吉林省 MC 高校联盟"));
});

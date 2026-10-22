/**
 * 页面标题、描述与 canonical 的唯一来源。
 *
 * 三个入口 HTML 里只有 `%PAGE_TITLE%` / `%PAGE_DESCRIPTION%` / `%PAGE_CANONICAL%`
 * 占位符，构建时由本模块替换。这样润色文案只改 `locales/zh-CN.ts`，不用碰 HTML，
 * 也不会出现「HTML 里一套、页面上另一套」的漂移。
 */

import messages from "./locales/zh-CN";
import { PAGES, SITE, type PageKey } from "./site";

type MessageKey = keyof typeof messages;

const META: Record<PageKey, { title: MessageKey; description: MessageKey }> = {
  home: {
    title: "JLUCraft · 吉林省高校 Minecraft 联合体",
    description:
      "用学校邮箱注册一次，登录全省共用的皮肤站、进入各校的联邦服务器，并与全国 MUA 互通。",
  },
  docs: {
    title: "使用文档 · JLUCraft",
    description:
      "从注册账号、登录启动器到加入联邦服务器，以及皮肤材质与常见问题的排查顺序。",
  },
  jlmua: {
    title: "JLMUA · JLUCraft",
    description:
      "JLMUA 是 JLUCraft 与全国 MUA（Minecraft 高校联盟）对接的部分：联合认证、材质互通与成员义务。",
  },
};

export interface PageMeta {
  page: PageKey;
  title: string;
  description: string;
  canonical: string;
}

export function metaFor(page: PageKey): PageMeta {
  const entry = META[page];
  return {
    page,
    title: messages[entry.title],
    description: messages[entry.description],
    canonical: `${SITE.origin}${PAGES[page]}`,
  };
}

/** 入口 HTML 里声明的页面标识。 */
export function pageOf(html: string): PageKey {
  const match = /data-page="([a-z]+)"/.exec(html);
  const page = match?.[1];
  if (!page || !(page in PAGES)) {
    throw new Error(`入口 HTML 缺少有效的 data-page（实际：${page ?? "无"}）`);
  }
  return page as PageKey;
}

/** 把占位符换成真实文案；有残留说明 HTML 和本模块脱节，直接让构建失败。 */
export function applyMeta(html: string): string {
  const meta = metaFor(pageOf(html));
  const replaced = html
    .replaceAll("%PAGE_TITLE%", meta.title)
    .replaceAll("%PAGE_DESCRIPTION%", meta.description)
    .replaceAll("%PAGE_CANONICAL%", meta.canonical);

  const leftover = replaced.match(/%PAGE_[A-Z]+%/);
  if (leftover) {
    throw new Error(`入口 HTML 里有未替换的占位符：${leftover[0]}`);
  }
  return replaced;
}

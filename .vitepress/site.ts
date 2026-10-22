/**
 * 站点唯一的外部地址清单与页面路径。
 *
 * 导航、首页按钮、页脚从 TS 取；Markdown 正文里的外链直接写地址（内容就是内容），
 * 但 test/content.test.ts 会限制它们只能指向允许的域名。
 */

export const SITE = {
  origin: "https://www.jlucraft.com",
  /** 皮肤站门户：Yggdrasil/OAuth 在站点根路径，玩家界面在 /portal/。 */
  skin: "https://skin.jlucraft.com/portal/",
  launcher: "https://github.com/JLUCraft/FollyLauncher/releases",
  repositories: {
    launcher: "https://github.com/JLUCraft/FollyLauncher",
    "skin-station": "https://github.com/JLUCraft/federated-skinstation",
    "federated-server": "https://github.com/JLUCraft/federated-server",
    "union-core": "https://github.com/JLUCraft/union-core",
    "union-manager": "https://github.com/JLUCraft/union-manager",
    "brand-palette": "https://github.com/JLUCraft/brand-palette",
  },
  mua: {
    docs: "https://docs.mualliance.cn/dev/union",
  },
  /** 首页的搜索描述，也用作站点默认描述。 */
  description:
    "用学校邮箱注册一次，登录全省共用的皮肤站、进入各校的联邦服务器，并与全国 MUA 互通。",
} as const;

export const PAGES = {
  home: "/",
  docs: "/docs/",
  jlmua: "/jlmua/",
} as const;

export type PageKey = keyof typeof PAGES;

/** Markdown 里允许出现的站外域名：数量固定，好审计。 */
export const ALLOWED_EXTERNAL_HOSTS = [
  "skin.jlucraft.com",
  "github.com",
  "docs.mualliance.cn",
] as const;

/**
 * 页面在站点上的真实路径。VitePress 默认 cleanUrls: false，
 * 所以除目录首页外都是 `.html`；canonical 必须与可访问路径一致。
 */
export function canonicalFor(relativePath: string): string {
  const url = relativePath.endsWith("index.md")
    ? relativePath.replace(/index\.md$/, "")
    : relativePath.replace(/\.md$/, ".html");
  return `${SITE.origin}/${url}`;
}

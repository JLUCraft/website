/**
 * 站点唯一的外部地址清单与页面路径。
 *
 * 名词约定（不要在页面里混用）：
 * - JLUCraft：吉林大学 Minecraft 同好会（校级社团）
 * - JLMUA：吉林省 MC 高校联盟（省级联盟）
 * - MUA：全国 MC 高校联盟（国家级联盟）
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
    "minecraftd": "https://github.com/JLUCraft/minecraftd",
    "paper-scoring": "https://github.com/JLUCraft/paper-scoring-template",
  },
  mua: {
    docs: "https://docs.mualliance.cn/dev/union",
    site: "https://www.mualliance.cn/",
  },
  community: {
    /** QQ 群号：文案里出现群号的地方都用这一个值。 */
    qqGroup: "361033103",
  },
  /** 首页的搜索描述，也用作站点默认描述。 */
  description:
    "吉林大学 Minecraft 同好会：一个账号走遍同好会服务器、吉林省高校联盟与全国高校联盟。",
} as const;

export const PAGES = {
  home: "/",
  docs: "/docs/",
  tech: "/tech/",
  jlmua: "/jlmua/",
} as const;

export type PageKey = keyof typeof PAGES;

/** Markdown 里允许出现的站外域名：数量固定，好审计。 */
export const ALLOWED_EXTERNAL_HOSTS = [
  "skin.jlucraft.com",
  "github.com",
  "docs.mualliance.cn",
  "www.mualliance.cn",
  "mc.sjtu.cn",
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

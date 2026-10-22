/**
 * 站点内唯一的外部地址与路径清单。
 *
 * 页面里禁止直接写字面 URL：换域名、换仓库、改 portal 路径都只改这里，
 * 测试会检查所有地址都是 https 且页面只从本文件取地址。
 */

export const SITE = {
  /** 本页面的正式来源，用于 canonical 与分享链接。 */
  origin: "https://www.jlucraft.com",
  /** 皮肤站门户（Yggdrasil / OAuth 接口在站点根路径，玩家界面在 /portal/）。 */
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
} as const;

export const PAGES = {
  home: "/",
  docs: "/docs/",
  jlmua: "/jlmua/",
} as const;

export type PageKey = keyof typeof PAGES;

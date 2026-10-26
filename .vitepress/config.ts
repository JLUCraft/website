import container from "markdown-it-container";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitepress";

import { readNews, toRss } from "./news";
import { canonicalFor, PAGES, SITE } from "./site";

const CONTENT_DIR = fileURLToPath(new URL("../content", import.meta.url));

// VitePress 默认从 <srcDir>/public 复制静态文件；本仓库把 public/ 放在仓库根，
// 不显式指定的话 CNAME、.nojekyll 与 favicon 都不会进 dist/。
const PUBLIC_DIR = fileURLToPath(new URL("../public", import.meta.url));

const NAV = [
  { text: "首页", link: PAGES.home },
  { text: "动态", link: PAGES.news, activeMatch: "^/news/" },
  { text: "关于", link: "/about/" },
  { text: "玩家文档", link: PAGES.docs, activeMatch: "^/docs/" },
  { text: "技术文档", link: PAGES.tech, activeMatch: "^/tech/" },
  { text: "JLMUA", link: PAGES.jlmua, activeMatch: "^/jlmua/" },
  // 皮肤站是独立域名，放在导航里省得每次回首页找
  { text: "皮肤站", link: SITE.skin },
];

const PLAYER_SIDEBAR = [
  {
    text: "玩家文档",
    items: [
      { text: "开始之前", link: "/docs/" },
      { text: "注册账号", link: "/docs/register" },
      { text: "安装与登录启动器", link: "/docs/launcher" },
      { text: "进入服务器", link: "/docs/server" },
      { text: "服务器与服务", link: "/docs/servers" },
      { text: "皮肤与材质", link: "/docs/skins" },
      { text: "常见问题", link: "/docs/faq" },
    ],
  },
];

const TECH_SIDEBAR = [
  {
    text: "架构与协议",
    items: [
      { text: "总体架构", link: "/tech/" },
      { text: "身份与设备", link: "/tech/identity" },
      { text: "协议与编码", link: "/tech/protocol" },
      { text: "联邦服务器", link: "/tech/nodes" },
      { text: "网络与中继", link: "/tech/network" },
    ],
  },
  {
    text: "组件与运维",
    items: [
      { text: "皮肤站", link: "/tech/skin-station" },
      { text: "启动器与管理端", link: "/tech/clients" },
      { text: "赛事与计分", link: "/tech/league" },
      { text: "办公与审批", link: "/tech/office" },
      { text: "部署与验收", link: "/tech/deploy" },
      { text: "品牌与配色", link: "/tech/branding" },
    ],
  },
];

export default defineConfig({
  lang: "zh-CN",
  title: "JLUCraft",
  titleTemplate: ":title · JLUCraft",
  description: SITE.description,

  // 自定义域名挂在根路径上；GitHub Pages 不支持无扩展名路由，所以不开 cleanUrls。
  base: "/",
  cleanUrls: false,

  // 站点图标用社团徽标（public/favicon-*.png，由 brand-palette 从 icon.png 缩放）；
  // theme-color 取 tokens.css 的 --bg（浅/深两值），让移动端地址栏与页面同色。
  head: [
    ["link", { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png" }],
    ["link", { rel: "apple-touch-icon", sizes: "180x180", href: "/favicon-180.png" }],
    ["link", { rel: "alternate", type: "application/rss+xml", title: "JLUCraft 动态", href: "/feed.xml" }],
    ["meta", { property: "og:image", content: `${SITE.origin}/favicon-192.png` }],
    [
      "meta",
      { name: "theme-color", media: "(prefers-color-scheme: light)", content: "#f5f7f9" },
    ],
    [
      "meta",
      { name: "theme-color", media: "(prefers-color-scheme: dark)", content: "#151619" },
    ],
    ["meta", { name: "color-scheme", content: "light dark" }],
  ],

  srcDir: "content",
  outDir: "dist",
  publicDir: PUBLIC_DIR,
  cacheDir: ".vitepress/cache",

  // Vite 的静态目录同样默认取 <srcDir>/public；两处都对齐到仓库根的 public/。
  vite: { publicDir: PUBLIC_DIR },

  lastUpdated: false,
  sitemap: { hostname: SITE.origin },

  markdown: {
    config(md) {
      // 落地页的版式需要成组的容器：::: lp hero / ::: lp card …
      // 参数里的每个词变成一个 lp-* 类，正文仍然按 Markdown 解析。
      md.use(container, "lp", {
        validate: (params: string) => /^lp(\s|$)/.test(params.trim()),
        render: (tokens: { info: string; nesting: number }[], index: number) => {
          const params = tokens[index].info.trim().replace(/^lp\s*/, "");
          const classes = params
            .split(/\s+/)
            .filter(Boolean)
            .map((name) => `lp-${name}`)
            .join(" ");
          return tokens[index].nesting === 1
            ? `<section class="${classes}">\n`
            : "</section>\n";
        },
      });
    },
  },

  // 每个页面注入自己的 canonical；路径规则与可访问地址保持一致。
  transformPageData(pageData) {
    pageData.frontmatter.head = [
      ...(pageData.frontmatter.head ?? []),
      ["link", { rel: "canonical", href: canonicalFor(pageData.relativePath) }],
    ];
  },

  // 构建结束后把动态写成 RSS 2.0，GitHub Pages 直接托管 /feed.xml。
  buildEnd(siteConfig) {
    writeFileSync(
      join(siteConfig.outDir, "feed.xml"),
      toRss(readNews(CONTENT_DIR), { origin: SITE.origin, title: "JLUCraft 动态" }),
    );
  },

  themeConfig: {
    siteTitle: "JLUCraft",
    nav: NAV,
    sidebar: { "/docs/": PLAYER_SIDEBAR, "/tech/": TECH_SIDEBAR },
    outline: { level: [2, 3], label: "本页内容" },
    docFooter: { prev: "上一篇", next: "下一篇" },
    darkModeSwitchLabel: "外观",
    lightModeSwitchTitle: "切换到浅色模式",
    darkModeSwitchTitle: "切换到深色模式",
    sidebarMenuLabel: "目录",
    returnToTopLabel: "回到顶部",
    langMenuLabel: "语言",
    externalLinkIcon: true,
    footer: {
      message:
        "吉林大学 Minecraft 同好会 · QQ 群 " +
        SITE.community.qqGroup +
        ' · <a href="/links/">友情链接</a> · <a href="/privacy/">隐私声明</a>',
      copyright: "JLUCraft",
    },
    search: {
      provider: "local",
      options: {
        translations: {
          button: { buttonText: "搜索文档", buttonAriaLabel: "搜索文档" },
          modal: {
            noResultsText: "没有找到结果",
            resetButtonTitle: "清除条件",
            footer: {
              selectText: "选择",
              navigateText: "切换",
              closeText: "关闭",
            },
          },
        },
      },
    },
  },
});

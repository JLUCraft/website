# AGENTS.md — jlucraft-web

`www.jlucraft.com` 落地页：首页、使用文档、JLMUA 落地页（暂时寄生在 `/jlmua`）。
纯静态站点（Vite + React），没有服务端运行时。

## 1. 结构

- 三个入口，各自一个 HTML：`web/index.html`、`web/docs/index.html`、`web/jlmua/index.html`。
  `body[data-page]` 决定渲染哪个页面组件，`web/main.tsx` 是唯一入口。
- 页面组件在 `web/pages/`，共享骨架在 `web/components/shell.tsx`（跳转链接、页头、页脚、区块、步骤）。
- `web/site.ts` 是**地址与路径的唯一来源**：站外链接、`PAGES` 都在这里。页面里禁止写字面 URL。

## 2. 三条硬约束（测试会拦）

1. **颜色与尺寸只来自 `web/tokens.css`**。该文件由 `brand-palette` 仓库生成
   （`bun run palette <emblem.png> --id jlu ...`），本仓库不手改、也不在 `style.css` 里重复声明令牌。
   `style.css` 不出现任何十六进制色值。
2. **所有用户可见文本走 i18n**：`web/locales/zh-CN.ts` 的键是中文原文，页面里只写 `t('…')`/`tf('…')`；
   JSX 里不允许裸中文，`aria-label` 同样必须来自语言文件。
3. **站外链接走 `ExternalLink`**（新窗口 + `rel="noreferrer noopener"` + 屏幕阅读器提示），
   页内链接只用 `PAGES`。

## 3. 约束的动机

- 令牌单一来源：每个学校用自己校徽生成一套 `tokens.css` 就能换品牌，不改组件、不改布局。
- 地址单一来源：`skin.jlucraft.com` 的门户路径是 `/portal/`（站点根路径留给 Yggdrasil/OAuth 接口），
  这类容易被抄错的细节只写一次。
- JLMUA 是寄生页：等独立站点就绪，删掉 `web/jlmua/`、把 `PAGES.jlmua` 指向新域名、
  在反代里加一条跳转即可，正文不用改。

## 4. 验证

```
bun run build && bun run test
```

测试覆盖：生成令牌的标记与完整性、`style.css` 无字面颜色/无重复令牌/无断链 `var()`、
三个入口与 `PAGES` 对应、canonical 与路径一致、外部地址全 https 且只来自 `site.ts`、
文档目录锚点不悬空、i18n 键双向一致（缺键与僵尸文案都会失败）、JSX 无裸中文。

改完页面建议人工看一眼三种宽度（≥1024 / 768 / 390）与深浅两套模式：

```
bun run build && bunx vite preview --port 4173
bunx playwright@latest screenshot --browser chromium --full-page --color-scheme dark http://127.0.0.1:4173/ /tmp/home-dark.png
```

## 5. 部署

`bun run build` 产出 `dist/`：`dist/index.html`、`dist/docs/index.html`、`dist/jlmua/index.html` 与哈希化的
`dist/assets/`。反代只需把 `dist/` 当静态目录，`/docs/`、`/jlmua/` 是目录入口而不是前端路由，
不需要 SPA 回退。nginx 配置与验收命令见 `docs/deployment.md`（本地文档，不在仓库里）。

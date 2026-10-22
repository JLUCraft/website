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

## 5. 部署（GitHub Pages + 自定义域名）

发布物只有 `dist/`，托管在 GitHub Pages，域名解析走 Cloudflare。

- 仓库设置 → Pages → Source 必须选 **GitHub Actions**（不是「分支 + 目录」）。
  `.github/workflows/deploy.yml` 在 `main` 上依次构建、测试、上传 `dist/`、部署。
- 自定义域名由 `web/public/CNAME` 提供（`www.jlucraft.com`），构建时复制进 `dist/`。
  换域名要同时改 `web/site.ts` 的 `origin` 和这个文件，测试会校验两处一致。
- `web/public/.nojekyll` 让 Pages 跳过 Jekyll 处理，否则下划线开头的产物会被过滤。
- `vite.config.ts` 的 `base` 必须是 `/`：`/`、`/docs/`、`/jlmua/` 是真实目录入口，
  不是前端路由，既不需要 404 回退，也不能用相对 `base`。
- 本地预览生产产物：`bun run build && bunx vite preview --port 4173`。
  Cloudflare DNS 与证书的具体步骤见 `docs/deployment.md` §12（本地文档，不入库）。

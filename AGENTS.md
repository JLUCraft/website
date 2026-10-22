# AGENTS.md — jlucraft-web

`www.jlucraft.com`：首页、使用文档、JLMUA 落地页（暂时寄生在 `/jlmua`）。
VitePress 静态站点，正文用 Markdown 写。

## 1. 结构

- `content/` 是全部页面：`index.md`（落地页）、`docs/*.md`（使用文档）、`jlmua/index.md`。
- `.vitepress/config.ts`：导航、侧边栏、站点元信息、Markdown 扩展。
- `.vitepress/site.ts`：**站外地址与页面路径的唯一来源**，导航与测试都从这里读。
- `.vitepress/theme/`：`tokens.css`（生成物）+ `brand.css`（VitePress 变量映射 + 落地页版式）。
- `public/`：`CNAME` 与 `.nojekyll`，构建时复制进 `dist/`。

## 2. 写内容的规矩

- 正文只写在 `content/*.md`。每个页面都要有 frontmatter 的 `title` 与 `description`：
  它们直接进 `<title>` 与搜索/分享卡片。
- 站内链接用相对路径（`/docs/faq`、`/jlmua/`），不要写 `www.jlucraft.com` 的绝对地址。
- 外链只能指向 `.vitepress/site.ts` 登记的域名：皮肤站、GitHub 上的 JLUCraft 仓库、MUA 官方文档。
- 落地页版式用自定义容器，参数里的词就是类名（外层嵌套要多一个冒号）：

  ```
  :::: lp grid
  ::: lp card
  ### 一个皮肤站
  ...
  :::
  ::::
  ```

  行内属性 `{ .lp-title }` 给单块加类。**用到但没写样式的 `lp-*` 类会让测试失败**，
  所以改版式时两边一起改。

## 3. 样式规矩

- 颜色与尺寸只来自生成的 `tokens.css`；`brand.css` 里不允许出现十六进制或 `rgb()/hsl()` 色值。
- 深色模式只写一套：`tokens.css` 的 `.dark` 块会切换变量，`brand.css` 不重复定义深色值。
- 不引入任何外站素材（参考站点的图片、图标、字体一律不复制）。落地页主视觉是纯 CSS 立方体，
  像素网格底纹是渐变，没有任何图片资源。
- 参考站点的版式取向（大主视觉 + 一句主张 + 图标化特性列 + 服务入口卡）可以参考，
  实现必须用自己的类名与令牌。

## 4. 验证

```
bun run build && bun run test
```

`build` 会做死链检查；测试覆盖：生成令牌的标记与完整性、`brand.css` 零字面色值与断链变量、
容器的 `lp-*` 类是否都有样式、站内链接与侧边栏是否悬空、外链域名白名单、
页面 frontmatter、部署配置（CNAME / `.nojekyll` / `dist` / `cleanUrls: false`）、
Dependabot 目录。

本地预览：`bun run dev`（开发）、`bun run preview`（预览构建产物）。

## 5. 部署（GitHub Pages + 自定义域名）

发布物只有 `dist/`，托管在 GitHub Pages，域名解析在 Cloudflare。

- 仓库设置 → Pages → Source 必须选 **GitHub Actions**。
  `.github/workflows/deploy.yml` 在 `main` 上构建、测试、上传 `dist/`、部署。
- 自定义域名由 `public/CNAME` 提供（`www.jlucraft.com`），随产物发布；换域名要同时改
  `.vitepress/site.ts` 的 `origin`，测试会校验两处一致。
- `public/.nojekyll`：Actions 部署不走 Jekyll，这个文件是给「万一退回分支发布」留的保险。
  `upload-pages-artifact` 默认排除点开头的文件，必须配 `include-hidden-files: true` 才会进产物。
- `cleanUrls` 必须保持 `false`：GitHub Pages 不支持无扩展名路由，`/docs/faq` 会 404；
  目录首页（`/`、`/docs/`、`/jlmua/`）不受影响。
- Pages 三个 action 用当前最新 major：`configure-pages@v6`、`upload-pages-artifact@v5`、
  `deploy-pages@v5`，`test/deploy.test.ts` 里登记了版本下限。
- Cloudflare DNS 与证书步骤见 `docs/deployment.md` §12（本地文档，不入库）。

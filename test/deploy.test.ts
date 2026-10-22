/**
 * 部署形态约定：VitePress 构建到 dist/，由 GitHub Pages 托管，域名解析在 Cloudflare。
 * 这里检查的是"能静默上线出错"的配置漂移，而不是替 GitHub 校验 Actions 语法。
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { canonicalFor, SITE } from "../.vitepress/site";

const ROOT = join(import.meta.dirname, "..");
const CONFIG = readFileSync(join(ROOT, ".vitepress", "config.ts"), "utf8");
const WORKFLOW = readFileSync(
  join(ROOT, ".github", "workflows", "deploy.yml"),
  "utf8",
);

test("CNAME 与站点来源的主机名一致（否则 Pages 会用旧域名发证书）", () => {
  const host = new URL(SITE.origin).host;
  const cname = readFileSync(join(ROOT, "public", "CNAME"), "utf8").trim();
  assert.equal(cname, host);
  assert.equal(cname, "www.jlucraft.com");
});

test("public/ 里的 .nojekyll 会被发布（靠 include-hidden-files）", () => {
  assert.equal(readFileSync(join(ROOT, "public", ".nojekyll"), "utf8").trim(), "");
  const start = WORKFLOW.indexOf("uses: actions/upload-pages-artifact@");
  const end = WORKFLOW.indexOf("- name:", start);
  const step = WORKFLOW.slice(start, end === -1 ? undefined : end);
  assert.match(step, /path:\s*dist/);
  assert.match(step, /include-hidden-files:\s*true/, "默认会排除点开头的文件");
});

test("站点以根路径发布，且产物落在 dist/", () => {
  assert.match(CONFIG, /base:\s*["']\/["']/);
  assert.match(CONFIG, /outDir:\s*["']dist["']/);
  assert.match(CONFIG, /srcDir:\s*["']content["']/);
});

test("cleanUrls 必须关闭：GitHub Pages 不支持无扩展名路由", () => {
  assert.match(CONFIG, /cleanUrls:\s*false/);
  assert.equal(canonicalFor("docs/faq.md"), `${SITE.origin}/docs/faq.html`);
  assert.equal(canonicalFor("docs/index.md"), `${SITE.origin}/docs/`);
  assert.equal(canonicalFor("index.md"), `${SITE.origin}/`);
});

test("部署工作流上传 dist/ 并在同一次运行里部署", () => {
  assert.match(WORKFLOW, /actions\/configure-pages@v6/);
  assert.match(WORKFLOW, /actions\/upload-pages-artifact@v5/);
  assert.match(WORKFLOW, /actions\/deploy-pages@v5/);
  assert.match(WORKFLOW, /pages:\s*write/);
  assert.match(WORKFLOW, /id-token:\s*write/);
});

// 版本下限：Dependabot 负责往上提，这里只拦住回退到已知有问题的旧版本。
const ACTION_FLOOR: Record<string, number> = {
  "actions/checkout": 7,
  "oven-sh/setup-bun": 2,
  "actions/configure-pages": 6,
  "actions/upload-pages-artifact": 5,
  "actions/deploy-pages": 5,
};

test("工作流只用登记的 action，且版本不低于下限", () => {
  const refs = [...WORKFLOW.matchAll(/uses:\s*(\S+)/g)].map((m) => m[1]);
  assert.ok(refs.length >= 5);
  for (const ref of refs) {
    const match = /^([^@]+)@v(\d+)$/.exec(ref);
    assert.ok(match, `action 必须用大版本标签：${ref}`);
    const [, name, major] = match;
    assert.ok(name in ACTION_FLOOR, `未登记的 action：${name}`);
    assert.ok(
      Number(major) >= ACTION_FLOOR[name],
      `${name} 低于下限 v${ACTION_FLOOR[name]}（当前 ${ref}）`,
    );
  }
});

test("仓库里没有任何反向代理配置残留", () => {
  const agents = readFileSync(join(ROOT, "AGENTS.md"), "utf8");
  assert.ok(!/nginx|try_files|rsync/i.test(agents), "AGENTS.md 里还有反代部署说明");
});

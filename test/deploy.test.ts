/**
 * 部署形态约定：GitHub Pages + 自定义域名，构建产物是唯一的发布物。
 *
 * 这里检查的是"一旦有人改了域名却忘了改 CNAME / 改成子路径部署"这类会静默
 * 上线出错的配置，而不是替 GitHub 校验 Actions 语法。
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { SITE } from "../web/site";

const ROOT = join(import.meta.dirname, "..");
const PUBLIC = join(ROOT, "web", "public");

test("CNAME 与站点来源的主机名一致（否则 Pages 会用旧域名发证书）", () => {
  const host = new URL(SITE.origin).host;
  const cname = readFileSync(join(PUBLIC, "CNAME"), "utf8").trim();
  assert.equal(cname, host);
  assert.equal(cname, "www.jlucraft.com");
});

test("public/ 里有 .nojekyll，避免 Pages 用 Jekyll 过滤产物", () => {
  const nojekyll = readFileSync(join(PUBLIC, ".nojekyll"), "utf8");
  assert.equal(nojekyll.trim(), "");
});

test("vite 以根路径发布：自定义域名下 /assets 才对得上", () => {
  const config = readFileSync(join(ROOT, "vite.config.ts"), "utf8");
  assert.match(config, /base:\s*["']\/["']/);
  assert.ok(!config.includes('base: "./"'), "不能用相对 base：/docs/ 与 /jlmua/ 会指错");
  assert.match(config, /outDir:\s*["']\.\.\/dist["']/);
});

test("部署工作流把 dist/ 作为 Pages 产物上传，并在同一次运行里部署", () => {
  const workflow = readFileSync(
    join(ROOT, ".github", "workflows", "deploy.yml"),
    "utf8",
  );
  assert.match(workflow, /actions\/configure-pages@v5/);
  assert.match(workflow, /actions\/upload-pages-artifact@v3/);
  assert.match(workflow, /path:\s*dist/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /pages:\s*write/);
  assert.match(workflow, /id-token:\s*write/);
});

test("仓库里没有任何反向代理配置残留", () => {
  const agents = readFileSync(join(ROOT, "AGENTS.md"), "utf8");
  assert.ok(!/nginx|server\s*\{|try_files|rsync/i.test(agents), "AGENTS.md 里还有反代部署说明");
});

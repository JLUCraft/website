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

const WORKFLOW = readFileSync(
  join(ROOT, ".github", "workflows", "deploy.yml"),
  "utf8",
);

test("部署工作流把 dist/ 作为 Pages 产物上传，并在同一次运行里部署", () => {
  assert.match(WORKFLOW, /actions\/configure-pages@v6/);
  assert.match(WORKFLOW, /actions\/upload-pages-artifact@v5/);
  assert.match(WORKFLOW, /actions\/deploy-pages@v5/);
  assert.match(WORKFLOW, /path:\s*dist/);
  assert.match(WORKFLOW, /pages:\s*write/);
  assert.match(WORKFLOW, /id-token:\s*write/);
});

test("hidden 文件进产物：否则 .nojekyll 会被静默丢掉", () => {
  // upload-pages-artifact 默认带 --exclude=.[^/]*，点开头的文件不会打包。
  const start = WORKFLOW.indexOf("uses: actions/upload-pages-artifact@");
  const end = WORKFLOW.indexOf("- name:", start);
  const step = WORKFLOW.slice(start, end === -1 ? undefined : end);
  assert.match(step, /include-hidden-files:\s*true/, "上传步骤缺少 include-hidden-files: true");
  assert.match(step, /path:\s*dist/);
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
  assert.ok(!/nginx|server\s*\{|try_files|rsync/i.test(agents), "AGENTS.md 里还有反代部署说明");
});

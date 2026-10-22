/**
 * Dependabot 配置的路径与实际清单必须对得上：改目录结构后忘了改这里，
 * Dependabot 只会静默地不更新（它不会报错，只会一直不产出 PR）。
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const ROOT = join(import.meta.dirname, "..");
const CONFIG = readFileSync(join(ROOT, ".github", "dependabot.yml"), "utf8");

/** 从配置里取出 (ecosystem, directory) 对；配置很小，用正则足够且免依赖。 */
function entries(): { ecosystem: string; directory: string }[] {
  const out: { ecosystem: string; directory: string }[] = [];
  const pattern = /- package-ecosystem: "([^"]+)"\s*\n\s*directory: "([^"]+)"/g;
  for (const match of CONFIG.matchAll(pattern)) {
    out.push({ ecosystem: match[1], directory: match[2] });
  }
  return out;
}

test("配置能解析出条目，且覆盖 bun 与 github-actions", () => {
  const found = entries();
  assert.ok(found.length >= 2, `只解析出 ${found.length} 条`);
  const ecosystems = found.map((entry) => entry.ecosystem);
  assert.ok(ecosystems.includes("bun"), "缺少 bun 生态");
  assert.ok(ecosystems.includes("github-actions"), "缺少 github-actions 生态");
});

test("每个 directory 都真实存在对应的清单文件", () => {
  const expectedManifest: Record<string, string> = {
    bun: "package.json",
    "github-actions": ".github/workflows",
  };
  for (const { ecosystem, directory } of entries()) {
    const target = join(ROOT, directory, expectedManifest[ecosystem] ?? "");
    assert.ok(existsSync(target), `${ecosystem} 的 ${directory} 下找不到清单：${target}`);
  }
});

test("只跑每周一次、限定并发 PR 数，并合并 minor/patch", () => {
  assert.match(CONFIG, /interval: "weekly"/);
  assert.match(CONFIG, /timezone: "Asia\/Shanghai"/);
  assert.match(CONFIG, /open-pull-requests-limit: \d+/);
  assert.match(CONFIG, /update-types: \["minor", "patch"\]/);
  assert.match(CONFIG, /prefix: "chore\(deps\)"/);
});

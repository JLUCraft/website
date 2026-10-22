---
title: 品牌与配色
description: 从校徽提取主色并生成跨端品牌令牌，统一校验明暗模式对比度，供四个前端直接使用。
---

# 品牌与配色

四个前端共用同一套从校徽提取生成的色彩与尺寸令牌。

## 流程

```sh
cd brand-palette
bun run palette emblem.png --id jlu --name 吉林大学 --out brands/jlu \
  --chakra ../FollyLauncher/src/styles/brand-theme.gen.ts \
  --compose ../union-manager/app/src/main/kotlin/com/jlucraft/manager/nativecore/BrandColors.kt
```

生成器做三件事：

1. 用 OKLab 聚类从校徽里取主色，忽略纸色、阴影与灰阶
2. 按固定亮度曲线生成 50–950 的色阶，交互主色优先取与徽标本色接近的那一级
3. 解析成语义令牌并逐对校验对比度，达不到就沿亮度轴修正，仍达不到则如实报告

## 生成物

| 文件 | 消费方 |
| --- | --- |
| `brands/<id>/brand.json` | 品牌清单，跨端共享 |
| `brands/<id>/tokens.css` | 皮肤站、本站 |
| `--chakra` 输出 | 启动器（Chakra 色阶） |
| `--compose` 输出 | 管理端（Material 3 配色） |

`--check` 会校验这些文件是否与算法一致，可用于发现手工改动。

## 前端接入

- 皮肤站与本站只用 `var(--token)`，不在样式里写色值
- 启动器把色阶挂到 `colors.brand` 与语义令牌
- 管理端 `Theme.kt` 只选择浅色/深色两套，色值全部来自生成文件

深色模式只维护一套语义令牌：`tokens.css` 里同时提供媒体查询与 `.dark` 两种切换方式。

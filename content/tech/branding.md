---
title: 品牌与配色
description: 各端使用已固化的静态品牌令牌，覆盖色阶、语义配色与尺寸。
---

# 品牌与配色

Brand tokens are frozen in static files in each consumer. The palette generator repository has been removed from the workspace. Rebuilding the palette or its generator requires a separate project.

## Static files

| File | Consumer |
| --- | --- |
| `.vitepress/theme/tokens.css` | This website |
| `web/tokens.css` | Skin station |
| `src/styles/brand-theme.gen.ts` | Launcher |
| `app/src/main/kotlin/com/jlucraft/manager/nativecore/BrandColors.kt` | Retired Android app, retained for migration reference |

Existing color values, token names, and theme structures remain unchanged. The original palette used OKLab clustering and contrast checks; its generation commands and consumer regeneration checks are no longer available.

## Frontend integration

- The skin station and website use `var(--token)` for colors and dimensions.
- The launcher exposes its static palette through `colors.brand` and semantic tokens.
- The retired Android app selects light or dark colors from its static `BrandColors.kt` file.

`tokens.css` supports dark mode through both media queries and the `.dark` class. The website checks the static file marker, token coverage, and CSS variable references.

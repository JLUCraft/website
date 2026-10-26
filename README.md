# JLUCraft Website

The VitePress website at https://www.jlucraft.com, with club information, player guides, technical content, news, and the JLMUA introduction page.

## Setup and structure

Published pages live in `content/` and are product content. `.vitepress/site.ts` owns site addresses and page paths. Install dependencies with `bun install --frozen-lockfile`; use `bun run dev` for editing and `bun run preview` to inspect the existing build. GitHub Pages publishes `dist/`; `public/CNAME` declares the public domain.

## Validation

Select one validation channel for a batch and reuse successful results for unchanged inputs. Standard commands:

```sh
bun run build
bun run test
```

Read [AGENTS.md](AGENTS.md) before making changes.

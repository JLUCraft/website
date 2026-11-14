---
title: 部署与验收
description: 皮肤站与联合服务器的启动配置、健康检查接口与全仓库构建验证命令。
---

# 部署与验收

## 组件

| 组件 | 仓库 | 就绪标志 |
| --- | --- | --- |
| 皮肤站 | [union-skinstation](https://github.com/JLUCraft/union-skinstation) | `GET /health/ready` 返回就绪 |
| 联合服务器 | [union-server](https://github.com/JLUCraft/union-server) | `union-server check` 通过 |
| 启动器 | [FollyLauncher](https://github.com/JLUCraft/FollyLauncher) | 登录成功，能拉取实例与材质 |

## 皮肤站

```sh
bun install --frozen-lockfile
bun run build && bun run test
bun run start                 # 监听 127.0.0.1:8080，反代到 443
```

一把 RSA 4096 私钥同时用于材质签名与 `id_token` 签发。更换私钥会使已下发的材质签名全部失效。

## 联合服务器

The host binary embeds the reviewed founder manifest selected by `FOUNDER_MANIFEST`. The manifest contains the approved quorum and founder public identities. Embedded library consumers receive their trust root from the caller.

```sh
FOUNDER_MANIFEST=/absolute/path/to/reviewed-founders.json cargo build --release --locked
union-server check --config /etc/jlucraft/node.json
union-server run --config /etc/jlucraft/node.json
```

主机字段见[联合服务器](/tech/nodes)，网络形态见[网络与中继](/tech/network)。

## 验收

```sh
curl -sf https://skin.jlucraft.com/health/ready
curl -s  https://skin.jlucraft.com/.well-known/openid-configuration | head
curl -s  https://skin.jlucraft.com/api/oauth/jwks | head
```

游戏链路：启动器登录 → 启动游戏 → 进入成员服 → 看到的材质与皮肤站选用的一致。

## 仓库检查

Set `FOUNDER_MANIFEST` when checking the host binary. Isolated host tests use `tests/fixtures/founders.json`; production builds use the approved deployment manifest.

| 仓库 | 命令 |
| --- | --- |
| union-core | `python3 scripts/check-layers.py && cargo fmt --check && cargo clippy --all-targets --locked -- -D warnings && cargo test --locked` |
| union-server | `cargo fmt --check && cargo clippy --all-targets --locked -- -D warnings && cargo test --locked` |
| union-skinstation | `bun run build && bun run test` |
| FollyLauncher | `eslint src --max-warnings=0 && tsc --noEmit && node scripts/locale/index.js diff en` |
| jlucraft-web | `bun run build && bun run test` |

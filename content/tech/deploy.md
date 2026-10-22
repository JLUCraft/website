---
title: 部署与验收
description: 各组件的启动命令、就绪标志与验收命令，以及各仓库的检查命令。
---

# 部署与验收

## 组件

| 组件 | 仓库 | 就绪标志 |
| --- | --- | --- |
| 皮肤站 | [federated-skinstation](https://github.com/JLUCraft/federated-skinstation) | `GET /health/ready` 返回就绪 |
| 联邦服务器 | [federated-server](https://github.com/JLUCraft/federated-server) | `federated-server check` 通过 |
| 启动器 | [FollyLauncher](https://github.com/JLUCraft/FollyLauncher) | 登录成功，能拉取实例与材质 |
| 管理端 | [union-manager](https://github.com/JLUCraft/union-manager) | 设备绑定与身份查看完成 |

## 皮肤站

```sh
bun install --frozen-lockfile
bun run build && bun run test
bun run start                 # 监听 127.0.0.1:8080，反代到 443
```

一把 RSA 4096 私钥同时用于材质签名与 `id_token` 签发。换钥等于让已发出的材质签名作废，
按重大变更处理。

## 联邦服务器

```sh
cargo build --release
federated-server check --config /etc/jlucraft/node.json
federated-server --config /etc/jlucraft/node.json
```

节点字段见[联邦服务器](/tech/nodes)，网络形态见[网络与中继](/tech/network)。

## 验收

```sh
curl -sf https://skin.jlucraft.com/health/ready
curl -s  https://skin.jlucraft.com/.well-known/openid-configuration | head
curl -s  https://skin.jlucraft.com/api/oauth/jwks | head
```

游戏链路：启动器登录 → 启动游戏 → 进入成员服 → 看到的材质与皮肤站选用的一致。

## 仓库检查

| 仓库 | 命令 |
| --- | --- |
| union-core | `python3 scripts/check-layers.py && cargo fmt --check && cargo clippy --all-targets --locked -- -D warnings && cargo test --locked` |
| federated-server | `cargo fmt --check && cargo clippy --all-targets --locked -- -D warnings && cargo test --locked` |
| federated-skinstation | `bun run build && bun run test` |
| FollyLauncher | `eslint src --max-warnings=0 && tsc --noEmit && node scripts/locale/index.js diff en` |
| union-manager | `./scripts/build-native.sh && ./scripts/test-android.sh build` |
| brand-palette | `bun run build && bun run test` |
| jlucraft-web | `bun run build && bun run test` |

---
title: 联邦服务器
description: federated-server 单进程承担身份、目录、中继、赛事网关、成员房间与托管游戏服务端六种角色。
---

# 联邦服务器

`federated-server` 是一个进程承担多种角色，按配置启用：

| 角色 | 作用 |
| --- | --- |
| 身份 | 校验联盟身份、把游戏登录映射到身份日志 |
| 目录 | 提供可用服务列表，供客户端发现 |
| 中继 | 在 NAT 后的玩家与游戏服务端之间转发流量 |
| 赛事网关 | 处理比赛期间的跨社团对局（`league_proxy`） |
| 成员房间 | 社团成员创建的小型联机房间 |
| 托管游戏服务端 | 管理本机 Paper 等游戏服务端的生命周期 |

## 关键配置

```json
{
  "node": {
    "domain": "identity",
    "genesis": "identity-genesis.json",
    "journal": "identity-journal",
    "bootstrap": "https://<主入口地址>",
    "reserve": ["https://<备用入口地址>"],
    "lan_discovery": true
  }
}
```

- `domain`：该节点服务的域（`identity` / `league` / `office`）
- `genesis` / `journal`：日志的起点与落盘位置
- `bootstrap` / `reserve`：与外部互通时的入口地址；NAT 后同样配置
- `lan_discovery`：开启 mDNS 局域网发现，校园网内可以不经公网找到服务器

## 启动自检

`federated-server check` 会读取配置并校验日志、密钥与域设置。
三种常见网络环境的配置写法见部署文档；自检通过再启动，避免带病上线。

## 多机部署

同好会与联盟可以有多台联邦服务器，部署在不同网络里，各自配置。
它们只需要知道同一个皮肤站地址，彼此之间不需要互相配置皮肤站。

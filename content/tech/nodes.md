---
title: 联合服务器
description: union-server 是中心化游戏网关与托管主机，承担原生网关、计分、活动上报与运维监管。
---

# 联合服务器

`union-server` 是中心化的游戏主机，一台进程按配置启用多种角色：

| 角色 | 作用 |
| --- | --- |
| 原生网关 | 完成 RSA 挑战校验与 AES-128-CFB8 加密登录，向皮肤站校验 `hasJoined`，再用 modern forwarding 把身份与材质转给 Paper |
| 计分适配 | 暴露 `POST /v1/score` 等接口，把比赛服的计分结果转发给皮肤站的联赛服务 |
| 活动上报 | 接收比赛服的活动切片，校验后把证据与积分交给皮肤站 |
| 运维监管 | 作为独立进程监管托管实例的启停、备份、部署与命令，由皮肤站 MCP 下发授权 |

## 关键配置

网关、计分与活动适配都在 `services` 下配置，至少启用一项：

```json
{
  "services": {
    "league_proxy": {
      "config": {
        "league": "cup",
        "bind": "0.0.0.0:25565",
        "skin_site": "https://skin.jlucraft.com",
        "session_token": "host.session"
      }
    },
    "scoring": {
      "bind": "127.0.0.1:4238",
      "skin_site": "https://skin.jlucraft.com",
      "session_token": "host.session",
      "token": "paper.token"
    }
  }
}
```

- `bind`：本地监听地址，计分与活动适配必须回环
- `skin_site`：皮肤站地址，主机用其中的 Yggdrasil 会话向中心认证
- 会话令牌与 Paper 令牌放在仓库外，权限 0600

## 启动自检

启动前先执行 `union-server check`，校验配置文件与密钥是否完整一致。

## 中心化部署

同好会与联盟共用一台皮肤站与一台游戏主机。主机只认皮肤站地址，按 `league` 的分配开关网关；比赛服、备用入口与托管实例都在这一套中心下运行，不需要各自配置皮肤站。

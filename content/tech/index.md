---
title: 总体架构
description: 同好会与联盟共用的中心化基础设施分层、核心仓库职责与登录进服数据流。
---

# 总体架构

同好会与联盟共用一套中心化基础设施：一台皮肤站作为唯一权威，一台游戏主机承担网关与托管，启动器与计分插件接入。

| 层 | 组件 | 职责 |
| --- | --- | --- |
| 服务 | [union-skinstation](https://github.com/JLUCraft/union-skinstation) | 中心账号、权限、联赛、赛事、审批、积分、Yggdrasil、MUA 与皮肤 |
| 服务 | [union-server](https://github.com/JLUCraft/union-server) | 中心游戏网关与托管主机：原生网关、计分与活动上报、运维监管 |
| 客户端 | [FollyLauncher](https://github.com/JLUCraft/FollyLauncher) | 玩家入口：登录、材质、实例管理、本地回环代理 |
| 插件 | [paper-scoring-template](https://github.com/JLUCraft/paper-scoring-template) | 比赛服上的计分上报插件 |

`union-core` 仍是独立维护的联合协议库，不在这些产品的运行时内。

Management uses agents and MCP. The Android management app is retired; its repository remains for migration reference.

## 术语

| 名词 | 含义 |
| --- | --- |
| 同好会 | JLUCraft，吉林大学 Minecraft 同好会 |
| JLMUA | 吉林省 MC 高校联盟，同好会所在的省级联盟 |
| MUA | 全国 MC 高校联盟 |
| 身份（identity） | 皮肤站里的账号与角色，加上社团成员与授权记录 |
| 设备（device） | 一台通过设备码授权或通行密钥登录的机器 |
| 联合（union） | 同好会与省联盟共用的中心化基础设施：一台皮肤站加一台游戏主机 |
| 模块（module） | 皮肤站内的业务域，例如账号、联赛、赛事、审批、积分 |

## 主要数据流

1. **登录**：启动器走设备码授权，皮肤站签发 OAuth 令牌与 `id_token`；
   启动器据此向皮肤站换取角色与材质。
2. **进服**：游戏客户端登录时向皮肤站请求 `hasJoined`，游戏主机得到签名过的材质属性；
   玩家的真实身份由皮肤站的账号与社团成员决定。
3. **对局**：客户端经启动器本地回环代理接入游戏网关，网关把流量转发到本机游戏服务端。
4. **跨校互通**：省联盟内共享同一套皮肤站与游戏主机；出省走全国 MUA 规范的成员接口。

## 核心模块

- [身份与设备](/tech/identity)
- [协议与编码](/tech/protocol)
- [部署与验收](/tech/deploy)

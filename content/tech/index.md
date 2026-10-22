---
title: 总体架构
description: 同好会与联盟的基础设施分层、核心仓库职责与登录进服数据流。
---

# 总体架构

同好会与联盟共用一套基础设施，代码分成三层：**共享库**、**服务**、**客户端**。

| 层 | 组件 | 职责 |
| --- | --- | --- |
| 共享库 | [union-core](https://github.com/JLUCraft/union-core) | 协议、身份、状态、日志、联赛、节点、权威、客户端、办公（events/flows）与 LLM 网关 |
| 服务 | [federated-skinstation](https://github.com/JLUCraft/federated-skinstation) | 账号、Yggdrasil 认证、材质、皮肤库、MUA 成员接口 |
| 服务 | [federated-server](https://github.com/JLUCraft/federated-server) | 单进程多角色：身份、目录、中继、赛事网关、成员房间、托管游戏服务端 |
| 客户端 | [FollyLauncher](https://github.com/JLUCraft/FollyLauncher) | 玩家入口：登录、材质、实例管理、本地回环代理 |
| 客户端 | [union-manager](https://github.com/JLUCraft/union-manager) | 社团与管理入口：身份、联赛、房间、办公审批 |
| 工具 | [brand-palette](https://github.com/JLUCraft/brand-palette) | 从校徽生成品牌令牌，供各前端取色 |
| 插件 | [paper-scoring-template](https://github.com/JLUCraft/paper-scoring-template) | 比赛服上的计分上报插件 |

## 术语

| 名词 | 含义 |
| --- | --- |
| 同好会 | JLUCraft，吉林大学 Minecraft 同好会 |
| JLMUA | 吉林省 MC 高校联盟，同好会所在的省级联盟 |
| MUA | 全国 MC 高校联盟 |
| 身份（identity） | 皮肤站里的账号与角色，加上身份日志里的绑定记录 |
| 设备（device） | 一台通过密钥绑定到身份的机器；启动器与管理端都用设备身份 |
| 日志（journal） | 追加式的身份变更记录，可校验、可审计 |
| 联邦（union） | 多台 federated-server 组成的网络，彼此交换身份与服务信息 |
| 域（domain） | 一套独立的日志与状态，例如 `identity`、`league`、`office` |

## 主要数据流

1. **登录**：启动器走设备码授权，皮肤站签发 OAuth 令牌与 `id_token`；
   启动器据此向皮肤站换取角色与材质。
2. **进服**：游戏客户端登录时向皮肤站请求 `hasJoined`，服务器得到签名过的材质属性；
   玩家的真实身份由身份日志里的绑定决定。
3. **服务发现**：客户端向联邦服务器请求目录（`DirectoryRequest`），拿到可用的服务记录。
4. **跨校互通**：省联盟内的请求由皮肤站与联邦服务器处理；出省走全国 MUA 规范的成员接口。

## 核心模块

- [身份与设备](/tech/identity)
- [协议与编码](/tech/protocol)
- [部署与验收](/tech/deploy)

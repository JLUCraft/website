---
title: 启动器与管理端
description: 启动器是玩家入口，管理面改由 agent + MCP，Android 管理端已停用。
---

# 启动器与管理端

## FollyLauncher（玩家入口）

- **技术栈**：Tauri + React/Next + Chakra UI，Rust 侧负责游戏实例、下载与网络
- **认证**：内置同好会的皮肤站登录，支持 MUA 成员的客户端 ID 手动添加
- **本地回环代理**：把游戏流量放进加密隧道，见[网络与中继](/tech/network)
- **实例与任务**：多游戏目录、多实例、下载任务队列、日志窗口
- **扩展与 MCP**：扩展系统与本地 MCP 服务，供自动化与工具调用
- **品牌**：产品名、深链 scheme、标识符来自 `brands/<id>/brand.json`，换学校只换数据

## Management

Management uses agents and MCP. 管理员 agent 通过皮肤站 OAuth 认证，MCP 网关转发已授权的请求；中心权限与逐调用审计负责授权。

The Android `union-manager` app is retired. Its directory and Git history remain for migration reference.

## 登录与授权校验

启动器用设备码流程向皮肤站换取令牌，通行密钥可在浏览器侧登录。每次请求带皮肤站签发的令牌，服务端校验令牌的签名、时效、受众与撤销状态，并核对社团成员，拒绝无令牌或仅靠字段自报的请求。

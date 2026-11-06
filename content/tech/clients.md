---
title: 启动器与管理端
description: 启动器是玩家入口，管理面改由 agent + MCP，Android 管理端已停用。
---

# 启动器与管理端

## FollyLauncher（玩家入口）

- **技术栈**：Tauri + React/Next + Chakra UI，Rust 侧负责游戏实例、下载与网络
- **认证**：内置同好会的认证服务器，支持 MUA 成员的客户端 ID 手动添加
- **本地回环代理**：把游戏流量放进联邦隧道，见[网络与中继](/tech/network)
- **实例与任务**：多游戏目录、多实例、下载任务队列、日志窗口
- **扩展与 MCP**：扩展系统与本地 MCP 服务，供自动化与工具调用
- **品牌**：产品名、深链 scheme、标识符来自 `brands/<id>/brand.json`，换学校只换数据

## Management

Management uses agents and MCP. `jlucraft-agent` creates keys and signs commands and identity records locally; the MCP gateway forwards signed requests to the service.

The Android `union-manager` app is retired. Its directory and Git history remain for migration reference.

## 设备签名校验

客户端用本机设备私钥签名每一次请求，服务端按身份日志里的公钥与背书记录核验来源社团和机器身份，拒绝无签名或仅靠字段自报的请求。

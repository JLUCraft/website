---
title: 协议与编码
description: 中心契约以皮肤站 shared/contracts 的 JSON Schema 为唯一权威，为服务生成 TypeScript、为主机生成 Rust 类型。
---

# 协议与编码

## 单一权威

中心产品的契约只在一处定义：`union-skinstation/shared/contracts/*.schema.json`，用 JSON Schema 描述。
服务端据此生成 TypeScript 类型，游戏主机用 `typify` 生成 Rust 类型，不手写镜像。

## 消息家族

- **计分**：比赛服会话、记分与结算请求
- **活动**：活动切片、证据与上报确认
- **运维**：托管实例的状态查询、启停、备份与部署
- **身份**：账号、社团成员、角色与授权

## 错误处理

库代码用 `thiserror` 定义错误枚举，不使用 `unwrap`/`panic`。
服务在边界处把错误翻译成 HTTP 状态码或帧级错误，客户端只拿到可展示的原因。

## 版本

- 游戏侧协议版本由部署配置决定，比赛服与游戏主机必须一致。
- 契约新增字段用可选值，删除字段前先停止写入。

---
title: 协议与编码
description: protobuf（prost）是唯一权威的 schema，需要审计的治理状态用 JSON，两者通过 JsonFrame 衔接。
---

# 协议与编码

## 单一权威

协议 schema 只在一处定义：`union-core/crates/protocol/src/lib.rs`，用 prost 标注的 Rust 结构体。
其他语言或组件的类型从这里生成。

## 两种编码

| 用途 | 编码 | 原因 |
| --- | --- | --- |
| 传输 | protobuf（prost） | 紧凑、有类型、可演进 |
| 需要审计与可哈希的治理状态 | JSON（serde_json） | 人能读、哈希稳定、便于比对 |
| 两者衔接 | `JsonFrame` | 让 JSON 载荷搭在 protobuf 帧里，避免发明第三种编码 |

## 消息家族

- **目录**（`DirectoryRequest` / `DirectoryResponse` / `ServiceRecord`）：查询与下发可用服务列表
- **会话**（`OpenRequest` / `OpenResponse` / `GameSession` / `RoomMetadata`）：建立与描述游戏会话
- **操作**（`OpsRequest` / `OpsResponse` / `OpsInstance`）：托管实例的状态查询与启停控制
- **LLM 网关**（`LlmRequest` / `LlmFrame` / `LlmUsage`）：办公与智能体调用请求及用量统计
- **日志**（`Cid` / `IpldLink`）：内容寻址与哈希链引用类型

## 错误处理

库代码用 `thiserror` 定义错误枚举，不使用 `unwrap`/`panic`。
服务在边界处把错误翻译成 HTTP 状态码或帧级错误，客户端只拿到可展示的原因。

## 版本

- 游戏侧协议版本由部署配置决定，比赛服与联邦服务器必须一致。
- 应用侧帧结构保持向后兼容：新增字段用可选值，删除字段前先停止写入。
